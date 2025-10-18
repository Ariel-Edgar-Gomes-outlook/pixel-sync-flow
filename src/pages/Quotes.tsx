import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Calendar, Pencil } from "lucide-react";
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

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">Gestão de propostas e orçamentos</p>
        </div>
        <QuoteDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </QuoteDialog>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar orçamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado'}
            </p>
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

      <QuoteDialog 
        quote={selectedQuote} 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
