import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Helper functions for notification display
const getNotificationTitle = (notification: any) => {
  const typeMap: Record<string, string> = {
    payment_overdue: '💳 Pagamento Vencido',
    invoice_overdue: '🧾 Fatura Vencida',
    job_reminder: '📸 Lembrete de Job',
    contract_pending: '📝 Contrato Pendente',
    quote_sent: '💼 Orçamento Enviado',
    delivery_ready: '📦 Entrega Pronta',
    lead_follow_up: '📞 Follow-up de Lead',
    new_lead: '🆕 Novo Lead',
    contract_signed: '✅ Contrato Assinado',
    maintenance_due: '🔧 Manutenção Pendente',
    job_completed: '✨ Job Concluído',
  };
  
  return typeMap[notification.type] || notification.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
};

const getNotificationMessage = (notification: any) => {
  if (notification.payload?.message) {
    return notification.payload.message;
  }
  
  // Default messages based on type
  const messageMap: Record<string, string> = {
    payment_overdue: 'Um pagamento está vencido e requer atenção',
    invoice_overdue: 'Uma fatura está vencida',
    job_reminder: 'Você tem um job agendado em breve',
    contract_pending: 'Um contrato aguarda assinatura',
    quote_sent: 'Um orçamento foi enviado ao cliente',
    delivery_ready: 'Arquivos prontos para entrega',
    lead_follow_up: 'Um lead precisa de acompanhamento',
    new_lead: 'Um novo lead foi registrado',
    contract_signed: 'Um contrato foi assinado',
    maintenance_due: 'Equipamento precisa de manutenção',
    job_completed: 'Um job foi concluído',
  };
  
  return messageMap[notification.type] || 'Nova notificação';
};

// Função para navegar para o recurso relacionado
function getNotificationRoute(notification: any): string | null {
  const payload = notification.payload || {};
  
  switch (notification.type) {
    case 'lead_follow_up':
    case 'new_lead':
      return payload.lead_id ? `/leads` : null;
    
    case 'job_reminder':
    case 'job_completed':
      return payload.job_id ? `/jobs` : null;
    
    case 'payment_overdue':
      return payload.payment_id ? `/payments` : null;
    
    case 'maintenance_due':
    case 'maintenance_reminder':
      return payload.resource_id ? `/resources` : null;
    
    case 'contract_signed':
    case 'contract_pending':
      return payload.contract_id ? `/contracts` : null;
    
    default:
      return null;
  }
}

// Priority order and colors
const priorityOrder: Record<string, number> = { 
  urgent: 0, 
  high: 1, 
  medium: 2, 
  low: 3 
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-destructive',
  high: 'bg-orange-500',
  medium: 'bg-primary',
  low: 'bg-muted'
};

const priorityLabels: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

export function NotificationBell() {
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const { data: allNotifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const navigate = useNavigate();

  // Filtrar notificações baseado no filtro selecionado
  const notifications = filter === "all" 
    ? allNotifications 
    : allNotifications.filter(n => !n.read);

  // Sort notifications by priority and date
  const sortedNotifications = notifications ? [...notifications].sort((a, b) => {
    const priorityA = priorityOrder[(a as any).priority || 'medium'];
    const priorityB = priorityOrder[(b as any).priority || 'medium'];
    if (priorityA !== priorityB) return priorityA - priorityB;
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    if (!notification.read) {
      try {
        await markAsRead.mutateAsync(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navegar para o recurso
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
      toast.success("Redirecionando...");
    } else {
      toast.info("Esta notificação não tem ação associada");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("Todas marcadas como lidas");
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error("Erro ao marcar como lidas");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 ? (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="h-8 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Marcar todas
              </Button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="flex-1 h-9"
            >
              Não lidas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex-1 h-9"
            >
              Todas
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[420px]">
          {sortedNotifications && sortedNotifications.length > 0 ? (
            <div className="p-2 space-y-1">
              {sortedNotifications.map((notification) => {
                const priority = (notification as any).priority || 'medium';
                const showPriorityBadge = priority === 'urgent' || priority === 'high';
                const hasAction = getNotificationRoute(notification) !== null;
                
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      "p-3 transition-all border cursor-pointer",
                      notification.read 
                        ? "bg-background hover:bg-accent/50" 
                        : "bg-primary/5 border-primary/20 hover:bg-primary/10",
                      hasAction && "hover:shadow-sm"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="mt-1.5">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {/* Title and badges */}
                        <div className="flex items-start gap-2 mb-1">
                          <p className="font-medium text-sm line-clamp-1 flex-1">
                            {getNotificationTitle(notification)}
                          </p>
                          {!notification.read && (
                            <Badge className="shrink-0 h-5 text-[10px]">Nova</Badge>
                          )}
                          {showPriorityBadge && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] px-1.5 h-5 border-0 text-white shrink-0",
                                priorityColors[priority]
                              )}
                            >
                              {priorityLabels[priority]}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Message */}
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                          {getNotificationMessage(notification)}
                        </p>
                        
                        {/* Time */}
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: pt,
                            })}
                          </p>
                          {hasAction && (
                            <p className="text-[11px] text-primary font-medium">
                              Ver detalhes →
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mark as read button */}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await markAsRead.mutateAsync(notification.id);
                            } catch (error) {
                              console.error('Error marking as read:', error);
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              </p>
              <p className="text-xs text-muted-foreground">
                {filter === "unread"
                  ? "Você está em dia com tudo!"
                  : "Notificações aparecerão aqui"}
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
