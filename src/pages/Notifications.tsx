import { useState, useMemo } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Bell, Search, Filter, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { NotificationTestPanel } from "@/components/NotificationTestPanel";

// Helper functions
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

export default function Notifications() {
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Calculate statistics
  const stats = useMemo(() => {
    if (!notifications) return { total: 0, unread: 0, byType: {}, byPriority: {} };
    
    const unread = notifications.filter(n => !n.read).length;
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      const priority = (n as any).priority || 'medium';
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    });
    
    return {
      total: notifications.length,
      unread,
      byType,
      byPriority
    };
  }, [notifications]);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    return notifications.filter(notification => {
      // Search filter
      if (searchTerm) {
        const title = getNotificationTitle(notification).toLowerCase();
        const message = getNotificationMessage(notification).toLowerCase();
        if (!title.includes(searchTerm.toLowerCase()) && !message.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      
      // Type filter
      if (filterType !== "all" && notification.type !== filterType) {
        return false;
      }
      
      // Priority filter
      const priority = (notification as any).priority || 'medium';
      if (filterPriority !== "all" && priority !== filterPriority) {
        return false;
      }
      
      // Status filter
      if (filterStatus === "unread" && notification.read) {
        return false;
      }
      if (filterStatus === "read" && !notification.read) {
        return false;
      }
      
      return true;
    });
  }, [notifications, searchTerm, filterType, filterPriority, filterStatus]);

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  // Get unique notification types
  const notificationTypes = useMemo(() => {
    if (!notifications) return [];
    return Array.from(new Set(notifications.map(n => n.type)));
  }, [notifications]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as suas notificações em um só lugar</p>
        </div>
        {stats.unread > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">notificações totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">aguardando atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byPriority.urgent || 0}</div>
            <p className="text-xs text-muted-foreground">alta prioridade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">notificações lidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Panel */}
      <NotificationTestPanel />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {notificationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Notificações ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => {
                  const priority = (notification as any).priority || 'medium';
                  const showPriorityBadge = priority === 'urgent' || priority === 'high';
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.read)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                        notification.read 
                          ? 'bg-background hover:bg-muted border-border' 
                          : 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">
                              {getNotificationTitle(notification)}
                            </p>
                            {showPriorityBadge && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-2 py-0 h-5 ${priorityColors[priority]} text-white border-0`}
                              >
                                {priorityLabels[priority]}
                              </Badge>
                            )}
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">Nova</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all" || filterPriority !== "all" || filterStatus !== "all"
                    ? "Nenhuma notificação encontrada com os filtros selecionados"
                    : "Você não tem notificações no momento"}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
