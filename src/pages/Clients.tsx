import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
}

export default function Clients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", notes: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) return;
    await supabase.from("clients").insert({
      user_id: user.id,
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      company: form.company || null,
      notes: form.notes || null,
    });
    setForm({ name: "", phone: "", email: "", company: "", notes: "" });
    setDialogOpen(false);
    toast({ title: "تم إضافة العميل بنجاح" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    toast({ title: "تم حذف العميل" });
    load();
  };

  const filtered = clients.filter((c) => c.name.includes(search) || c.phone?.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">العملاء</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="neon-glow gap-1">
              <Plus className="h-4 w-4" /> إضافة
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle>عميل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="اسم العميل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/50" />
              <Input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-muted/50" dir="ltr" />
              <Input placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted/50" dir="ltr" />
              <Input placeholder="الشركة" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-muted/50" />
              <Input placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-muted/50" />
              <Button onClick={handleAdd} className="w-full neon-glow">إضافة العميل</Button>
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
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا يوجد عملاء</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{client.name}</h3>
                    {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                    {client.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{client.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neon-green">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleDelete(client.id)}>
                      حذف
                    </Button>
                  </div>
                </div>
                {client.notes && <p className="text-xs text-muted-foreground mt-2">{client.notes}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
