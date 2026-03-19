import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
}

export default function Finance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "income", amount: "", description: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("transactions").select("*").order("date", { ascending: false });
    setTransactions(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.amount) return;
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: form.type,
      amount: Number(form.amount),
      description: form.description || null,
    });
    setForm({ type: "income", amount: "", description: "" });
    setDialogOpen(false);
    toast({ title: "تم إضافة العملية" });
    load();
  };

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">المالية</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="neon-glow gap-1"><Plus className="h-4 w-4" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md">
            <DialogHeader><DialogTitle>عملية مالية</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">دخل</SelectItem>
                  <SelectItem value="expense">مصروف</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="المبلغ" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-muted/50" dir="ltr" />
              <Input placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-muted/50" />
              <Button onClick={handleAdd} className="w-full neon-glow">إضافة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <TrendingUp className="h-5 w-5 text-neon-green mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">الدخل</p>
          <p className="text-sm font-bold text-neon-green">{income.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">المصروف</p>
          <p className="text-sm font-bold text-destructive">{expense.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Wallet className="h-5 w-5 text-neon-cyan mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">الصافي</p>
          <p className="text-sm font-bold text-neon-cyan">{(income - expense).toLocaleString()}</p>
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2">
        {transactions.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-neon-green/10" : "bg-destructive/10"}`}>
                {t.type === "income" ? <TrendingUp className="h-4 w-4 text-neon-green" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              </div>
              <div>
                <p className="text-sm font-medium">{t.description || (t.type === "income" ? "دخل" : "مصروف")}</p>
                <p className="text-[10px] text-muted-foreground">{t.date}</p>
              </div>
            </div>
            <p className={`text-sm font-bold ${t.type === "income" ? "text-neon-green" : "text-destructive"}`}>
              {t.type === "income" ? "+" : "-"}{Number(t.amount).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
