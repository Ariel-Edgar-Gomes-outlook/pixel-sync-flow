import { useMemo } from 'react';
import { ContextualAction } from '@/types/workflows';

interface UseContextualActionsProps {
  entityType: 'quote' | 'invoice' | 'job' | 'payment' | 'contract' | 'lead';
  entity: any;
}

/**
 * Hook to generate contextual actions based on entity state
 * FASE 3.1: Returns empty array for now (foundation)
 * FASE 3.3: Will be implemented with real actions
 */
export function useContextualActions({ entityType, entity }: UseContextualActionsProps): ContextualAction[] {
  const actions = useMemo(() => {
    const result: ContextualAction[] = [];
    
    if (!entity) return result;

    // QUOTE ACTIONS
    if (entityType === 'quote') {
      if (entity.status === 'sent' || entity.status === 'draft') {
        result.push({
          id: `quote-${entity.id}-create-job`,
          label: 'Criar Job',
          type: 'create_job',
          priority: 'attention',
          entityId: entity.id,
          entityType: 'quote',
          icon: 'briefcase',
          onClick: () => {
            // Will be handled by parent component
            console.log('Create job from quote', entity.id);
          }
        });
      }

      if (entity.status === 'accepted' && !entity.job_id) {
        result.push({
          id: `quote-${entity.id}-create-contract`,
          label: 'Criar Contrato',
          type: 'create_contract',
          priority: 'urgent',
          entityId: entity.id,
          entityType: 'quote',
          icon: 'file-text',
          onClick: () => {
            console.log('Create contract from quote', entity.id);
          }
        });
      }
    }

    // INVOICE ACTIONS
    if (entityType === 'invoice') {
      const isOverdue = entity.due_date && new Date(entity.due_date) < new Date() && entity.status !== 'paid';
      
      if (isOverdue) {
        result.push({
          id: `invoice-${entity.id}-send-reminder`,
          label: 'Enviar Lembrete',
          type: 'send_reminder',
          priority: 'urgent',
          entityId: entity.id,
          entityType: 'invoice',
          icon: 'bell',
          onClick: () => {
            console.log('Send reminder for invoice', entity.id);
          }
        });
      }

      if (entity.status === 'draft') {
        result.push({
          id: `invoice-${entity.id}-send`,
          label: 'Enviar Fatura',
          type: 'update_status',
          priority: 'attention',
          entityId: entity.id,
          entityType: 'invoice',
          icon: 'send',
          onClick: () => {
            console.log('Send invoice', entity.id);
          }
        });
      }
    }

    // PAYMENT OVERDUE CHECK
    if (entityType === 'payment') {
      const isOverdue = entity.due_date && new Date(entity.due_date) < new Date() && entity.status !== 'paid';
      
      if (isOverdue) {
        result.push({
          id: `payment-${entity.id}-send-reminder`,
          label: 'Lembrar Cliente',
          type: 'send_reminder',
          priority: 'urgent',
          entityId: entity.id,
          entityType: 'payment',
          icon: 'bell',
          onClick: () => {
            console.log('Send payment reminder', entity.id);
          }
        });
      }
    }

    // CONTRACT ACTIONS
    if (entityType === 'contract') {
      if (entity.status === 'draft') {
        result.push({
          id: `contract-${entity.id}-send`,
          label: 'Enviar para Assinatura',
          type: 'update_status',
          priority: 'attention',
          entityId: entity.id,
          entityType: 'contract',
          icon: 'send',
          onClick: () => {
            console.log('Send contract for signature', entity.id);
          }
        });
      }

      if (entity.status === 'sent') {
        result.push({
          id: `contract-${entity.id}-remind`,
          label: 'Lembrar Assinatura',
          type: 'send_reminder',
          priority: 'attention',
          entityId: entity.id,
          entityType: 'contract',
          icon: 'bell',
          onClick: () => {
            console.log('Remind contract signature', entity.id);
          }
        });
      }

      if (entity.status === 'signed' && !entity.job_id) {
        result.push({
          id: `contract-${entity.id}-create-job`,
          label: 'Iniciar Job',
          type: 'create_job',
          priority: 'urgent',
          entityId: entity.id,
          entityType: 'contract',
          icon: 'play',
          onClick: () => {
            console.log('Create job from contract', entity.id);
          }
        });
      }
    }

    // JOB ACTIONS
    if (entityType === 'job') {
      if (entity.status === 'confirmed' && !entity.contract_id) {
        result.push({
          id: `job-${entity.id}-create-contract`,
          label: 'Criar Contrato',
          type: 'create_contract',
          priority: 'urgent',
          entityId: entity.id,
          entityType: 'job',
          icon: 'file-text',
          onClick: () => {
            console.log('Create contract for job', entity.id);
          }
        });
      }

      if (entity.status === 'completed') {
        result.push({
          id: `job-${entity.id}-create-invoice`,
          label: 'Criar Fatura',
          type: 'create_invoice',
          priority: 'attention',
          entityId: entity.id,
          entityType: 'job',
          icon: 'file-text',
          onClick: () => {
            console.log('Create invoice for job', entity.id);
          }
        });
      }
    }

    // LEAD ACTIONS
    if (entityType === 'lead') {
      if (entity.status === 'contacted') {
        result.push({
          id: `lead-${entity.id}-create-quote`,
          label: 'Criar Orçamento',
          type: 'create_invoice',
          priority: 'attention',
          entityId: entity.id,
          entityType: 'lead',
          icon: 'file-text',
          onClick: () => {
            console.log('Create quote for lead', entity.id);
          }
        });
      }

      if (entity.status === 'new') {
        result.push({
          id: `lead-${entity.id}-follow-up`,
          label: 'Seguir Contacto',
          type: 'follow_up',
          priority: 'info',
          entityId: entity.id,
          entityType: 'lead',
          icon: 'phone',
          onClick: () => {
            console.log('Follow up lead', entity.id);
          }
        });
      }
    }
    
    return result;
  }, [entityType, entity]);

  return actions;
}
