import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit } from "lucide-react";
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

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLead(undefined);
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

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Leads (CRM)</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie seus leads e oportunidades
          </p>
        </div>
        <LeadDialog lead={selectedLead} open={dialogOpen} onOpenChange={handleCloseDialog}>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </LeadDialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Procurar leads..."
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
    </div>
  );
}