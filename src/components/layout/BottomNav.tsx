import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Plus, Wallet, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "الرئيسية", path: "/" },
  { icon: FolderKanban, label: "المشاريع", path: "/projects" },
  { icon: Plus, label: "إضافة", path: "/add", isCenter: true },
  { icon: Wallet, label: "المالية", path: "/finance" },
  { icon: Menu, label: "المزيد", path: "/more" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div className="bg-card/90 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-6"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-primary flex items-center justify-center neon-glow"
                  >
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-0 w-6 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
