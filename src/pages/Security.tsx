import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Trash2, Monitor, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SecurityLog {
  id: string;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  status: string;
  created_at: string;
}

export default function Security() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<SecurityLog[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("security_logs").select("*").order("created_at", { ascending: false }).limit(50);
    setLogs(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleDeleteAll = async () => {
    if (!user) return;
    await supabase.from("security_logs").delete().eq("user_id", user.id);
    toast({ title: "تم حذف جميع السجلات" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">سجل الأمان</h1>
        <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={handleDeleteAll}>
          <Trash2 className="h-4 w-4" /> مسح الكل
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد سجلات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.status === "success" ? "bg-neon-green/10" : "bg-destructive/10"}`}>
                    {log.device_type === "Mobile" ? (
                      <Smartphone className={`h-4 w-4 ${log.status === "success" ? "text-neon-green" : "text-destructive"}`} />
                    ) : (
                      <Monitor className={`h-4 w-4 ${log.status === "success" ? "text-neon-green" : "text-destructive"}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {log.status === "success" ? "دخول ناجح" : "محاولة فاشلة"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {log.browser} • {log.country}{log.city ? `, ${log.city}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground" dir="ltr">{log.ip_address}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
