import { useMemo } from 'react';
import { SmartBadge } from '@/types/workflows';
import { differenceInDays, isPast, parseISO } from 'date-fns';

interface UseSmartBadgesProps {
  entityType: 'quote' | 'invoice' | 'job' | 'payment' | 'contract' | 'lead';
  entity: any;
}

/**
 * Hook to generate smart badges based on entity state
 * FASE 3.2: Implemented with real logic
 */
export function useSmartBadges({ entityType, entity }: UseSmartBadgesProps): SmartBadge[] {
  const badges = useMemo(() => {
    const result: SmartBadge[] = [];

    if (!entity) return result;

    switch (entityType) {
      case 'quote':
        // Quote sent without response for >7 days
        if (entity.status === 'sent' && entity.created_at) {
          const daysSinceSent = differenceInDays(new Date(), parseISO(entity.created_at));
          if (daysSinceSent > 7) {
            result.push({
              id: 'quote-no-response',
              label: `⏰ Sem resposta (${daysSinceSent} dias)`,
              variant: 'warning',
              priority: 'attention',
              tooltip: 'Orçamento enviado há mais de 7 dias sem resposta',
            });
          }
        }

        // Quote expired
        if (entity.validity_date && isPast(parseISO(entity.validity_date))) {
          result.push({
            id: 'quote-expired',
            label: '📅 Vencido',
            variant: 'destructive',
            priority: 'urgent',
            tooltip: 'Orçamento passou da data de validade',
          });
        }

        // Quote accepted but no job created
        if (entity.status === 'accepted' && !entity.job_id) {
          result.push({
            id: 'quote-no-job',
            label: '🎯 Criar Job',
            variant: 'success',
            priority: 'attention',
            tooltip: 'Orçamento aceito - converter em job',
          });
        }
        break;

      case 'invoice':
        // Invoice overdue - only show if actually overdue (positive days)
        if (entity.due_date) {
          const daysOverdue = differenceInDays(new Date(), parseISO(entity.due_date));
          const isActuallyOverdue = daysOverdue > 0 && entity.status !== 'paid' && entity.status !== 'cancelled';
          
          if (isActuallyOverdue) {
            result.push({
              id: 'invoice-overdue',
              label: `🚨 Vencido há ${daysOverdue} dias`,
              variant: 'destructive',
              priority: 'urgent',
              tooltip: 'Fatura vencida - enviar lembrete',
            });
          }
        }

        // Invoice issued for >30 days without payment
        if (entity.status === 'issued' && entity.issue_date) {
          const daysSinceIssue = differenceInDays(new Date(), parseISO(entity.issue_date));
          if (daysSinceIssue > 30) {
            result.push({
              id: 'invoice-long-pending',
              label: `⚠️ Pendente (${daysSinceIssue} dias)`,
              variant: 'warning',
              priority: 'attention',
              tooltip: 'Fatura emitida há mais de 30 dias',
            });
          }
        }

        // Invoice paid but no receipt - removed (receipts now generated on-demand)
        break;

      case 'job':
        // Job without contract
        if (!entity.contract_id && entity.status === 'confirmed') {
          result.push({
            id: 'job-no-contract',
            label: '⚠️ Sem contrato',
            variant: 'warning',
            priority: 'attention',
            tooltip: 'Job confirmado sem contrato',
          });
        }

        // Job completed without deliverables
        if (entity.status === 'completed' && entity.deliverables_count === 0) {
          result.push({
            id: 'job-no-deliverables',
            label: '📦 Sem entregáveis',
            variant: 'warning',
            priority: 'attention',
            tooltip: 'Job concluído sem entregáveis registados',
          });
        }

        // Job past date but still scheduled
        if (entity.status === 'scheduled' && entity.end_datetime && isPast(parseISO(entity.end_datetime))) {
          result.push({
            id: 'job-past-scheduled',
            label: '🔄 Atualizar Status',
            variant: 'warning',
            priority: 'attention',
            tooltip: 'Job passou da data mas ainda está agendado',
          });
        }
        break;

      case 'payment':
        // Payment paid without receipt - removed (receipts now generated on-demand)

        // Payment overdue
        if (entity.status === 'pending' && entity.due_date && isPast(parseISO(entity.due_date))) {
          const daysOverdue = differenceInDays(new Date(), parseISO(entity.due_date));
          result.push({
            id: 'payment-overdue',
            label: `🚨 Vencido (${daysOverdue} dias)`,
            variant: 'destructive',
            priority: 'urgent',
            tooltip: 'Pagamento em atraso',
          });
        }
        break;

      case 'contract':
        // Contract sent without signature
        if ((entity.status === 'sent' || entity.status === 'pending_signature') && entity.issued_at) {
          const daysSinceSent = differenceInDays(new Date(), parseISO(entity.issued_at));
          if (daysSinceSent > 5) {
            result.push({
              id: 'contract-no-signature',
              label: `📝 Aguardando há ${daysSinceSent} dias`,
              variant: 'warning',
              priority: 'attention',
              tooltip: 'Contrato enviado aguardando assinatura',
            });
          }
        }

        // Contract signed - suggest job creation
        if (entity.status === 'signed' && !entity.job_id) {
          result.push({
            id: 'contract-signed-no-job',
            label: '✅ Iniciar Job',
            variant: 'success',
            priority: 'info',
            tooltip: 'Contrato assinado - criar job',
          });
        }
        break;

      case 'lead':
        // Lead without follow-up for >14 days
        if (entity.updated_at) {
          const daysSinceUpdate = differenceInDays(new Date(), parseISO(entity.updated_at));
          if (daysSinceUpdate > 14 && entity.status !== 'won' && entity.status !== 'lost') {
            result.push({
              id: 'lead-no-followup',
              label: `⏰ Sem follow-up (${daysSinceUpdate} dias)`,
              variant: 'warning',
              priority: 'attention',
              tooltip: 'Lead sem interação há mais de 14 dias',
            });
          }
        }
        break;
    }

    return result;
  }, [entityType, entity]);

  return badges;
}
