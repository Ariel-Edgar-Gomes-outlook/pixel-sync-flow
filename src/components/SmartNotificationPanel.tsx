import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, AlertCircle, Calendar, DollarSign, Wrench, Briefcase, TrendingUp } from "lucide-react";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useUnreadNotificationsCount } from "@/hooks/useNotifications";
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
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      toast.error("Erro ao marcar como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const filteredNotifications = notifications?.filter(n => 
    filter === "all" ? true : !n.read
  ) || [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4 text-muted-foreground">Carregando notificações...</div>
      </Card>
    );
  }

  // Don't show empty panel if no unread notifications
  if (filter === "unread" && filteredNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Notificações</h2>
          {unreadCount && unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
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
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar lidas
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || notificationIcons.default;
              const iconColor = notificationColors[notification.type as keyof typeof notificationColors] || notificationColors.default;
              const title = notificationTitles[notification.type] || "Notificação";
              const payload = notification.payload as any;

              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all hover:shadow-md ${
                    notification.read ? "bg-muted/20" : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-muted/50 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            {title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="default" className="h-5 px-2 text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {payload?.message || payload?.title || "Sem mensagem"}
                        </p>

                        {payload?.entity_name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{payload.entity_name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
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
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              </p>
              <p className="text-sm">
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