import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, TrendingUp, Users, Target, Award } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { LeadDialog } from "@/components/LeadDialog";
import { Lead } from "@/hooks/useLeads";

const statusConfig = {
  new: { label: "Novo", variant: "default" as const },
  contacted: { label: "Contactado", variant: "secondary" as const },
  proposal_sent: { label: "Proposta Enviada", variant: "accent" as const },
  won: { label: "Ganho", variant: "success" as const },
  lost: { label: "Perdido", variant: "destructive" as const },
};

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: leads, isLoading } = useLeads();

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedLead(undefined);
    }
  };

  const filteredLeads = leads?.filter((lead) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.clients?.name?.toLowerCase().includes(searchLower) ||
      lead.source?.toLowerCase().includes(searchLower) ||
      lead.notes?.toLowerCase().includes(searchLower)
    );
  });

  const leadsByStatus = {
    new: filteredLeads?.filter(l => l.status === 'new') || [],
    contacted: filteredLeads?.filter(l => l.status === 'contacted') || [],
    proposal_sent: filteredLeads?.filter(l => l.status === 'proposal_sent') || [],
    won: filteredLeads?.filter(l => l.status === 'won') || [],
    lost: filteredLeads?.filter(l => l.status === 'lost') || [],
  };

  const showEmptyState = !isLoading && (!leads || leads.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pipeline de Leads</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie oportunidades e acompanhe leads desde o primeiro contacto até conversão
          </p>
        </div>
        <LeadDialog lead={selectedLead} open={dialogOpen} onOpenChange={handleOpenChange}>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </LeadDialog>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a gerir seus leads</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Organize leads de diferentes fontes e acompanhe cada oportunidade através 
              do pipeline: Novo → Contactado → Proposta → Ganho/Perdido
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Users className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Fontes Variadas</div>
                <div className="text-xs text-muted-foreground text-center">
                  Instagram, WhatsApp, indicação, site
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Target className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Pipeline Kanban</div>
                <div className="text-xs text-muted-foreground text-center">
                  Arraste cards entre estágios
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Award className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Taxa de Conversão</div>
                <div className="text-xs text-muted-foreground text-center">
                  Acompanhe probabilidade e resultados
                </div>
              </div>
            </div>

            <LeadDialog lead={selectedLead} open={dialogOpen} onOpenChange={handleOpenChange}>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Primeiro Lead
              </Button>
            </LeadDialog>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Defina a probabilidade de conversão (0-100%) para cada lead e 
                acompanhe quais fontes trazem melhores resultados
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por cliente, fonte ou notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => (
          <Card key={status} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{statusConfig[status].label}</h3>
              <Badge variant={statusConfig[status].variant}>
                {leadsByStatus[status].length}
              </Badge>
            </div>
            <div className="space-y-3">
              {leadsByStatus[status].map((lead) => (
                <Card key={lead.id} className="p-3 bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {lead.clients?.name || 'Sem cliente'}
                      </h4>
                      {lead.source && (
                        <p className="text-xs text-muted-foreground mt-1">
                          via {lead.source}
                        </p>
                      )}
                      {lead.probability && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Probabilidade: {lead.probability}%
                        </p>
                      )}
                      {lead.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {lead.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(lead.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(lead)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
              {leadsByStatus[status].length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhum lead
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
