import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderKanban, Users, Wallet } from "lucide-react";

const options = [
  { icon: FolderKanban, label: "مشروع جديد", path: "/projects", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { icon: Users, label: "عميل جديد", path: "/clients", color: "text-neon-violet", bg: "bg-neon-violet/10" },
  { icon: Wallet, label: "عملية مالية", path: "/finance", color: "text-neon-green", bg: "bg-neon-green/10" },
];

export default function AddNew() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">إضافة جديد</h1>
      <div className="grid gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={opt.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(opt.path)}
            className="glass-card p-6 flex items-center gap-4 text-right neon-border"
          >
            <div className={`w-14 h-14 rounded-2xl ${opt.bg} flex items-center justify-center`}>
              <opt.icon className={`h-7 w-7 ${opt.color}`} />
            </div>
            <span className="text-lg font-semibold">{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
