import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useCreateTeamMember } from "@/hooks/useTeamMembers";
import { toast } from "sonner";

interface TeamMemberDialogProps {
  trigger?: React.ReactNode;
}

export function TeamMemberDialog({ trigger }: TeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");

  const createMember = useCreateTeamMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createMember.mutateAsync({
        name,
        email,
        phone,
        type,
      });

      toast.success("Membro da equipe adicionado!");
      setOpen(false);
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setType("");
    } catch (error) {
      toast.error("Erro ao adicionar membro");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Membro de Equipe
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro de Equipe</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Crie um novo membro de equipe que poderá ser atribuído a projetos
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+244 923456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo/Especialidade *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photographer">Fotógrafo</SelectItem>
                <SelectItem value="assistant">Assistente</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="producer">Produtor</SelectItem>
                <SelectItem value="coordinator">Coordenador</SelectItem>
                <SelectItem value="videographer">Videógrafo</SelectItem>
                <SelectItem value="makeup">Maquiador(a)</SelectItem>
                <SelectItem value="stylist">Estilista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMember.isPending}>
              {createMember.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
