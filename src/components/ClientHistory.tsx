import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, DollarSign, Calendar, TrendingUp, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ClientHistoryProps {
  clientId: string;
}

export function ClientHistory({ clientId }: ClientHistoryProps) {
  // Fetch jobs
  const { data: jobs } = useQuery({
    queryKey: ['client_jobs', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientId)
        .order('start_datetime', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch payments
  const { data: payments } = useQuery({
    queryKey: ['client_payments', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch quotes
  const { data: quotes } = useQuery({
    queryKey: ['client_quotes', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch leads
  const { data: leads } = useQuery({
    queryKey: ['client_leads', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch contracts
  const { data: contracts } = useQuery({
    queryKey: ['client_contracts', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0;
  const totalJobs = jobs?.length || 0;
  const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const pendingPayments = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const lastJob = jobs?.[0];
  const nextJob = jobs?.find(j => new Date(j.start_datetime) > new Date() && (j.status === 'scheduled' || j.status === 'confirmed'));
  const acceptedQuotes = quotes?.filter(q => q.status === 'accepted').length || 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total de Jobs</p>
              <p className="text-2xl font-bold text-primary">{totalJobs}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {completedJobs} concluídos
              </p>
            </div>
            <Briefcase className="h-10 w-10 text-primary/30" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(0)} Kz</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pagamentos confirmados
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500/30" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Valor Pendente</p>
              <p className="text-2xl font-bold text-orange-600">{pendingPayments.toFixed(0)} Kz</p>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando pagamento
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-500/30" />
          </div>
        </Card>
      </div>

      <Separator />

      {/* Last and Next Job */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Last Job */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Último Job Realizado</h3>
          </div>
          {lastJob ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{lastJob.type}</Badge>
                <span className="font-medium text-sm">{lastJob.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(lastJob.start_datetime), "d 'de' MMMM 'de' yyyy", { locale: pt })}
              </p>
              {lastJob.location && (
                <p className="text-xs text-muted-foreground">📍 {lastJob.location}</p>
              )}
              <Badge variant={
                lastJob.status === 'completed' ? 'success' :
                lastJob.status === 'in_production' ? 'warning' :
                lastJob.status === 'cancelled' ? 'destructive' :
                'secondary'
              }>
                {lastJob.status === 'completed' ? '✅ Concluído' :
                 lastJob.status === 'in_production' ? '🎬 Em Produção' :
                 lastJob.status === 'cancelled' ? '❌ Cancelado' :
                 lastJob.status === 'confirmed' ? '✅ Confirmado' :
                 '📅 Agendado'}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum job realizado ainda</p>
          )}
        </Card>

        {/* Next Job */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Próximo Job Agendado</h3>
          </div>
          {nextJob ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{nextJob.type}</Badge>
                <span className="font-medium text-sm">{nextJob.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(nextJob.start_datetime), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
              </p>
              {nextJob.location && (
                <p className="text-xs text-muted-foreground">📍 {nextJob.location}</p>
              )}
              <Badge variant="primary">
                {nextJob.status === 'confirmed' ? '✅ Confirmado' : '📅 Agendado'}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum job futuro agendado</p>
          )}
        </Card>
      </div>

      <Separator />

      {/* Recent Jobs List */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Histórico de Jobs</h3>
        </div>

        {jobs && jobs.length > 0 ? (
          <div className="space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{job.title}</span>
                    <Badge variant="outline" className="text-xs">{job.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(job.start_datetime), "dd/MM/yyyy", { locale: pt })}
                  </p>
                </div>
                <div className="text-right">
                  {job.estimated_revenue && (
                    <p className="text-sm font-medium text-foreground">
                      {Number(job.estimated_revenue).toFixed(0)} Kz
                    </p>
                  )}
                  <Badge variant={
                    job.status === 'completed' ? 'success' :
                    job.status === 'cancelled' ? 'destructive' :
                    'secondary'
                  } className="text-xs mt-1">
                    {job.status === 'completed' ? 'Concluído' :
                     job.status === 'cancelled' ? 'Cancelado' :
                     job.status === 'in_production' ? 'Em Produção' :
                     job.status === 'confirmed' ? 'Confirmado' :
                     'Agendado'}
                  </Badge>
                </div>
              </div>
            ))}
            {jobs.length > 5 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                E mais {jobs.length - 5} jobs...
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum job encontrado para este cliente
          </p>
        )}
      </Card>

      {/* Quotes Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Orçamentos</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{quotes?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{acceptedQuotes}</p>
            <p className="text-xs text-muted-foreground">Aceites</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {quotes?.filter(q => q.status === 'sent').length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {quotes?.filter(q => q.status === 'draft').length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Rascunhos</p>
          </div>
        </div>
      </Card>

      {/* Leads & Contracts Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Leads</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{leads?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {leads?.filter(l => l.status === 'won').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Convertidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {leads?.filter(l => l.status === 'new' || l.status === 'contacted').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Contratos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{contracts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {contracts?.filter(c => c.status === 'signed').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Assinados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {contracts?.filter(c => c.status === 'sent').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}