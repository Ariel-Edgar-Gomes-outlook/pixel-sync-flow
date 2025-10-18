import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Calendar, Pencil, DollarSign, Send, CheckCircle } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { QuoteDialog } from "@/components/QuoteDialog";

const statusConfig = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  sent: { label: "Enviado", variant: "primary" as const },
  accepted: { label: "Aceite", variant: "success" as const },
  rejected: { label: "Rejeitado", variant: "destructive" as const },
};

export default function Quotes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: quotes, isLoading } = useQuotes();

  const handleEdit = (quote: any) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedQuote(null);
  };

  const filteredQuotes = quotes?.filter(quote =>
    quote.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const showEmptyState = !isLoading && (!quotes || quotes.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crie propostas profissionais e acompanhe aceitações de clientes
          </p>
        </div>
        <QuoteDialog>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </QuoteDialog>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a enviar orçamentos</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crie orçamentos detalhados com itens, valores, impostos e descontos. 
              Acompanhe o status desde rascunho até aceitação pelo cliente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Itemizado</div>
                <div className="text-xs text-muted-foreground text-center">
                  Liste serviços, produtos e valores
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Send className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Envio Profissional</div>
                <div className="text-xs text-muted-foreground text-center">
                  Gere PDF e envie ao cliente
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Conversão em Job</div>
                <div className="text-xs text-muted-foreground text-center">
                  Orçamento aceite vira trabalho
                </div>
              </div>
            </div>

            <QuoteDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar Primeiro Orçamento
              </Button>
            </QuoteDialog>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Fluxo:</strong> Lead recebe orçamento → Cliente aceita → Cria-se Job automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Nenhum orçamento encontrado</p>
                <p className="text-sm">Tente ajustar os termos de pesquisa</p>
              </div>
            ) : (
            filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {quote.clients?.name || 'Cliente não especificado'}
                      </h3>
                      <Badge variant={statusConfig[quote.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                        {statusConfig[quote.status as keyof typeof statusConfig]?.label || quote.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Criado: {new Date(quote.created_at).toLocaleDateString("pt-PT")}</span>
                      </div>
                      {quote.validity_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Validade: {new Date(quote.validity_date).toLocaleDateString("pt-PT")}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Moeda:</span>
                        <span className="font-medium">{quote.currency || 'AOA'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-foreground">
                      {Number(quote.total).toFixed(2)} {quote.currency || 'AOA'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 gap-2"
                      onClick={() => handleEdit(quote)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </Card>
      )}

      <QuoteDialog 
        quote={selectedQuote} 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
