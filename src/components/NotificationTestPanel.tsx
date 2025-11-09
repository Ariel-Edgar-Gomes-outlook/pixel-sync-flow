import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, Mail, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function NotificationTestPanel() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [lastCheck, setLastCheck] = useState<{
    success: boolean;
    message: string;
    timestamp: Date;
  } | null>(null);

  const handleCheckNotifications = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      console.log('🔔 Testando verificação de notificações...');
      
      const { data, error } = await supabase.functions.invoke('check-notifications', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Erro ao verificar notificações:', error);
        setLastCheck({
          success: false,
          message: error.message || 'Erro ao verificar notificações',
          timestamp: new Date(),
        });
        toast.error('Erro ao verificar notificações', {
          description: error.message,
        });
      } else {
        console.log('✅ Verificação concluída:', data);
        setLastCheck({
          success: true,
          message: `${data.created || 0} notificações criadas`,
          timestamp: new Date(),
        });
        toast.success('Verificação concluída!', {
          description: `${data.created || 0} notificações criadas`,
        });
      }
    } catch (error: any) {
      console.error('❌ Erro:', error);
      setLastCheck({
        success: false,
        message: error.message || 'Erro desconhecido',
        timestamp: new Date(),
      });
      toast.error('Erro ao verificar notificações');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!user) return;
    
    setIsSendingEmail(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('user_id', user.id)
        .single();

      if (!profile?.email) {
        throw new Error('Email não encontrado no perfil');
      }

      console.log('📧 Enviando email de teste para:', profile.email);

      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          recipientEmail: profile.email,
          recipientName: profile.name || 'Utilizador',
          notificationType: 'job_reminder',
          payload: {
            title: 'Teste de Notificação',
            message: 'Este é um email de teste do sistema de notificações',
            date: new Date().toISOString(),
            description: 'Se você recebeu este email, o sistema de notificações por email está funcional!'
          }
        }
      });

      if (error) {
        console.error('❌ Erro ao enviar email:', error);
        toast.error('Erro ao enviar email de teste', {
          description: error.message,
        });
      } else {
        console.log('✅ Email enviado:', data);
        const isTestMode = data?.testMode;
        const targetEmail = data?.targetEmail || profile.email;
        
        toast.success('Email de teste enviado!', {
          description: isTestMode 
            ? `⚠️ Modo de teste: Email enviado para ${targetEmail}. Configure um domínio no Resend para produção.`
            : `Verifique ${targetEmail}`,
        });
        
        if (isTestMode) {
          toast.warning('Resend em Modo de Teste', {
            description: 'Verifique um domínio em resend.com/domains para enviar emails para todos os utilizadores.',
            duration: 8000,
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast.error('Erro ao enviar email de teste', {
        description: error.message,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-muted/30">
      <div className="flex items-center gap-3 mb-4">
        <PlayCircle className="h-5 w-5 text-primary" />
        <div>
          <h4 className="text-sm sm:text-base font-semibold">Testar Notificações</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Verificar manualmente se há notificações pendentes
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <Button
          onClick={handleCheckNotifications}
          disabled={isChecking}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Verificar Notificações Agora'}
        </Button>

        <Button
          onClick={handleSendTestEmail}
          disabled={isSendingEmail}
          className="w-full"
          variant="outline"
        >
          <Mail className={`mr-2 h-4 w-4 ${isSendingEmail ? 'animate-pulse' : ''}`} />
          {isSendingEmail ? 'Enviando...' : 'Enviar Email de Teste'}
        </Button>

        {lastCheck && (
          <div className={`p-3 rounded-lg border ${
            lastCheck.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {lastCheck.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${
                  lastCheck.success 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {lastCheck.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lastCheck.timestamp.toLocaleString('pt-PT')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-background rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Nota:</span> A verificação automática ocorre a cada 3 horas. 
          Use estes botões para testar manualmente o sistema de notificações.
        </p>
      </div>
    </Card>
  );
}
