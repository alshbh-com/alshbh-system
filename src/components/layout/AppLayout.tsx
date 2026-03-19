import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          <header className="hidden md:flex h-14 items-center justify-between border-b border-border/50 px-4">
            <SidebarTrigger className="mr-2" />
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-20 md:pb-4 p-4">
            {children}
          </main>

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
