import { useMemo } from 'react';
import { Alert } from '@/types/workflows';
import { differenceInDays } from 'date-fns';

interface UseActionableAlertsProps {
  quotes?: any[];
  invoices?: any[];
  payments?: any[];
  contracts?: any[];
  jobs?: any[];
  leads?: any[];
}

export function useActionableAlerts({
  quotes = [],
  invoices = [],
  payments = [],
  contracts = [],
  jobs = [],
  leads = []
}: UseActionableAlertsProps): Alert[] {
  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const now = new Date();

    // OVERDUE INVOICES
    const overdueInvoices = invoices.filter(inv => 
      inv.due_date && 
      new Date(inv.due_date) < now && 
      inv.status !== 'paid'
    );
    if (overdueInvoices.length > 0) {
      result.push({
        id: 'overdue-invoices',
        title: 'Faturas Vencidas',
        description: `${overdueInvoices.length} fatura(s) vencida(s) aguardando pagamento`,
        priority: 'urgent',
        entityType: 'invoice',
        entityId: 'multiple',
        count: overdueInvoices.length,
        action: {
          label: 'Ver Faturas',
          path: '/invoices'
        }
      });
    }

    // OVERDUE PAYMENTS
    const overduePayments = payments.filter(pay => 
      pay.due_date && 
      new Date(pay.due_date) < now && 
      pay.status === 'pending'
    );
    if (overduePayments.length > 0) {
      result.push({
        id: 'overdue-payments',
        title: 'Pagamentos Vencidos',
        description: `${overduePayments.length} pagamento(s) vencido(s)`,
        priority: 'urgent',
        entityType: 'payment',
        entityId: 'multiple',
        count: overduePayments.length,
        action: {
          label: 'Ver Pagamentos',
          path: '/payments'
        }
      });
    }

    // OLD QUOTES WITHOUT RESPONSE
    const oldQuotes = quotes.filter(q => {
      if (q.status !== 'sent') return false;
      const daysSinceSent = differenceInDays(now, new Date(q.created_at));
      return daysSinceSent > 7;
    });
    if (oldQuotes.length > 0) {
      result.push({
        id: 'old-quotes',
        title: 'Orçamentos Sem Resposta',
        description: `${oldQuotes.length} orçamento(s) enviado(s) há mais de 7 dias sem resposta`,
        priority: 'attention',
        entityType: 'quote',
        entityId: 'multiple',
        count: oldQuotes.length,
        action: {
          label: 'Ver Orçamentos',
          path: '/quotes'
        }
      });
    }

    // UNSIGNED CONTRACTS
    const unsignedContracts = contracts.filter(c => c.status === 'sent');
    if (unsignedContracts.length > 0) {
      result.push({
        id: 'unsigned-contracts',
        title: 'Contratos Aguardando Assinatura',
        description: `${unsignedContracts.length} contrato(s) aguardando assinatura`,
        priority: 'attention',
        entityType: 'contract',
        entityId: 'multiple',
        count: unsignedContracts.length,
        action: {
          label: 'Ver Contratos',
          path: '/contracts'
        }
      });
    }

    // PAID PAYMENTS WITHOUT RECEIPT
    const paymentsWithoutReceipt = payments.filter(pay => 
      pay.status === 'paid' && !pay.receipt_generated_at
    );
    if (paymentsWithoutReceipt.length > 0) {
      result.push({
        id: 'payments-without-receipt',
        title: 'Recibos Pendentes',
        description: `${paymentsWithoutReceipt.length} pagamento(s) sem recibo gerado`,
        priority: 'attention',
        entityType: 'payment',
        entityId: 'multiple',
        count: paymentsWithoutReceipt.length,
        action: {
          label: 'Gerar Recibos',
          path: '/payments'
        }
      });
    }

    // UPCOMING JOBS (next 3 days)
    const upcomingJobs = jobs.filter(job => {
      const start = new Date(job.start_datetime);
      const daysUntil = differenceInDays(start, now);
      return daysUntil >= 0 && daysUntil <= 3 && job.status === 'confirmed';
    });
    if (upcomingJobs.length > 0) {
      result.push({
        id: 'upcoming-jobs',
        title: 'Jobs Próximos',
        description: `${upcomingJobs.length} job(s) agendado(s) para os próximos 3 dias`,
        priority: 'info',
        entityType: 'job',
        entityId: 'multiple',
        count: upcomingJobs.length,
        action: {
          label: 'Ver Jobs',
          path: '/jobs'
        }
      });
    }

    // COMPLETED JOBS WITHOUT INVOICE
    const completedJobsNoInvoice = jobs.filter(job => {
      const hasInvoice = invoices.some(inv => inv.job_id === job.id);
      return job.status === 'completed' && !hasInvoice;
    });
    if (completedJobsNoInvoice.length > 0) {
      result.push({
        id: 'completed-jobs-no-invoice',
        title: 'Jobs Concluídos Sem Fatura',
        description: `${completedJobsNoInvoice.length} job(s) concluído(s) sem fatura emitida`,
        priority: 'attention',
        entityType: 'job',
        entityId: 'multiple',
        count: completedJobsNoInvoice.length,
        action: {
          label: 'Ver Jobs',
          path: '/jobs'
        }
      });
    }

    // NEW LEADS WITHOUT FOLLOW-UP
    const newLeads = leads.filter(lead => {
      const daysSinceCreated = differenceInDays(now, new Date(lead.created_at));
      return lead.status === 'new' && daysSinceCreated > 2;
    });
    if (newLeads.length > 0) {
      result.push({
        id: 'new-leads-no-followup',
        title: 'Leads Sem Seguimento',
        description: `${newLeads.length} lead(s) novo(s) sem seguimento há mais de 2 dias`,
        priority: 'info',
        entityType: 'lead',
        entityId: 'multiple',
        count: newLeads.length,
        action: {
          label: 'Ver Leads',
          path: '/leads'
        }
      });
    }

    // Sort by priority: urgent > attention > info
    const priorityOrder = { urgent: 0, attention: 1, info: 2 };
    result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return result;
  }, [quotes, invoices, payments, contracts, jobs, leads]);

  return alerts;
}
