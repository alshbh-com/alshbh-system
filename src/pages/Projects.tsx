import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", status: "active", price: "", paid: "", category: "", notes: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });
    setProjects((data as any) || []);
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
    });
    setForm({ name: "", status: "active", price: "", paid: "", category: "", notes: "" });
    setDialogOpen(false);
    toast({ title: "تم إضافة المشروع بنجاح" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    toast({ title: "تم حذف المشروع" });
    load();
  };

  const filtered = projects.filter((p) => p.name.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">المشاريع</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="neon-glow gap-1">
              <Plus className="h-4 w-4" /> إضافة
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle>مشروع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="اسم المشروع" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/50" />
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="paused">متوقف</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="السعر" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-muted/50" dir="ltr" />
                <Input placeholder="المدفوع" type="number" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} className="bg-muted/50" dir="ltr" />
              </div>
              <Input placeholder="التصنيف" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-muted/50" />
              <Input placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-muted/50" />
              <Button onClick={handleAdd} className="w-full neon-glow">إضافة المشروع</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-muted/50" />
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center text-muted-foreground">
            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد مشاريع</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((project) => (
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {project.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-sm font-bold text-neon-green">{Number(project.paid).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">من {Number(project.price).toLocaleString()}</p>
                  </div>
                </div>
                {project.notes && <p className="text-xs text-muted-foreground mt-2">{project.notes}</p>}
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleDelete(project.id)}>
                    حذف
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
