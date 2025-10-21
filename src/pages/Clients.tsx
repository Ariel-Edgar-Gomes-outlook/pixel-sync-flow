import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Mail, Phone, MapPin, ExternalLink, Edit, Users, UserPlus, Building, Download } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { ClientDialog } from "@/components/ClientDialog";
import { exportToExcel, formatClientsForExport } from "@/lib/exportUtils";
import { toast } from "sonner";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const { data: clients, isLoading } = useClients();

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
  };

  const handleExport = () => {
    if (clients && clients.length > 0) {
      const formatted = formatClientsForExport(clients);
      exportToExcel(formatted, "clientes.xlsx", "Clientes");
      toast.success("Clientes exportados com sucesso!");
    }
  };

  const filteredClients = useMemo(() => {
    let filtered = clients?.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || client.type === typeFilter;
      return matchesSearch && matchesType;
    }) || [];

    // Ordenação
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [clients, searchQuery, typeFilter, sortBy]);

  const showEmptyState = !isLoading && (!clients || clients.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie sua carteira de clientes, contactos e histórico de trabalhos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <ClientDialog />
        </div>
      </div>

      {/* Estado vazio informativo */}
      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a gerir seus clientes</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Adicione clientes individuais ou empresas. Guarde informações de contacto, 
              preferências e histórico de projetos em um só lugar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <UserPlus className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Pessoas & Empresas</div>
                <div className="text-xs text-muted-foreground text-center">
                  Cadastre clientes individuais ou corporativos
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Phone className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Contactos</div>
                <div className="text-xs text-muted-foreground text-center">
                  Email, telefone, endereço e links externos
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Building className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Organização</div>
                <div className="text-xs text-muted-foreground text-center">
                  Tags, preferências e pasta de arquivos
                </div>
              </div>
            </div>

            <ClientDialog />

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Use tags como "VIP", "Casamento", "Corporativo" para organizar melhor seus clientes
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
                  placeholder="Pesquisar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredClients.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Nenhum cliente encontrado</p>
                <p className="text-sm">Tente ajustar os termos de pesquisa</p>
              </div>
            ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border"
              >
                <div className="flex-1">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm sm:text-base shrink-0">
                      {client.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{client.name}</h3>
                        {client.tags?.includes("VIP") && (
                          <Badge variant="accent" className="text-xs">VIP</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{client.type}</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                        {client.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            {client.phone}
                          </span>
                        )}
                        {client.address && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{client.address}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-center">
                  {client.external_folder_link && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={client.external_folder_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(client)}
                    className="gap-2"
                  >
                    <Edit className="h-3 w-3" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                </div>
              </div>
            ))
            )}
          </div>
        </Card>
      )}

      <ClientDialog
        client={selectedClient} 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
