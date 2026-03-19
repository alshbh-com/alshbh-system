import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      // Log successful login
      logSecurityEvent("success");
    } else {
      logSecurityEvent("failed");
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

async function logSecurityEvent(status: "success" | "failed") {
  try {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone/i.test(ua);
    const browser = ua.match(/(Chrome|Safari|Firefox|Edge|Opera)\//)?.[1] || "Unknown";

    // Get IP and location from free API
    let ip = "unknown", country = "unknown", city = "unknown";
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        ip = data.ip || "unknown";
        country = data.country_name || "unknown";
        city = data.city || "unknown";
      }
    } catch {}

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("security_logs").insert({
        user_id: user.id,
        ip_address: ip,
        device_type: isMobile ? "Mobile" : "Desktop",
        browser,
        country,
        city,
        status,
      });
    }
  } catch {}
}
