import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FolderKanban, Paperclip, Upload, File, Image, FileText, Trash2, Download, Users, Edit2, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Client { id: string; name: string; }

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  category: string | null;
  price: number;
  paid: number;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  client_id: string | null;
  clients?: { name: string } | null;
}

const statusColors: Record<string, string> = {
  active: "bg-neon-green/20 text-neon-green",
  completed: "bg-neon-cyan/20 text-neon-cyan",
  paused: "bg-neon-orange/20 text-neon-orange",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  completed: "مكتمل",
  paused: "متوقف",
  cancelled: "ملغى",
};

function getFileIcon(type: string | null) {
  if (!type) return File;
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf")) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", status: "active", price: "", paid: "", category: "", notes: "", client_id: "", start_date: "", end_date: "" });

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // Files
  const [filesDialogId, setFilesDialogId] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("projects").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    setProjects((p as any) || []);
    setClients(c || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) return;
    await supabase.from("projects").insert({
      user_id: user.id,
      name: form.name,
      status: form.status,
      price: Number(form.price) || 0,
      paid: Number(form.paid) || 0,
      category: form.category || null,
      notes: form.notes || null,
      client_id: form.client_id || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
    setForm({ name: "", status: "active", price: "", paid: "", category: "", notes: "", client_id: "", start_date: "", end_date: "" });
    setDialogOpen(false);
    toast({ title: "تم إضافة المشروع بنجاح" });
    load();
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name, status: p.status, price: String(p.price), paid: String(p.paid),
      category: p.category || "", notes: p.notes || "", client_id: p.client_id || "",
      start_date: p.start_date || "", end_date: p.end_date || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name) return;
    await supabase.from("projects").update({
      name: editForm.name, status: editForm.status,
      price: Number(editForm.price) || 0, paid: Number(editForm.paid) || 0,
      category: editForm.category || null, notes: editForm.notes || null,
      client_id: editForm.client_id || null,
      start_date: editForm.start_date || null, end_date: editForm.end_date || null,
    }).eq("id", editingId);
    setEditingId(null);
    toast({ title: "تم تحديث المشروع" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    toast({ title: "تم حذف المشروع" });
    load();
  };

  // Files
  const loadFiles = async (projectId: string) => {
    const { data } = await supabase.from("project_files").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    setProjectFiles(data || []);
  };

  const openFiles = (projectId: string) => {
    setFilesDialogId(projectId);
    loadFiles(projectId);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !filesDialogId || !e.target.files?.length) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const path = `${user.id}/${filesDialogId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("project-files").upload(path, file);
      if (!uploadError) {
        await supabase.from("project_files").insert({
          user_id: user.id,
          project_id: filesDialogId,
          file_name: file.name,
          file_path: path,
          file_type: file.type,
          file_size: file.size,
        });
      }
    }
    setUploading(false);
    toast({ title: "تم رفع الملفات" });
    loadFiles(filesDialogId);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (file: ProjectFile) => {
    const { data } = await supabase.storage.from("project-files").createSignedUrl(file.file_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    await supabase.storage.from("project-files").remove([file.file_path]);
    await supabase.from("project_files").delete().eq("id", file.id);
    toast({ title: "تم حذف الملف" });
    if (filesDialogId) loadFiles(filesDialogId);
  };

  const filtered = projects.filter((p) => p.name.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">المشاريع</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="neon-glow gap-1"><Plus className="h-4 w-4" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>مشروع جديد</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="اسم المشروع" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/50" />
              <Select value={form.client_id || "none"} onValueChange={(v) => setForm({ ...form, client_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-muted/50"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون عميل</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="paused">متوقف</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغى</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="السعر" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-muted/50" dir="ltr" />
                <Input placeholder="المدفوع" type="number" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} className="bg-muted/50" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">تاريخ البداية</label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="bg-muted/50" dir="ltr" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">تاريخ النهاية</label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="bg-muted/50" dir="ltr" />
                </div>
              </div>
              <Input placeholder="التصنيف" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-muted/50" />
              <Input placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-muted/50" />
              <Button onClick={handleAdd} className="w-full neon-glow">إضافة المشروع</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-muted/50" />
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center text-muted-foreground">
            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد مشاريع</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((project) => {
              const isEditing = editingId === project.id;

              if (isEditing) {
                return (
                  <motion.div key={project.id} layout className="glass-card p-4 space-y-3">
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-muted/50" />
                    <Select value={editForm.client_id || "none"} onValueChange={(v) => setEditForm({ ...editForm, client_id: v === "none" ? "" : v })}>
                      <SelectTrigger className="bg-muted/50"><SelectValue placeholder="العميل" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون عميل</SelectItem>
                        {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="paused">متوقف</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغى</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="السعر" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="bg-muted/50" dir="ltr" />
                      <Input placeholder="المدفوع" type="number" value={editForm.paid} onChange={(e) => setEditForm({ ...editForm, paid: e.target.value })} className="bg-muted/50" dir="ltr" />
                    </div>
                    <Input placeholder="ملاحظات" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="bg-muted/50" />
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm" className="neon-glow gap-1 flex-1"><Check className="h-4 w-4" /> حفظ</Button>
                      <Button onClick={() => setEditingId(null)} variant="ghost" size="sm"><X className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`glass-card p-4 ${project.status === "active" ? "animate-neon-pulse" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
                          {statusLabels[project.status]}
                        </span>
                        {project.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{project.category}</span>
                        )}
                        {project.clients?.name && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-violet/10 text-neon-violet flex items-center gap-0.5">
                            <Users className="h-2.5 w-2.5" /> {project.clients.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <p className="text-sm font-bold text-neon-green">{Number(project.paid).toLocaleString()} ج.م</p>
                      <p className="text-[10px] text-muted-foreground">من {Number(project.price).toLocaleString()}</p>
                    </div>
                  </div>
                  {project.notes && <p className="text-xs text-muted-foreground mt-2">{project.notes}</p>}
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => openFiles(project.id)}>
                      <Paperclip className="h-3.5 w-3.5" /> ملفات
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => startEdit(project)}>
                      <Edit2 className="h-3.5 w-3.5" /> تعديل
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleDelete(project.id)}>
                      حذف
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Files Dialog */}
      <Dialog open={!!filesDialogId} onOpenChange={(open) => !open && setFilesDialogId(null)}>
        <DialogContent className="glass-card border-border/50 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Paperclip className="h-5 w-5" /> ملفات المشروع</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{uploading ? "جاري الرفع..." : "اضغط لرفع ملفات"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">صور • PDF • أكواد • مستندات</p>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />

            {projectFiles.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">لا توجد ملفات</p>
            ) : (
              <div className="space-y-2">
                {projectFiles.map((file) => {
                  const FileIcon = getFileIcon(file.file_type);
                  return (
                    <div key={file.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                      <FileIcon className="h-5 w-5 text-neon-cyan shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.file_name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(file)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteFile(file)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
