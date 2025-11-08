import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useUnreadNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Helper functions for notification display
const getNotificationTitle = (notification: any) => {
  const typeMap: Record<string, string> = {
    payment_overdue: '💳 Pagamento Vencido',
    invoice_overdue: '🧾 Fatura Vencida',
    job_reminder: '📸 Lembrete de Job',
    contract_pending: '📝 Contrato Pendente',
    quote_sent: '💼 Orçamento Enviado',
    delivery_ready: '📦 Entrega Pronta',
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
  };
  
  return messageMap[notification.type] || 'Nova notificação';
};

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
  const { data: notifications } = useUnreadNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Sort notifications by priority
  const sortedNotifications = notifications ? [...notifications].sort((a, b) => {
    const priorityA = priorityOrder[(a as any).priority || 'medium'];
    const priorityB = priorityOrder[(b as any).priority || 'medium'];
    return priorityA - priorityB;
  }) : [];

  const handleNotificationClick = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 ? (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount && unreadCount > 0 ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          ) : null}
        </div>
        <ScrollArea className="h-[400px]">
          {sortedNotifications && sortedNotifications.length > 0 ? (
            <div className="p-2">
              {sortedNotifications.map((notification) => {
                const priority = (notification as any).priority || 'medium';
                const showPriorityBadge = priority === 'urgent' || priority === 'high';
                
                return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className="p-3 rounded-lg cursor-pointer transition-colors bg-primary/5 hover:bg-primary/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {getNotificationTitle(notification)}
                        </p>
                        {showPriorityBadge && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1.5 py-0 h-5 ${priorityColors[priority]} text-white border-0`}
                          >
                            {priorityLabels[priority]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), "dd 'de' MMM 'às' HH:mm", { locale: pt })}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem notificações</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}