import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, LogOut, User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم تغيير كلمة المرور بنجاح ✅" });
      setNewPassword("");
      setShowChangePassword(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">الإعدادات</h1>

      <div className="space-y-2">
        {/* Account */}
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-neon-cyan" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">الحساب</p>
            <p className="text-[10px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Change Password */}
        <motion.div className="glass-card p-4 space-y-3">
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="flex items-center gap-3 w-full text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-neon-violet" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">تغيير كلمة المرور</p>
              <p className="text-[10px] text-muted-foreground">تحديث كلمة مرور الدخول</p>
            </div>
          </button>

          {showChangePassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 pt-2"
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-muted/50 pr-4 pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleChangePassword} disabled={saving} className="w-full neon-glow gap-2" size="sm">
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ كلمة المرور"}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Security */}
        <button onClick={() => navigate("/security")} className="glass-card p-4 w-full flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-neon-orange/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-neon-orange" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">سجل الأمان</p>
            <p className="text-[10px] text-muted-foreground">عرض سجلات الدخول</p>
          </div>
        </button>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full glass-card p-4 flex items-center gap-3 text-destructive justify-start h-auto"
          onClick={signOut}
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-medium">تسجيل الخروج</span>
        </Button>
      </div>

      <div className="text-center pt-8">
        <p className="text-xs text-muted-foreground">System Alshbh v1.0</p>
        <p className="text-[10px] text-muted-foreground mt-1">نظام إدارة أعمال المبرمج</p>
      </div>
    </div>
  );
}
