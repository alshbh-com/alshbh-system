import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderKanban, Users, Wallet, Server, ListTodo } from "lucide-react";

const options = [
  { icon: FolderKanban, label: "مشروع جديد", path: "/projects", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { icon: Users, label: "عميل جديد", path: "/clients", color: "text-neon-violet", bg: "bg-neon-violet/10" },
  { icon: Wallet, label: "عملية مالية", path: "/finance", color: "text-neon-green", bg: "bg-neon-green/10" },
  { icon: Server, label: "خدمة جديدة", path: "/services", color: "text-neon-orange", bg: "bg-neon-orange/10" },
  { icon: ListTodo, label: "مهمة جديدة", path: "/tasks", color: "text-neon-pink", bg: "bg-neon-pink/10" },
];

export default function AddNew() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">إضافة جديد</h1>
      <div className="grid gap-3">
        {options.map((opt, i) => (
          <motion.button
            key={opt.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(opt.path)}
            className="glass-card p-5 flex items-center gap-4 text-right neon-border"
          >
            <div className={`w-12 h-12 rounded-2xl ${opt.bg} flex items-center justify-center`}>
              <opt.icon className={`h-6 w-6 ${opt.color}`} />
            </div>
            <span className="text-base font-semibold">{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
