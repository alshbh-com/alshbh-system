import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Users, Wallet, TrendingUp, AlertCircle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalIncome: number;
  totalExpense: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalIncome: 0,
    totalExpense: 0,
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [projects, clients, transactions] = await Promise.all([
        supabase.from("projects").select("id, status"),
        supabase.from("clients").select("id"),
        supabase.from("transactions").select("type, amount"),
      ]);

      const totalIncome = (transactions.data || [])
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = (transactions.data || [])
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0);

      setStats({
        totalProjects: projects.data?.length || 0,
        activeProjects: projects.data?.filter((p) => p.status === "active").length || 0,
        totalClients: clients.data?.length || 0,
        totalIncome,
        totalExpense,
      });
    }
    load();
  }, [user]);

  const cards = [
    {
      label: "المشاريع",
      value: stats.totalProjects,
      sub: `${stats.activeProjects} نشط`,
      icon: FolderKanban,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
    },
    {
      label: "العملاء",
      value: stats.totalClients,
      icon: Users,
      color: "text-neon-violet",
      bg: "bg-neon-violet/10",
    },
    {
      label: "الدخل",
      value: `${stats.totalIncome.toLocaleString()} ر.س`,
      icon: TrendingUp,
      color: "text-neon-green",
      bg: "bg-neon-green/10",
    },
    {
      label: "الأرباح",
      value: `${(stats.totalIncome - stats.totalExpense).toLocaleString()} ر.س`,
      icon: Wallet,
      color: "text-neon-orange",
      bg: "bg-neon-orange/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {cards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-lg font-bold">{card.value}</p>
              {card.sub && <p className="text-xs text-muted-foreground">{card.sub}</p>}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="h-5 w-5 text-neon-orange shrink-0" />
          <p className="text-sm">ابدأ بإضافة عملاء ومشاريع لرؤية الإحصائيات الكاملة</p>
        </div>
      </motion.div>
    </div>
  );
}
