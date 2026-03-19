import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Server, Globe, Database, Key, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  type: string;
  provider: string | null;
  url: string | null;
  credentials: string | null;
  expire_date: string | null;
  cost: number;
  notes: string | null;
}

const typeIcons: Record<string, any> = {
  supabase: Database,
  domain: Globe,
  hosting: Server,
  api_key: Key,
  other: Server,
};

const typeLabels: Record<string, string> = {
  supabase: "Supabase",
  domain: "دومين",
  hosting: "استضافة",
  api_key: "API Key",
  other: "أخرى",
};

const typeColors: Record<string, string> = {
  supabase: "text-neon-green bg-neon-green/10",
  domain: "text-neon-cyan bg-neon-cyan/10",
  hosting: "text-neon-violet bg-neon-violet/10",
  api_key: "text-neon-orange bg-neon-orange/10",
  other: "text-muted-foreground bg-muted",
};

export default function Services() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "domain", provider: "", url: "", credentials: "", expire_date: "", cost: "", notes: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    setServices(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) return;
    await supabase.from("services").insert({
      user_id: user.id,
      name: form.name,
      type: form.type,
      provider: form.provider || null,
      url: form.url || null,
      credentials: form.credentials || null,
      expire_date: form.expire_date || null,
      cost: Number(form.cost) || 0,
      notes: form.notes || null,
    });
    setForm({ name: "", type: "domain", provider: "", url: "", credentials: "", expire_date: "", cost: "", notes: "" });
    setDialogOpen(false);
    toast({ title: "تم إضافة الخدمة بنجاح" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    toast({ title: "تم حذف الخدمة" });
    load();
  };

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date).getTime() < Date.now();
  };

  const filtered = services.filter((s) => s.name.includes(search) || s.provider?.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">الخدمات</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="neon-glow gap-1"><Plus className="h-4 w-4" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>خدمة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="اسم الخدمة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/50" />
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supabase">Supabase</SelectItem>
                  <SelectItem value="domain">دومين</SelectItem>
                  <SelectItem value="hosting">استضافة</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="المزود" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="bg-muted/50" />
              <Input placeholder="الرابط" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="bg-muted/50" dir="ltr" />
              <Input placeholder="بيانات الدخول / API Key" value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} className="bg-muted/50" dir="ltr" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">تاريخ الانتهاء</label>
                  <Input type="date" value={form.expire_date} onChange={(e) => setForm({ ...form, expire_date: e.target.value })} className="bg-muted/50" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">التكلفة</label>
                  <Input type="number" placeholder="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="bg-muted/50" dir="ltr" />
                </div>
              </div>
              <Input placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-muted/50" />
              <Button onClick={handleAdd} className="w-full neon-glow">إضافة الخدمة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-muted/50" />
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد خدمات</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((service) => {
              const Icon = typeIcons[service.type] || Server;
              const colorClass = typeColors[service.type] || typeColors.other;
              const expired = isExpired(service.expire_date);
              const expiringSoon = isExpiringSoon(service.expire_date);

              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`glass-card p-4 ${expired ? "border-destructive/50" : expiringSoon ? "border-neon-orange/50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{service.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                            {typeLabels[service.type]}
                          </span>
                          {service.provider && (
                            <span className="text-[10px] text-muted-foreground">{service.provider}</span>
                          )}
                        </div>
                        {service.expire_date && (
                          <div className="flex items-center gap-1">
                            {(expired || expiringSoon) && <AlertTriangle className={`h-3 w-3 ${expired ? "text-destructive" : "text-neon-orange"}`} />}
                            <span className={`text-[10px] ${expired ? "text-destructive" : expiringSoon ? "text-neon-orange" : "text-muted-foreground"}`}>
                              {expired ? "منتهية" : expiringSoon ? "تنتهي قريباً" : ""} {service.expire_date}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {service.notes && <p className="text-xs text-muted-foreground mt-2 mr-13">{service.notes}</p>}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
