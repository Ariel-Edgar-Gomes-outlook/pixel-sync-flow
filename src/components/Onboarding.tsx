import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, FileText, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_STEPS = [
  {
    title: 'Bem-vindo ao PhotoFlow! 👋',
    description: 'Vamos fazer um tour rápido pelas principais funcionalidades.',
    icon: CheckCircle,
    action: null,
  },
  {
    title: 'Gestão de Clientes',
    description: 'Centralize todas as informações dos seus clientes, histórico de jobs e pagamentos.',
    icon: Users,
    action: '/clients',
  },
  {
    title: 'Agendamento de Jobs',
    description: 'Organize sessões fotográficas, eventos e trabalhos com calendário integrado.',
    icon: Briefcase,
    action: '/jobs',
  },
  {
    title: 'Orçamentos e Contratos',
    description: 'Crie orçamentos profissionais e gerencie contratos com seus clientes.',
    icon: FileText,
    action: '/quotes',
  },
  {
    title: 'Controle Financeiro',
    description: 'Acompanhe pagamentos, receitas e tenha relatórios completos do seu negócio.',
    icon: CreditCard,
    action: '/payments',
  },
  {
    title: 'Calendário Visual',
    description: 'Visualize todos os seus compromissos e gerencie sua agenda facilmente.',
    icon: Calendar,
    action: '/calendar',
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setOpen(false);
    setCurrentStep(0);
  };

  const handleGoToPage = () => {
    const step = ONBOARDING_STEPS[currentStep];
    if (step.action) {
      handleComplete();
      navigate(step.action);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary" />
            {step.title}
          </DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <Card className="p-6 bg-muted/50">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Icon className="h-20 w-20 text-primary/20" />
            </div>

            {step.action && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Dica:</h4>
                <p className="text-sm text-muted-foreground">
                  Clique em "Ver Agora" para ir direto para esta seção.
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{currentStep + 1} de {ONBOARDING_STEPS.length}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleSkip}>
            Pular Tutorial
          </Button>
          <div className="flex gap-2">
            {step.action && (
              <Button variant="secondary" onClick={handleGoToPage}>
                Ver Agora
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < ONBOARDING_STEPS.length - 1 ? 'Próximo' : 'Concluir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
