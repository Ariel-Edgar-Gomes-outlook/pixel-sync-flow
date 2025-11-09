import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Calendar, TrendingUp, DollarSign, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/useNotificationSettings";
import { Skeleton } from "@/components/ui/skeleton";


export function NotificationSettings() {
  const { user } = useAuth();
  const { data: notificationSettings, isLoading } = useNotificationSettings(user?.id);
  const updateSettings = useUpdateNotificationSettings();

  const [settings, setSettings] = useState({
    jobReminders: true,
    leadFollowUp: true,
    paymentOverdue: true,
    maintenanceReminder: true,
    newLead: false,
    jobCompleted: false,
  });

  useEffect(() => {
    if (notificationSettings) {
      setSettings({
        jobReminders: notificationSettings.job_reminders,
        leadFollowUp: notificationSettings.lead_follow_up,
        paymentOverdue: notificationSettings.payment_overdue,
        maintenanceReminder: notificationSettings.maintenance_reminder,
        newLead: notificationSettings.new_lead,
        jobCompleted: notificationSettings.job_completed,
      });
    }
  }, [notificationSettings]);

  const handleToggle = (key: keyof typeof settings) => {
    if (!user) return;

    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));

    // Map frontend keys to database column names
    const keyMap = {
      jobReminders: 'job_reminders',
      leadFollowUp: 'lead_follow_up',
      paymentOverdue: 'payment_overdue',
      maintenanceReminder: 'maintenance_reminder',
      newLead: 'new_lead',
      jobCompleted: 'job_completed',
    };

    updateSettings.mutate({
      userId: user.id,
      [keyMap[key]]: newValue,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Bell className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold">Notificações Automáticas</h3>
          <p className="text-sm text-muted-foreground">Configure quando você deseja receber alertas</p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Job Reminders */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <Label htmlFor="jobReminders" className="text-sm sm:text-base font-medium">
                  Lembretes de Trabalhos
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Receber notificação 24h antes de um trabalho começar
                </p>
              </div>
            </div>
            <Switch
              id="jobReminders"
              checked={settings.jobReminders}
              onCheckedChange={() => handleToggle('jobReminders')}
              className="flex-shrink-0"
            />
          </div>
        </div>

        <Separator />

        {/* Lead Follow-up */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <Label htmlFor="leadFollowUp" className="text-sm sm:text-base font-medium">
                  Follow-up de Prospectos
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Alertar quando um prospecto está sem contacto há 3+ dias
                </p>
              </div>
            </div>
            <Switch
              id="leadFollowUp"
              checked={settings.leadFollowUp}
              onCheckedChange={() => handleToggle('leadFollowUp')}
              className="flex-shrink-0"
            />
          </div>
        </div>

        <Separator />

        {/* Payment Overdue */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <Label htmlFor="paymentOverdue" className="text-sm sm:text-base font-medium">
                  Pagamentos Atrasados
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Notificar sobre pagamentos pendentes há 7+ dias
                </p>
              </div>
            </div>
            <Switch
              id="paymentOverdue"
              checked={settings.paymentOverdue}
              onCheckedChange={() => handleToggle('paymentOverdue')}
              className="flex-shrink-0"
            />
          </div>
        </div>

        <Separator />

        {/* Maintenance Reminders */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Wrench className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <Label htmlFor="maintenanceReminder" className="text-sm sm:text-base font-medium">
                  Manutenção de Equipamentos
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Alertar quando manutenção está próxima (7 dias ou menos)
                </p>
              </div>
            </div>
            <Switch
              id="maintenanceReminder"
              checked={settings.maintenanceReminder}
              onCheckedChange={() => handleToggle('maintenanceReminder')}
              className="flex-shrink-0"
            />
          </div>
        </div>

        <Separator />

        {/* New Lead */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <Label htmlFor="newLead" className="text-sm sm:text-base font-medium">
                  Novos Prospectos
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Notificação instantânea quando um novo prospecto for criado
                </p>
              </div>
            </div>
            <Switch
              id="newLead"
              checked={settings.newLead}
              onCheckedChange={() => handleToggle('newLead')}
              className="flex-shrink-0"
            />
          </div>
        </div>

        <Separator />

        {/* Job Completed */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <Label htmlFor="jobCompleted" className="text-sm sm:text-base font-medium">
                  Trabalhos Concluídos
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Confirmar quando um trabalho for marcado como concluído
                </p>
              </div>
            </div>
            <Switch
              id="jobCompleted"
              checked={settings.jobCompleted}
              onCheckedChange={() => handleToggle('jobCompleted')}
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs sm:text-sm text-muted-foreground">
          💡 <span className="font-medium">Dica:</span> As notificações são verificadas automaticamente a cada 3 horas. 
          Você receberá alertas no sistema e por email.
        </p>
      </div>
    </Card>
  );
}