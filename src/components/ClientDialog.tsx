import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateClient, useUpdateClient, Client } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

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
        tags: client?.tags || [],
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
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Pessoa</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+244 912 345 678"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Morada</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Cidade, Luanda"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informações adicionais sobre o cliente..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={createClient.isPending || updateClient.isPending} className="w-full sm:w-auto">
              {client ? (updateClient.isPending ? "Atualizando..." : "Atualizar") : (createClient.isPending ? "Criando..." : "Criar Cliente")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}