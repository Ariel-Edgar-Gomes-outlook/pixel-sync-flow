import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, Users, Briefcase, Calendar, UserPlus, FileText, CreditCard, Wrench, Settings, Menu, X, Camera, LogOut, Bell, BarChart3, Layers } from "lucide-react";
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
  icon: FileText
}, {
  name: "Contratos",
  href: "/contracts",
  icon: FileText
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

  // FASE 4: Centralize all automations in Layout (removed from Dashboard)
  useNotificationAutomation();
  usePaymentReminders();
  useWorkflowAutomation();

  // Handle Google Calendar OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected === 'true') {
      toast.success('Google Calendar conectado com sucesso!');
      searchParams.delete('connected');
      setSearchParams(searchParams, {
        replace: true
      });
    } else if (error === 'connection_failed') {
      toast.error('Erro ao conectar ao Google Calendar. Tente novamente.');
      searchParams.delete('error');
      setSearchParams(searchParams, {
        replace: true
      });
    }
  }, [searchParams, setSearchParams]);
  return <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-sidebar overflow-y-auto scrollbar-hide">
          <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-sidebar-foreground">PhotoFlow</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground p-2 -mr-2">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          <nav className="space-y-1 px-3 pt-4 pb-6">
            {navigation.map(item => {
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 active:bg-sidebar-accent/70")}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>;
          })}
          </nav>
          <div className="mt-auto p-3 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-sidebar-foreground/70 truncate">
              {user?.email}
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 min-h-[44px]" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-sidebar">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">TotosArgom</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 pt-4 overflow-y-auto scrollbar-hide">
          {navigation.map(item => {
          const isActive = location.pathname === item.href;
          return <Link key={item.name} to={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>;
        })}
        </nav>
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/70 truncate">
            {user?.email}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center gap-3 sm:gap-4 border-b border-border bg-card px-3 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-accent rounded-md">
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <div className="flex-1" />
          <GlobalSearch />
          <NotificationBell />
        </header>
        <main className="p-3 sm:p-4 lg:p-6">
          <SubscriptionBanner />
          <SubscriptionWarning />
          <Outlet />
        </main>
      </div>
    </div>;
}