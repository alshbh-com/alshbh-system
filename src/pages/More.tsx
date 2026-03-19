import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Shield, Settings, LogOut, FolderKanban, Wallet, Server, ListTodo } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: FolderKanban, label: "المشاريع", path: "/projects", color: "text-neon-cyan" },
  { icon: Users, label: "العملاء", path: "/clients", color: "text-neon-violet" },
  { icon: Wallet, label: "المالية", path: "/finance", color: "text-neon-green" },
  { icon: Server, label: "الخدمات", path: "/services", color: "text-neon-orange" },
  { icon: ListTodo, label: "المهام", path: "/tasks", color: "text-neon-pink" },
  { icon: Shield, label: "سجل الأمان", path: "/security", color: "text-neon-cyan" },
  { icon: Settings, label: "الإعدادات", path: "/settings", color: "text-muted-foreground" },
];

export default function More() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">المزيد</h1>
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(item.path)}
            className="glass-card p-4 w-full flex items-center gap-3 text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          onClick={signOut}
          className="glass-card p-4 w-full flex items-center gap-3 text-right"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <span className="font-medium text-destructive">تسجيل الخروج</span>
        </motion.button>
      </div>
    </div>
  );
}
