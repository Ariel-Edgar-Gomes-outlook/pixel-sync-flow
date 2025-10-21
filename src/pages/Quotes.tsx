import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Calendar, Pencil, DollarSign, Send, CheckCircle, Download } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { QuoteDialog } from "@/components/QuoteDialog";
import { exportToExcel, formatQuotesForExport } from "@/lib/exportUtils";
import { toast } from "sonner";

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "value">("date");
  const { data: quotes, isLoading } = useQuotes();

  const handleEdit = (quote: any) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedQuote(null);
  };

  const handleExport = () => {
    if (quotes && quotes.length > 0) {
      const formatted = formatQuotesForExport(quotes);
      exportToExcel(formatted, "orcamentos.xlsx", "Orçamentos");
      toast.success("Orçamentos exportados com sucesso!");
    }
  };

  const filteredQuotes = useMemo(() => {
    let filtered = quotes?.filter(quote => {
      const matchesSearch = quote.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

    // Ordenação
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "value") {
      filtered.sort((a, b) => Number(b.total) - Number(a.total));
    }

    return filtered;
  }, [quotes, searchQuery, statusFilter, sortBy]);

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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <QuoteDialog>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </QuoteDialog>
        </div>
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
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="accepted">Aceite</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Mais recentes</SelectItem>
                  <SelectItem value="value">Maior valor</SelectItem>
                </SelectContent>
              </Select>
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
                className="p-4 sm:p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          {quote.clients?.name || 'Cliente não especificado'}
                        </h3>
                      </div>
                      <Badge variant={statusConfig[quote.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                        {statusConfig[quote.status as keyof typeof statusConfig]?.label || quote.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Criado: {new Date(quote.created_at).toLocaleDateString("pt-PT")}</span>
                      </div>
                      {quote.validity_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Validade: {new Date(quote.validity_date).toLocaleDateString("pt-PT")}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Moeda:</span>
                        <span className="font-medium">{quote.currency || 'AOA'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 sm:ml-4 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4">
                    <div className="sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-foreground whitespace-nowrap">
                        {Number(quote.total).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quote.currency || 'AOA'}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 w-full sm:w-auto"
                      onClick={() => handleEdit(quote)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sm:inline">Editar</span>
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
