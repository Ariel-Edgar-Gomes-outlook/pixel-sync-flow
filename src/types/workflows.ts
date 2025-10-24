// Workflow and automation types

export type ActionPriority = 'urgent' | 'attention' | 'info';
export type ActionType = 
  | 'create_invoice'
  | 'create_contract' 
  | 'create_job'
  | 'send_reminder'
  | 'generate_receipt'
  | 'follow_up'
  | 'update_status';

export interface ContextualAction {
  id: string;
  label: string;
  type: ActionType;
  priority: ActionPriority;
  entityId: string;
  entityType: 'quote' | 'invoice' | 'job' | 'payment' | 'contract' | 'lead';
  icon?: string;
  onClick: () => void;
}

export interface SmartBadge {
  id: string;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  priority: ActionPriority;
  tooltip?: string;
  icon?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  entityType: 'quote' | 'invoice' | 'job' | 'payment' | 'contract' | 'lead';
  entityId: string;
  count?: number;
  action?: {
    label: string;
    path: string;
  };
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
}

// Workflow templates
export type WorkflowTemplate = 
  | 'quote_to_job'
  | 'job_to_invoice'
  | 'payment_to_receipt'
  | 'lead_to_quote'
  | 'job_complete_flow';

export interface WorkflowData {
  template: WorkflowTemplate;
  sourceId: string;
  sourceType: 'quote' | 'job' | 'payment' | 'lead' | 'contract';
  context?: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  createdEntities: {
    type: string;
    id: string;
  }[];
  error?: string;
}
