import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

export function NotificationTestPanel() {
  const [loading, setLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('job_reminder');

  const notificationTypes = [
    { value: 'job_reminder', label: 'Lembrete de Trabalho', payload: { job_id: 'test-job', job_title: 'Sessão Fotográfica Teste' } },
    { value: 'lead_follow_up', label: 'Follow-up de Lead', payload: { lead_id: 'test-lead', client_name: 'Cliente Teste' } },
    { value: 'payment_overdue', label: 'Pagamento Atrasado', payload: { payment_id: 'test-payment', amount: 5000, client_name: 'Cliente Teste' } },
    { value: 'maintenance_reminder', label: 'Manutenção de Equipamento', payload: { resource_id: 'test-resource', resource_name: 'Câmera Canon EOS R5' } },
    { value: 'job_completed', label: 'Trabalho Concluído', payload: { job_id: 'test-job', job_title: 'Evento Empresarial' } },
    { value: 'new_lead', label: 'Novo Lead', payload: { lead_id: 'test-lead', client_name: 'João Silva' } }
  ];

  const createTestNotification = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const selectedType = notificationTypes.find(t => t.value === notificationType);
      
      const { error } = await supabase.rpc('create_system_notification', {
        _recipient_id: user.id,
        _type: notificationType,
        _payload: selectedType?.payload || {}
      });

      if (error) throw error;

      toast.success('Notificação de teste criada!');
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast.error('Erro ao criar notificação de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Criar Notificação de Teste
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Notificação</label>
          <Select value={notificationType} onValueChange={setNotificationType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={createTestNotification} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Criando...' : 'Criar Notificação'}
        </Button>
      </CardContent>
    </Card>
  );
}
