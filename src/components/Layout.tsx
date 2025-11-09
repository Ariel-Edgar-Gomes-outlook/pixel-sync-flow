import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, Users, Briefcase, Calendar, UserPlus, FileText, CreditCard, Wrench, Settings, Menu, X, Camera, LogOut, Bell, BarChart3, Layers, Receipt, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useNotificationAutomation } from "@/hooks/useNotificationAutomation";
import { usePaymentReminders } from "@/hooks/usePaymentReminders";
import { useWorkflowAutomation } from "@/hooks/useWorkflowAutomation";
import { SubscriptionBanner, SubscriptionWarning } from "@/components/SubscriptionBanner";
const navigation = [{
  name: "Dashboard",
  href: "/",
  icon: LayoutDashboard
}, {
  name: "Clientes",
  href: "/clients",
  icon: Users
}, {
  name: "Trabalhos",
  href: "/jobs",
  icon: Briefcase
}, {
  name: "Agenda",
  href: "/calendar",
  icon: Calendar
}, {
  name: "Potenciais Clientes",
  href: "/leads",
  icon: UserPlus
}, {
  name: "Orçamentos",
  href: "/quotes",
  icon: FileText
}, {
  name: "Faturas",
  href: "/invoices",
  icon: Receipt
}, {
  name: "Contratos",
  href: "/contracts",
  icon: FileCheck
}, {
  name: "Financeiro",
  href: "/payments",
  icon: CreditCard
}, {
  name: "Relatórios",
  href: "/reports",
  icon: BarChart3
}, {
  name: "Modelos",
  href: "/templates",
  icon: Layers
}, {
  name: "Recursos",
  href: "/resources",
  icon: Wrench
}, {
  name: "Notificações",
  href: "/notifications",
  icon: Bell
}, {
  name: "Configurações",
  href: "/settings",
  icon: Settings
}];
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const {
    signOut,
    user
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // FASE 4: Centralize all automations in Layout
  useNotificationAutomation();
  usePaymentReminders();
  useWorkflowAutomation();
  return <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-sidebar shadow-xl overflow-y-auto scrollbar-hide">
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">ArgomFotos</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/80 hover:text-sidebar-foreground p-2 -mr-2 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-1 px-4 pt-6 pb-6">
            {navigation.map(item => {
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all min-h-[44px] group", isActive ? "bg-primary text-primary-foreground shadow-md" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 active:bg-sidebar-accent")}>
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "drop-shadow-sm")} />
                  <span className="font-medium">{item.name}</span>
                </Link>;
          })}
          </nav>
          <div className="mt-auto p-4 border-t border-sidebar-border/50">
            <div className="px-4 py-2 text-xs text-sidebar-foreground/60 truncate font-medium">
              {user?.email}
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 min-h-[44px] rounded-xl font-medium transition-all" onClick={signOut}>
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-sidebar shadow-2xl">
        <div className="flex h-20 items-center px-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground tracking-tight">ArgomFotos</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 pt-6 overflow-y-auto scrollbar-hide">
          {navigation.map(item => {
          const isActive = location.pathname === item.href;
          return <Link key={item.name} to={item.href} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group", isActive ? "bg-primary text-primary-foreground shadow-md" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/80")}>
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "drop-shadow-sm")} />
                <span className="font-medium">{item.name}</span>
              </Link>;
        })}
        </nav>
        <div className="mt-auto p-4 border-t border-sidebar-border/50">
          <div className="px-4 py-2 text-xs text-sidebar-foreground/60 truncate font-medium">
            {user?.email}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-xl font-medium transition-all" onClick={signOut}>
            <LogOut className="mr-3 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur-sm px-6 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-accent/80 active:bg-accent rounded-lg transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <GlobalSearch />
          <NotificationBell />
        </header>
        <main className="p-4 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
          <SubscriptionBanner />
          <SubscriptionWarning />
          <Outlet />
        </main>
      </div>
    </div>;
}