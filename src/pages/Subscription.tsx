import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const Subscription = () => {
  const { user } = useAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentUrl, setSelectedPaymentUrl] = useState("");

  const isLoading = subscriptionLoading || profileLoading;

  const openPaymentModal = (url: string) => {
    setSelectedPaymentUrl(url);
    setPaymentModalOpen(true);
  };

  const getSubscriptionMonths = () => {
    if (!subscription?.subscriptionStartDate || !subscription?.subscriptionEndDate) {
      return null;
    }
    
    const start = new Date(subscription.subscriptionStartDate);
    const end = new Date(subscription.subscriptionEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.round(diffDays / 30);
    
    return months;
  };

  const subscriptionPlans = [
    {
      name: "Mensal",
      price: "6.300 Kz/mês",
      oldPrice: "12.000 Kz/mês",
      months: 1,
      paymentUrl: "https://pay.kuenha.com/9e7ff119-5bba-49e3-b687-8611f7d5a071",
      features: [
        "Clientes e leads ilimitados",
        "Jobs e projetos sem limites",
        "Faturas e orçamentos profissionais",
        "Galerias privadas para clientes",
        "Suporte por email"
      ]
    },
    {
      name: "Trimestral",
      price: "18.900 Kz",
      pricePerMonth: "6.300 Kz/mês",
      oldPrice: "36.000 Kz",
      months: 3,
      paymentUrl: "https://pay.kuenha.com/f9d43b5b-c7b5-4c9b-805c-5cc2a1021e9a",
      features: [
        "Clientes e leads ilimitados",
        "Jobs e projetos sem limites",
        "Faturas e orçamentos profissionais",
        "Galerias privadas para clientes",
        "Gestão de equipa e equipamentos",
        "Suporte por email"
      ]
    },
    {
      name: "Semestral",
      price: "37.800 Kz",
      pricePerMonth: "6.300 Kz/mês",
      oldPrice: "72.000 Kz",
      months: 6,
      paymentUrl: "https://pay.kuenha.com/c91201b9-fca7-4129-aebb-fdae6a754fc7",
      features: [
        "Clientes e leads ilimitados",
        "Jobs e projetos sem limites",
        "Faturas e orçamentos profissionais",
        "Galerias privadas para clientes",
        "Gestão de equipa e equipamentos",
        "Contratos com assinatura digital",
        "Suporte por email"
      ]
    },
    {
      name: "Anual",
      price: "75.600 Kz",
      pricePerMonth: "6.300 Kz/mês",
      oldPrice: "144.000 Kz",
      months: 12,
      paymentUrl: "https://pay.kuenha.com/3f8726f4-cca9-4e46-b321-49c1eadd821d",
      features: [
        "Clientes e leads ilimitados",
        "Jobs e projetos sem limites",
        "Faturas e orçamentos profissionais",
        "Galerias privadas para clientes",
        "Gestão de equipa e equipamentos",
        "Contratos com assinatura digital",
        "Notificações automáticas",
        "Relatórios financeiros completos",
        "Suporte por email"
      ],
      popular: true
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Minha Assinatura</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie sua assinatura e atualize seu plano
        </p>
      </div>

      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status da Assinatura
            {subscription?.isActive ? (
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ativa
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Expirada
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Data de Início</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {subscription?.subscriptionStartDate
                  ? format(new Date(subscription.subscriptionStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Não definida"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Data de Término</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {subscription?.subscriptionEndDate
                  ? format(new Date(subscription.subscriptionEndDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Acesso ilimitado"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dias Restantes</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {subscription?.daysRemaining === -1
                  ? "Ilimitado"
                  : `${subscription?.daysRemaining || 0} dias`}
              </p>
            </div>
          </div>

          {getSubscriptionMonths() && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-lg font-semibold">
                Assinatura de {getSubscriptionMonths()} {getSubscriptionMonths() === 1 ? 'mês' : 'meses'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 px-2">Planos de Assinatura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary whitespace-nowrap px-3 py-1 text-xs sm:text-sm">Mais Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                <CardDescription className="space-y-1">
                  {plan.oldPrice && (
                    <p className="text-muted-foreground line-through text-xs sm:text-sm">
                      {plan.oldPrice}
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.pricePerMonth && (
                      <span className="text-xs text-muted-foreground">
                        {plan.pricePerMonth}
                      </span>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                <Button
                  className="w-full text-sm sm:text-base"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => openPaymentModal(plan.paymentUrl)}
                >
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p>• Todas as assinaturas incluem acesso completo a todas as funcionalidades do sistema.</p>
          <p>• O pagamento é processado de forma segura através do PayRails.</p>
          <p>• Após o pagamento, sua assinatura será ativada automaticamente.</p>
          <p>• Você pode atualizar ou renovar sua assinatura a qualquer momento.</p>
          <p>• Para dúvidas ou suporte, entre em contato conosco.</p>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setPaymentModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-3xl max-h-[85vh] bg-background rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Finalizar Pagamento</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPaymentModalOpen(false)}
              >
                Fechar
              </Button>
            </div>
            <iframe
              src={selectedPaymentUrl}
              className="w-full min-h-[600px]"
              title="Pagamento"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
