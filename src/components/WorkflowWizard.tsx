import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2, Zap } from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflows';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { Badge } from '@/components/ui/badge';

interface WorkflowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkflowTemplate;
  sourceId: string;
  sourceData: any;
  onComplete?: () => void;
}

const workflowConfigs = {
  quote_to_job: {
    title: 'Criar Job a partir de Orçamento',
    description: 'Automaticamente cria um Job e Contrato quando o orçamento é aceito',
    steps: [
      'Criar Job com dados do orçamento',
      'Vincular orçamento ao Job',
      'Criar contrato em rascunho',
    ],
    icon: '💼 → 📸',
  },
  job_to_invoice: {
    title: 'Criar Fatura após Job',
    description: 'Gera automaticamente uma fatura quando o job é concluído',
    steps: [
      'Obter dados do job',
      'Criar fatura com valores',
      'Atualizar numeração',
    ],
    icon: '📸 → 🧾',
  },
  payment_to_receipt: {
    title: 'Gerar Recibo de Pagamento',
    description: 'Cria um recibo automaticamente após confirmação de pagamento',
    steps: [
      'Confirmar pagamento',
      'Gerar recibo PDF',
      'Marcar como pago',
    ],
    icon: '💰 → 🧾',
  },
  lead_to_quote: {
    title: 'Criar Orçamento para Lead',
    description: 'Transforma um lead contactado em orçamento',
    steps: [
      'Obter dados do lead',
      'Criar orçamento base',
      'Abrir para edição',
    ],
    icon: '🎯 → 💼',
  },
  job_complete_flow: {
    title: 'Fluxo Completo de Conclusão',
    description: 'Completa job, cria fatura e notifica',
    steps: [
      'Marcar job como concluído',
      'Criar fatura automaticamente',
      'Enviar notificação',
    ],
    icon: '📸 → ✅',
  },
};

export function WorkflowWizard({
  open,
  onOpenChange,
  template,
  sourceId,
  sourceData,
  onComplete,
}: WorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { executeWorkflow, isExecuting, progress } = useWorkflowExecution();
  const [completed, setCompleted] = useState(false);

  const config = workflowConfigs[template];

  const handleExecute = async () => {
    try {
      const result = await executeWorkflow({
        template,
        sourceId,
        sourceData,
      });

      if (result.success) {
        setCompleted(true);
        onComplete?.();
      }
    } catch (error) {
      console.error('Workflow error:', error);
    }
  };

  const handleClose = () => {
    setCompleted(false);
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Workflow Icon */}
          <div className="text-center text-3xl mb-4">
            {config.icon}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {config.steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  completed || (isExecuting && progress > (index / config.steps.length) * 100)
                    ? 'bg-primary/5'
                    : 'bg-muted/30'
                }`}
              >
                {completed || (isExecuting && progress > (index / config.steps.length) * 100) ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                ) : isExecuting ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {isExecuting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Executando workflow... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Success Message */}
          {completed && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-sm font-medium text-success">
                  Workflow concluído com sucesso!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!completed ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isExecuting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex-1"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Executar Workflow
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Concluir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
