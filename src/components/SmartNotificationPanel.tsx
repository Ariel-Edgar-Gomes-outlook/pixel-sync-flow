import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, AlertCircle, Calendar, DollarSign, Wrench, Briefcase, TrendingUp } from "lucide-react";
import { useNotifications, useUnreadNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

const notificationIcons = {
  job_reminder: Calendar,
  lead_followup: TrendingUp,
  lead_follow_up: TrendingUp,
  payment_overdue: DollarSign,
  maintenance_due: Wrench,
  maintenance_reminder: Wrench,
  job_completed: Briefcase,
  new_lead: TrendingUp,
  default: AlertCircle,
};

const notificationColors = {
  job_reminder: "text-blue-500",
  lead_followup: "text-purple-500",
  lead_follow_up: "text-purple-500",
  payment_overdue: "text-red-500",
  maintenance_due: "text-orange-500",
  maintenance_reminder: "text-orange-500",
  job_completed: "text-green-500",
  new_lead: "text-indigo-500",
  default: "text-muted-foreground",
};

const notificationTitles: Record<string, string> = {
  job_reminder: "Lembrete de Job",
  lead_followup: "Follow-up de Lead",
  lead_follow_up: "Follow-up de Lead",
  payment_overdue: "Pagamento Atrasado",
  maintenance_due: "Manutenção Pendente",
  maintenance_reminder: "Manutenção Pendente",
  job_completed: "Job Concluído",
  new_lead: "Novo Lead",
};

export function SmartNotificationPanel() {
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  
  // Use the correct hook based on filter
  const { data: allNotifications, isLoading: allLoading } = useNotifications();
  const { data: unreadNotifications, isLoading: unreadLoading } = useUnreadNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Select the right data source based on filter
  const notifications = filter === "all" ? allNotifications : unreadNotifications;
  const isLoading = filter === "all" ? allLoading : unreadLoading;

  const handleMarkAsRead = async (notificationId: string) => {
    console.log('🎯 HANDLE MARK AS READ CALLED:', notificationId);
    toast.info("Marcando notificação...");
    
    try {
      const result = await markAsRead.mutateAsync(notificationId);
      console.log('🎯 MARK AS READ RESULT:', result);
      toast.success("Notificação marcada como lida!");
    } catch (error) {
      console.error('🎯 MARK AS READ ERROR:', error);
      toast.error("Erro ao marcar como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log('🎯 HANDLE MARK ALL AS READ CALLED');
    toast.info("Marcando todas...");
    
    try {
      const result = await markAllAsRead.mutateAsync();
      console.log('🎯 MARK ALL AS READ RESULT:', result);
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      console.error('🎯 MARK ALL AS READ ERROR:', error);
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4 text-muted-foreground">Carregando notificações...</div>
      </Card>
    );
  }

  // Don't show empty panel if no unread notifications
  if (filter === "unread" && (!notifications || notifications.length === 0)) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Notificações</h2>
          {unreadCount && unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg border border-border p-1 flex-1 sm:flex-initial">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Todas
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Não lidas
            </Button>
          </div>

          {unreadCount && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="text-xs sm:text-sm shrink-0"
            >
              <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Marcar lidas</span>
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
        <div className="space-y-2 sm:space-y-3">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || notificationIcons.default;
              const iconColor = notificationColors[notification.type as keyof typeof notificationColors] || notificationColors.default;
              const title = notificationTitles[notification.type] || "Notificação";
              const payload = notification.payload as any;

              return (
                <Card
                  key={notification.id}
                  className={`p-3 sm:p-4 transition-all hover:shadow-md ${
                    notification.read ? "bg-muted/20" : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded-lg bg-muted/50 ${iconColor} shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                            {title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="default" className="h-4 sm:h-5 px-1.5 sm:px-2 text-[10px] sm:text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 break-words">
                          {payload?.message || payload?.title || "Sem mensagem"}
                        </p>

                        {payload?.entity_name && (
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1">
                            <span className="font-medium truncate">{payload.entity_name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: pt,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsRead.isPending}
                        title="Marcar como lida"
                        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="font-medium mb-1 text-sm sm:text-base">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              </p>
              <p className="text-xs sm:text-sm px-4">
                {filter === "unread"
                  ? "Você está em dia com todas as notificações"
                  : "Notificações aparecerão aqui quando houver atualizações"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}