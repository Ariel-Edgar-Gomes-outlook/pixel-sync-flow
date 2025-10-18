import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const mockClients = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "+351 912 345 678",
    type: "Pessoa",
    city: "Lisboa",
    totalJobs: 3,
    totalRevenue: 2450,
    tags: ["Casamento", "VIP"],
    status: "active",
  },
  {
    id: "2",
    name: "João Rodrigues",
    email: "joao.r@email.com",
    phone: "+351 923 456 789",
    type: "Pessoa",
    city: "Porto",
    totalJobs: 1,
    totalRevenue: 450,
    tags: ["Retrato"],
    status: "active",
  },
  {
    id: "3",
    name: "TechStart Lda",
    email: "info@techstart.pt",
    phone: "+351 934 567 890",
    type: "Empresa",
    city: "Lisboa",
    totalJobs: 5,
    totalRevenue: 8900,
    tags: ["Evento", "Comercial"],
    status: "active",
  },
  {
    id: "4",
    name: "Ana Pereira",
    email: "ana.pereira@email.com",
    phone: "+351 945 678 901",
    type: "Pessoa",
    city: "Braga",
    totalJobs: 0,
    totalRevenue: 0,
    tags: ["Lead"],
    status: "lead",
  },
];

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gestão completa da sua carteira de clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {client.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      {client.status === "lead" && (
                        <Badge variant="secondary">Lead</Badge>
                      )}
                      {client.tags.includes("VIP") && (
                        <Badge variant="accent">VIP</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {client.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">{client.totalJobs}</div>
                  <div className="text-xs text-muted-foreground">Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">€{client.totalRevenue}</div>
                  <div className="text-xs text-muted-foreground">Receita</div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
