import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Wrench, Camera, Lightbulb, Video, Package, Calendar, AlertTriangle } from "lucide-react";
import { useResources, Resource } from "@/hooks/useResources";
import { ResourceDialog } from "@/components/ResourceDialog";
import { ResourceCalendar } from "@/components/ResourceCalendar";
import { MaintenanceTracker } from "@/components/MaintenanceTracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const statusConfig = {
  available: { label: "Disponível", variant: "success" as const },
  in_use: { label: "Em Uso", variant: "warning" as const },
  maintenance: { label: "Manutenção", variant: "secondary" as const },
  unavailable: { label: "Indisponível", variant: "destructive" as const },
};

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: resources, isLoading } = useResources();

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedResource(undefined);
    }
  };

  const filteredResources = resources?.filter((resource) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      resource.name?.toLowerCase().includes(searchLower) ||
      resource.type?.toLowerCase().includes(searchLower) ||
      resource.location?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  const showEmptyState = !isLoading && (!resources || resources.length === 0);

  return (
    <div className="space-y-6">
      {/* Header moderno */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Inventário</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Recursos & Equipamentos</h1>
            <p className="text-muted-foreground">
              Gerencie seu inventário de equipamentos fotográficos, controle disponibilidade e agende manutenções
            </p>
          </div>
          <ResourceDialog resource={selectedResource} open={dialogOpen} onOpenChange={handleOpenChange}>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Adicionar Equipamento
            </Button>
          </ResourceDialog>
        </div>
      </div>

      {/* Cards informativos - apenas quando há recursos */}
      {!showEmptyState && resources && resources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                Total de Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{resources.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 bg-gradient-to-br from-success/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <Camera className="h-4 w-4 text-success" />
                </div>
                Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {resources.filter(r => r.status === 'available').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20 bg-gradient-to-br from-warning/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Video className="h-4 w-4 text-warning" />
                </div>
                Em Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {resources.filter(r => r.status === 'in_use').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {resources.filter(r => r.status === 'maintenance').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Barra de pesquisa - apenas quando há recursos */}
          {!showEmptyState && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar equipamentos por nome, tipo ou localização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Lista de recursos */}
          {!showEmptyState && filteredResources && filteredResources.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
                  <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{resource.name}</h3>
                    </div>
                    <Badge variant={statusConfig[resource.status as keyof typeof statusConfig]?.variant || 'default'}>
                      {statusConfig[resource.status as keyof typeof statusConfig]?.label || resource.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">{resource.type}</span>
                    </div>
                    {resource.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Localização:</span>
                        <span className="font-medium">{resource.location}</span>
                      </div>
                    )}
                    {resource.next_maintenance_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Próx. Manutenção:</span>
                        <span className="font-medium">
                          {new Date(resource.next_maintenance_date).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(resource)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Estado vazio melhorado */}
          {showEmptyState && (
            <Card className="border-dashed border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-6 mb-6">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">Comece a gerir seus equipamentos</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Adicione câmeras, lentes, iluminação e outros equipamentos fotográficos. 
                  Controle disponibilidade, localizações e programe manutenções.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                    <Camera className="h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Inventário</div>
                    <div className="text-xs text-muted-foreground text-center">
                      Registe todos os seus equipamentos
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Calendário</div>
                    <div className="text-xs text-muted-foreground text-center">
                      Veja reservas e disponibilidade
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                    <Wrench className="h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Manutenção</div>
                    <div className="text-xs text-muted-foreground text-center">
                      Agende e controle revisões
                    </div>
                  </div>
                </div>

                <ResourceDialog resource={undefined} open={dialogOpen} onOpenChange={handleOpenChange}>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Adicionar Primeiro Equipamento
                  </Button>
                </ResourceDialog>

                <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
                  <p className="text-sm text-muted-foreground">
                    <strong>Exemplos de equipamentos:</strong> Canon EOS R5, Sony A7IV, Lente 24-70mm, 
                    Godox SL-60W, DJI Mini 3 Pro, Tripé Manfrotto, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sem resultados de pesquisa */}
          {!showEmptyState && filteredResources?.length === 0 && (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Nenhum equipamento encontrado</p>
                <p className="text-sm">Tente ajustar os termos de pesquisa</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <ResourceCalendar />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}