import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Calendar, CreditCard, Edit } from "lucide-react";
import { usePayments, type Payment } from "@/hooks/usePayments";
import PaymentDialog from "@/components/PaymentDialog";

const statusConfig = {
  pending: { label: "Pendente", variant: "warning" as const },
  paid: { label: "Pago", variant: "success" as const },
  partial: { label: "Parcial", variant: "warning" as const },
  refunded: { label: "Reembolsado", variant: "secondary" as const },
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: payments, isLoading } = usePayments();

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleNewPayment = () => {
    setSelectedPayment(null);
    setIsDialogOpen(true);
  };

  const filteredPayments = payments?.filter(payment =>
    payment.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalRevenue = payments?.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const pendingAmount = payments?.filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gestão de pagamentos e faturação</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleNewPayment}>
          <Plus className="h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-foreground">Kz {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-foreground">Kz {pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transações</p>
              <p className="text-2xl font-bold text-foreground">{payments?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar pagamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery ? 'Nenhum pagamento encontrado' : 'Nenhum pagamento cadastrado'}
            </p>
          ) : (
            filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {payment.clients?.name || 'Cliente não especificado'}
                      </h3>
                      <Badge variant={statusConfig[payment.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                        {statusConfig[payment.status as keyof typeof statusConfig]?.label || payment.status}
                      </Badge>
                      <Badge variant="outline">{payment.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {payment.paid_at 
                            ? `Pago: ${new Date(payment.paid_at).toLocaleDateString("pt-PT")}`
                            : `Criado: ${new Date(payment.created_at).toLocaleDateString("pt-PT")}`
                          }
                        </span>
                      </div>
                      {payment.method && (
                        <div className="text-sm text-muted-foreground">
                          <span>Método: {payment.method}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-foreground">
                      Kz {Number(payment.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {payment.currency || 'AOA'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 gap-2"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <PaymentDialog
        payment={selectedPayment}
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
