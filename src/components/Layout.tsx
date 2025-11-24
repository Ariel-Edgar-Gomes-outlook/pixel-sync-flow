import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, Users, Briefcase, Calendar, UserPlus, FileText, CreditCard, Wrench, Settings, Menu, X, Camera, LogOut, Bell, BarChart3, Layers, Receipt, FileCheck, ChevronLeft, ChevronRight, UsersRound, Crown, Headphones, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useNotificationAutomation } from "@/hooks/useNotificationAutomation";
import { usePaymentReminders } from "@/hooks/usePaymentReminders";
import { useWorkflowAutomation } from "@/hooks/useWorkflowAutomation";
import { SubscriptionBanner, SubscriptionWarning } from "@/components/SubscriptionBanner";
const navigation = [{
  name: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard
}, {
  name: "Clientes",
  href: "/dashboard/clients",
  icon: Users
}, {
  name: "Trabalhos",
  href: "/dashboard/jobs",
  icon: Briefcase
}, {
  name: "Agenda",
  href: "/dashboard/calendar",
  icon: Calendar
}, {
  name: "Potenciais Clientes",
  href: "/dashboard/leads",
  icon: UserPlus
}, {
  name: "Orçamentos",
  href: "/dashboard/quotes",
  icon: FileText
}, {
  name: "Faturas",
  href: "/dashboard/invoices",
  icon: Receipt
}, {
  name: "Contratos",
  href: "/dashboard/contracts",
  icon: FileCheck
}, {
  name: "Financeiro",
  href: "/dashboard/payments",
  icon: CreditCard
}, {
  name: "Relatórios",
  href: "/dashboard/reports",
  icon: BarChart3
}, {
  name: "Modelos",
  href: "/dashboard/templates",
  icon: Layers
}, {
  name: "Recursos",
  href: "/dashboard/resources",
  icon: Wrench
}, {
  name: "Equipe",
  href: "/dashboard/team",
  icon: UsersRound
}, {
  name: "Notificações",
  href: "/dashboard/notifications",
  icon: Bell
}, {
  name: "Assinatura",
  href: "/dashboard/subscription",
  icon: Crown
}, {
  name: "Suporte",
  href: "/dashboard/support",
  icon: Headphones
}, {
  name: "Configurações",
  href: "/dashboard/settings",
  icon: Settings
}];
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const {
    signOut,
    user
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  // FASE 4: Centralize all automations in Layout
  useNotificationAutomation();
  usePaymentReminders();
  useWorkflowAutomation();
  return <div className="min-h-screen bg-background overflow-x-hidden w-full">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 shadow-2xl overflow-y-auto scrollbar-hide border-r border-primary/10">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
            <div className="relative flex h-20 items-center justify-between px-6 border-b border-sidebar-border/30">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/20">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/20" />
                </div>
                <div>
                  <span className="text-xl font-bold text-sidebar-foreground tracking-tight">ArgomFotos</span>
                  <p className="text-xs text-sidebar-foreground/60">Studio Manager</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-2 -mr-2 transition-all hover:bg-sidebar-accent/50 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3 pt-6 pb-6">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              const isSubscription = item.name === "Assinatura";
              return <Link 
                key={item.name} 
                to={item.href} 
                onClick={() => setSidebarOpen(false)} 
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all min-h-[44px] group relative overflow-hidden",
                  isSubscription && "animate-pulse",
                  isActive 
                    ? isSubscription 
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/50" 
                      : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                    : isSubscription
                      ? "text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 active:bg-sidebar-accent"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isSubscription && !isActive && "bg-yellow-500/20",
                  isActive ? isSubscription ? "bg-white/30" : "bg-white/20" : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0 transition-all group-hover:scale-110",
                    isSubscription && "text-yellow-500",
                    isActive && isSubscription && "text-white drop-shadow-lg",
                    isActive && !isSubscription && "drop-shadow-sm"
                  )} />
                </div>
                <span className="font-medium relative">{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/50 animate-pulse" />
                )}
              </Link>;
            })}
          </nav>

          {/* User section */}
          <div className="mt-auto p-4 border-t border-sidebar-border/30">
            <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-xs text-sidebar-foreground/60 mb-1 font-medium">Conta ativa</p>
              <p className="text-xs text-sidebar-foreground truncate font-medium">{user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-destructive/10 hover:border-destructive/20 min-h-[44px] rounded-xl font-medium transition-all border border-transparent"
              onClick={signOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 shadow-2xl border-r border-primary/10 transition-all duration-300",
        sidebarCollapsed ? "lg:w-20" : "lg:w-72"
      )}>
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
          <div className={cn(
            "relative flex h-20 items-center border-b border-sidebar-border/30 transition-all duration-300",
            sidebarCollapsed ? "px-4 justify-center" : "px-6"
          )}>
            {sidebarCollapsed ? (
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/20">
                <Camera className="h-6 w-6 text-primary-foreground" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/20" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/20">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/20" />
                </div>
                <div>
                  <span className="text-xl font-bold text-sidebar-foreground tracking-tight">ArgomFotos</span>
                  <p className="text-xs text-sidebar-foreground/60">Studio Manager</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg ring-2 ring-background hover:scale-110 transition-transform"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Navigation */}
        <TooltipProvider delayDuration={0}>
          <nav className={cn(
            "flex-1 space-y-1 pt-6 overflow-y-auto scrollbar-hide pb-4 transition-all duration-300",
            sidebarCollapsed ? "px-2" : "px-3"
          )}>
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              const isSubscription = item.name === "Assinatura";
              
              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link 
                        to={item.href} 
                        className={cn(
                          "flex items-center justify-center rounded-xl p-3 transition-all group relative overflow-hidden",
                          isSubscription && "animate-pulse",
                          isActive 
                            ? isSubscription 
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/50" 
                              : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                            : isSubscription
                              ? "text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                        )}
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-all group-hover:scale-110",
                          isSubscription && "text-yellow-500",
                          isActive && isSubscription && "text-white drop-shadow-lg",
                          isActive && !isSubscription && "drop-shadow-sm"
                        )} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group relative overflow-hidden",
                    isSubscription && "animate-pulse",
                    isActive 
                      ? isSubscription 
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/50" 
                        : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      : isSubscription
                        ? "text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isSubscription && !isActive && "bg-yellow-500/20",
                    isActive ? isSubscription ? "bg-white/30" : "bg-white/20" : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0 transition-all group-hover:scale-110",
                      isSubscription && "text-yellow-500",
                      isActive && isSubscription && "text-white drop-shadow-lg",
                      isActive && !isSubscription && "drop-shadow-sm"
                    )} />
                  </div>
                  <span className="font-medium relative">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/50 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* User section */}
        <div className={cn(
          "mt-auto border-t border-sidebar-border/30 transition-all duration-300",
          sidebarCollapsed ? "p-2" : "p-4"
        )}>
          {sidebarCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-destructive/10 hover:border-destructive/20 rounded-xl font-medium transition-all border border-transparent p-3"
                    onClick={signOut}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Sair da Conta
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-xs text-sidebar-foreground/60 mb-1 font-medium">Conta ativa</p>
                <p className="text-xs text-sidebar-foreground truncate font-medium">{user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-destructive/10 hover:border-destructive/20 rounded-xl font-medium transition-all border border-transparent"
                onClick={signOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sair da Conta
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
      )}>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-md px-6 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden text-foreground p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-accent/80 active:bg-accent rounded-lg transition-all hover:scale-105"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <GlobalSearch />
          <NotificationBell />
        </header>
        <main className="p-4 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-[calc(100vh-4rem)]">
          <SubscriptionBanner />
          <SubscriptionWarning />
          <Outlet />
        </main>
      </div>
    </div>;
}