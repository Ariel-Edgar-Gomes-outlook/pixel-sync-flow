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
      name: "1 Mês",
      price: "5.000 AOA",
      months: 1,
      paymentUrl: "https://payrails.com/payment/9b4da62a-3c02-48de-a1fd-6fad7d17a05b?currency=AOA&amount=5000",
      features: ["Acesso completo", "Todas as funcionalidades", "Suporte por email"]
    },
    {
      name: "3 Meses",
      price: "13.500 AOA",
      months: 3,
      paymentUrl: "https://payrails.com/payment/9b4da62a-3c02-48de-a1fd-6fad7d17a05b?currency=AOA&amount=13500",
      features: ["Acesso completo", "Todas as funcionalidades", "Suporte prioritário", "10% de desconto"],
      popular: true
    },
    {
      name: "6 Meses",
      price: "24.000 AOA",
      months: 6,
      paymentUrl: "https://payrails.com/payment/9b4da62a-3c02-48de-a1fd-6fad7d17a05b?currency=AOA&amount=24000",
      features: ["Acesso completo", "Todas as funcionalidades", "Suporte prioritário", "20% de desconto"]
    },
    {
      name: "12 Meses",
      price: "42.000 AOA",
      months: 12,
      paymentUrl: "https://payrails.com/payment/9b4da62a-3c02-48de-a1fd-6fad7d17a05b?currency=AOA&amount=42000",
      features: ["Acesso completo", "Todas as funcionalidades", "Suporte prioritário", "30% de desconto"],
      bestValue: true
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
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Assinatura</h1>
        <p className="text-muted-foreground">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <h2 className="text-2xl font-bold mb-4">Planos de Assinatura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular || plan.bestValue ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Mais Popular</Badge>
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500">Melhor Valor</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular || plan.bestValue ? "default" : "outline"}
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
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
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
