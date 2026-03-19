import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, ListTodo, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-neon-cyan/20 text-neon-cyan",
  high: "bg-neon-orange/20 text-neon-orange",
  urgent: "bg-destructive/20 text-destructive",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const statusIcons: Record<string, any> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const statusLabels: Record<string, string> = {
  todo: "قيد الانتظار",
  in_progress: "قيد التنفيذ",
  done: "مكتملة",
};

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", due_date: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.title) return;
    await supabase.from("tasks").insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      due_date: form.due_date || null,
    });
    setForm({ title: "", description: "", priority: "medium", due_date: "" });
    setDialogOpen(false);
    toast({ title: "تم إضافة المهمة" });
    load();
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    await supabase.from("tasks").update({ status: next }).eq("id", task.id);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    toast({ title: "تم حذف المهمة" });
    load();
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const isOverdue = (date: string | null, status: string) => {
    if (!date || status === "done") return false;
    return new Date(date).getTime() < Date.now();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">المهام</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="neon-glow gap-1"><Plus className="h-4 w-4" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md">
            <DialogHeader><DialogTitle>مهمة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="عنوان المهمة" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-muted/50" />
              <Input placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-muted/50" />
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الموعد النهائي</label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-muted/50" dir="ltr" />
              </div>
              <Button onClick={handleAdd} className="w-full neon-glow">إضافة المهمة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ key: "all", label: "الكل" }, { key: "todo", label: "انتظار" }, { key: "in_progress", label: "تنفيذ" }, { key: "done", label: "مكتملة" }].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد مهام</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => {
              const StatusIcon = statusIcons[task.status];
              const overdue = isOverdue(task.due_date, task.status);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`glass-card p-3 ${overdue ? "border-destructive/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleStatus(task)} className="mt-0.5 shrink-0">
                      <StatusIcon className={`h-5 w-5 ${task.status === "done" ? "text-neon-green" : task.status === "in_progress" ? "text-neon-cyan" : "text-muted-foreground"}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{statusLabels[task.status]}</span>
                        {task.due_date && (
                          <span className={`text-[10px] flex items-center gap-0.5 ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {overdue && <AlertTriangle className="h-3 w-3" />}
                            {task.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
