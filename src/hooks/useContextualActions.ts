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
    
    // FASE 3.1: Foundation only - no actions yet
    // This will be implemented in FASE 3.3
    
    return result;
  }, [entityType, entity]);

  return actions;
}
