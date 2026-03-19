import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Palette, Lock, LogOut, Info, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { icon: User, label: "الحساب", desc: user?.email || "", color: "text-neon-cyan", action: () => {} },
    { icon: Shield, label: "سجل الأمان", desc: "عرض سجلات الدخول", color: "text-neon-orange", action: () => navigate("/security") },
    { icon: Info, label: "حول النظام", desc: "System Alshbh v1.0", color: "text-muted-foreground", action: () => {} },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">الإعدادات</h1>

      <div className="space-y-2">
        {sections.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={s.action}
            className="glass-card p-4 w-full flex items-center gap-3 text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="ghost"
          className="w-full glass-card p-4 flex items-center gap-3 text-destructive justify-start"
          onClick={signOut}
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-medium">تسجيل الخروج</span>
        </Button>
      </motion.div>

      <div className="text-center pt-8">
        <p className="text-xs text-muted-foreground">System Alshbh v1.0</p>
        <p className="text-[10px] text-muted-foreground mt-1">نظام إدارة أعمال المبرمج</p>
      </div>
    </div>
  );
}
