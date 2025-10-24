import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
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

export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
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
          {notifications && notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-transparent hover:bg-muted' 
                      : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getNotificationTitle(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getNotificationMessage(notification)}
                    </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), "dd 'de' MMM 'às' HH:mm", { locale: pt })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
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