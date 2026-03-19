import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Users, Wallet, TrendingUp, ListTodo, Server, AlertTriangle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalIncome: number;
  totalExpense: number;
  pendingTasks: number;
  expiringServices: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0, activeProjects: 0, totalClients: 0,
    totalIncome: 0, totalExpense: 0, pendingTasks: 0, expiringServices: 0,
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [projects, clients, transactions, tasks, services] = await Promise.all([
        supabase.from("projects").select("id, status"),
        supabase.from("clients").select("id"),
        supabase.from("transactions").select("type, amount"),
        supabase.from("tasks").select("id, status"),
        supabase.from("services").select("id, expire_date"),
      ]);

      const totalIncome = (transactions.data || []).filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = (transactions.data || []).filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      const pendingTasks = (tasks.data || []).filter((t) => t.status !== "done").length;
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const expiringServices = (services.data || []).filter((s) => {
        if (!s.expire_date) return false;
        const diff = new Date(s.expire_date).getTime() - now;
        return diff < thirtyDays;
      }).length;

      setStats({
        totalProjects: projects.data?.length || 0,
        activeProjects: projects.data?.filter((p) => p.status === "active").length || 0,
        totalClients: clients.data?.length || 0,
        totalIncome, totalExpense, pendingTasks, expiringServices,
      });
    }
    load();
  }, [user]);

  const cards = [
    { label: "المشاريع", value: stats.totalProjects, sub: `${stats.activeProjects} نشط`, icon: FolderKanban, color: "text-neon-cyan", bg: "bg-neon-cyan/10", path: "/projects" },
    { label: "العملاء", value: stats.totalClients, icon: Users, color: "text-neon-violet", bg: "bg-neon-violet/10", path: "/clients" },
    { label: "الدخل", value: `${stats.totalIncome.toLocaleString()} ج.م`, icon: TrendingUp, color: "text-neon-green", bg: "bg-neon-green/10", path: "/finance" },
    { label: "الأرباح", value: `${(stats.totalIncome - stats.totalExpense).toLocaleString()} ج.م`, icon: Wallet, color: "text-neon-orange", bg: "bg-neon-orange/10", path: "/finance" },
    { label: "المهام المعلقة", value: stats.pendingTasks, icon: ListTodo, color: "text-neon-pink", bg: "bg-neon-pink/10", path: "/tasks" },
    { label: "الخدمات", value: stats.expiringServices > 0 ? `${stats.expiringServices} تنبيه` : "جيد", icon: Server, color: stats.expiringServices > 0 ? "text-destructive" : "text-neon-green", bg: stats.expiringServices > 0 ? "bg-destructive/10" : "bg-neon-green/10", path: "/services" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">مرحباً 👋</h1>
          <p className="text-sm text-muted-foreground">لوحة التحكم</p>
        </div>
        <div className="md:hidden">
          <div className="w-10 h-10 rounded-xl bg-primary/10 neon-border flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <button onClick={() => navigate(card.path)} className="glass-card p-4 space-y-3 w-full text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-lg font-bold">{card.value}</p>
              {card.sub && <p className="text-xs text-muted-foreground">{card.sub}</p>}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {stats.expiringServices > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-4 border-neon-orange/30 cursor-pointer" onClick={() => navigate("/services")}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-neon-orange shrink-0" />
            <p className="text-sm">{stats.expiringServices} خدمة تنتهي خلال 30 يوم</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
