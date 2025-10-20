import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { usePayments } from "@/hooks/usePayments";
import { useResources } from "@/hooks/useResources";
import { AlertCircle, Clock, DollarSign, Wrench, TrendingUp, Calendar } from "lucide-react";
import { differenceInDays, differenceInHours, parseISO } from "date-fns";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function SmartNotificationPanel() {
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: payments } = usePayments();
  const { data: resources } = useResources();
  const navigate = useNavigate();

  const now = new Date();
  const alerts: Array<{
    id: string;
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    action?: () => void;
    icon: any;
    color: string;
  }> = [];

  // 1. Jobs starting in 24 hours
  jobs?.forEach((job) => {
    const startDate = parseISO(job.start_datetime);
    const hoursUntil = differenceInHours(startDate, now);

    if (hoursUntil > 0 && hoursUntil <= 24) {
      alerts.push({
        id: `job-${job.id}`,
        type: 'job_reminder',
        priority: 'high',
        title: 'Job começando em breve',
        message: `"${job.title}" começa em ${hoursUntil}h`,
        action: () => navigate('/jobs'),
        icon: Calendar,
        color: 'text-red-600',
      });
    }
  });

  // 2. Leads without follow-up for 3+ days
  leads?.forEach((lead) => {
    if (lead.status === 'new' || lead.status === 'contacted') {
      const createdDate = parseISO(lead.created_at);
      const daysSince = differenceInDays(now, createdDate);

      if (daysSince >= 3) {
        alerts.push({
          id: `lead-${lead.id}`,
          type: 'lead_follow_up',
          priority: 'medium',
          title: 'Lead sem follow-up',
          message: `${lead.clients?.name || 'Lead'} há ${daysSince} dias sem contacto`,
          action: () => navigate('/leads'),
          icon: TrendingUp,
          color: 'text-orange-600',
        });
      }
    }
  });

  // 3. Overdue payments
  payments?.forEach((payment) => {
    if (payment.status === 'pending' && payment.created_at) {
      const createdDate = parseISO(payment.created_at);
      const daysSince = differenceInDays(now, createdDate);

      if (daysSince >= 7) {
        alerts.push({
          id: `payment-${payment.id}`,
          type: 'payment_overdue',
          priority: 'high',
          title: 'Pagamento atrasado',
          message: `${payment.clients?.name} - ${daysSince} dias de atraso`,
          action: () => navigate('/payments'),
          icon: DollarSign,
          color: 'text-red-600',
        });
      }
    }
  });

  // 4. Equipment maintenance due
  resources?.forEach((resource) => {
    if (resource.next_maintenance_date) {
      const maintenanceDate = parseISO(resource.next_maintenance_date);
      const daysUntil = differenceInDays(maintenanceDate, now);

      if (daysUntil >= 0 && daysUntil <= 7) {
        alerts.push({
          id: `resource-${resource.id}`,
          type: 'maintenance_reminder',
          priority: daysUntil <= 2 ? 'high' : 'medium',
          title: 'Manutenção de equipamento',
          message: `"${resource.name}" em ${daysUntil} dias`,
          action: () => navigate('/resources'),
          icon: Wrench,
          color: daysUntil <= 2 ? 'text-red-600' : 'text-orange-600',
        });
      }
    }
  });

  // Sort by priority
  const sortedAlerts = alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (sortedAlerts.length === 0) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
          <p className="font-semibold text-foreground">Tudo em ordem! ✅</p>
          <p className="text-sm text-muted-foreground mt-1">Nenhuma ação urgente necessária</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <div>
          <h3 className="text-lg font-semibold">Ações Necessárias</h3>
          <p className="text-sm text-muted-foreground">{sortedAlerts.length} alertas ativos</p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 ${
              alert.priority === 'high' ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20' :
              alert.priority === 'medium' ? 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20' :
              'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <alert.icon className={`h-5 w-5 ${alert.color} mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-foreground">{alert.title}</p>
                    <Badge variant={
                      alert.priority === 'high' ? 'destructive' :
                      alert.priority === 'medium' ? 'warning' :
                      'secondary'
                    } className="text-xs">
                      {alert.priority === 'high' ? '🔴 Urgente' :
                       alert.priority === 'medium' ? '🟠 Atenção' :
                       '🔵 Info'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
              {alert.action && (
                <Button size="sm" variant="outline" onClick={alert.action}>
                  Ver
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}