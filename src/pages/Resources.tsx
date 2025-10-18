import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Wrench } from "lucide-react";
import { useResources, Resource } from "@/hooks/useResources";
import { ResourceDialog } from "@/components/ResourceDialog";

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

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedResource(undefined);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Recursos & Equipamentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie seus equipamentos fotográficos
          </p>
        </div>
        <ResourceDialog resource={selectedResource} open={dialogOpen} onOpenChange={handleCloseDialog}>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Recurso
          </Button>
        </ResourceDialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Procurar recursos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResources?.map((resource) => (
          <Card key={resource.id} className="p-4 hover:shadow-md transition-shadow">
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
          </Card>
        ))}
      </div>

      {filteredResources?.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum recurso encontrado</p>
          </div>
        </Card>
      )}
    </div>
  );
}