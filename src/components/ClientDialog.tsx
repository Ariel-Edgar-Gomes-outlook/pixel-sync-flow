import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateClient, useUpdateClient, Client } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { ClientHistory } from "@/components/ClientHistory";
import { TagsInput } from "@/components/TagsInput";
import { Plus, User, Building, Mail, Phone, MapPin, FileText } from "lucide-react";

interface ClientDialogProps {
  children?: React.ReactNode;
  client?: Client;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ClientDialog({ children, client, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("person");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { toast } = useToast();

  useEffect(() => {
    if (client) {
      setName(client.name || "");
      setEmail(client.email || "");
      setPhone(client.phone || "");
      setAddress(client.address || "");
      setType(client.type || "person");
      setNotes(client.notes || "");
      setTags(client.tags || []);
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const clientData = {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        type,
        notes: notes || null,
        tags: tags,
        preferences: client?.preferences || {},
      };

      if (client) {
        await updateClient.mutateAsync({ id: client.id, ...clientData });
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso",
        });
      } else {
        await createClient.mutateAsync(clientData);
        toast({
          title: "Sucesso",
          description: "Cliente criado com sucesso",
        });
      }

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setType("person");
      setNotes("");
      setTags([]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao ${client ? 'atualizar' : 'criar'} cliente. Tente novamente.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {!children && !client && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client 
              ? "Atualize as informações de contacto e detalhes do cliente" 
              : "Adicione um novo cliente à sua carteira"}
          </DialogDescription>
        </DialogHeader>
        
        {client ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-6">
                <ClientForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  phone={phone}
                  setPhone={setPhone}
                  address={address}
                  setAddress={setAddress}
                  type={type}
                  setType={setType}
                  notes={notes}
                  setNotes={setNotes}
                  tags={tags}
                  setTags={setTags}
                  setOpen={setOpen}
                  createClient={createClient}
                  updateClient={updateClient}
                  isEditing={!!client}
                />
              </form>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 py-4">
              <ClientHistory clientId={client.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ClientForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              address={address}
              setAddress={setAddress}
              type={type}
              setType={setType}
              notes={notes}
              setNotes={setNotes}
              tags={tags}
              setTags={setTags}
              setOpen={setOpen}
              createClient={createClient}
              updateClient={updateClient}
              isEditing={false}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ClientFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  address: string;
  setAddress: (address: string) => void;
  type: string;
  setType: (type: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  setOpen: (open: boolean) => void;
  createClient: any;
  updateClient: any;
  isEditing: boolean;
}

function ClientForm({
  name, setName, email, setEmail, phone, setPhone, address, setAddress,
  type, setType, notes, setNotes, tags, setTags, setOpen, createClient, updateClient, isEditing
}: ClientFormProps) {
  return (
    <>
      {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Informações Básicas</h3>
            </div>
            
            <div className="grid gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva ou Empresa Fotografia Lda"
                  required
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Nome da pessoa ou empresa
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm font-medium">Tipo de Cliente</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">👤 Pessoa Individual</SelectItem>
                    <SelectItem value="company">🏢 Empresa/Organização</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Define se é cliente individual ou corporativo
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contactos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Contactos</h3>
            </div>
            
            <div className="grid gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Email principal para comunicação e envio de orçamentos
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+244 912 345 678"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Número de telefone ou WhatsApp para contacto direto
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Morada
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, Bairro, Luanda"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Endereço físico do cliente (opcional)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notas e Observações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Notas e Preferências</h3>
            </div>
            
            <div className="grid gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Observações
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Prefere sessões ao ar livre, casamento em Junho de 2025, cliente VIP..."
                  rows={4}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Preferências, histórico, datas importantes ou qualquer informação relevante
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags/Categorias
                </Label>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  placeholder="Adicionar tag (ex: VIP, Corporativo, Recorrente...)"
                />
                <p className="text-xs text-muted-foreground">
                  Tags para organizar e filtrar clientes facilmente
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createClient.isPending || updateClient.isPending} 
              className="w-full sm:w-auto"
            >
              {createClient.isPending || updateClient.isPending
                ? "Guardando..."
                : isEditing ? "Atualizar Cliente" : "Criar Cliente"}
            </Button>
          </div>
    </>
  );
}