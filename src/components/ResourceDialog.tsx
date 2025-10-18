import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCreateResource, useUpdateResource, Resource } from "@/hooks/useResources";
import { toast } from "sonner";
import { Camera, Wrench, MapPin, FileText, Calendar } from "lucide-react";

interface ResourceDialogProps {
  children?: React.ReactNode;
  resource?: Resource;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResourceDialog({ children, resource, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ResourceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: resource?.name || "",
    type: resource?.type || "",
    status: resource?.status || "available",
    location: resource?.location || "",
    manual_link: resource?.manual_link || "",
    next_maintenance_date: resource?.next_maintenance_date || "",
  });

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || "",
        type: resource.type || "",
        status: resource.status || "available",
        location: resource.location || "",
        manual_link: resource.manual_link || "",
        next_maintenance_date: resource.next_maintenance_date || "",
      });
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast.error("Nome e tipo são obrigatórios");
      return;
    }

    const resourceData = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      location: formData.location || null,
      manual_link: formData.manual_link || null,
      next_maintenance_date: formData.next_maintenance_date || null,
    };

    try {
      if (resource) {
        await updateResource.mutateAsync({ id: resource.id, ...resourceData });
        toast.success("Recurso atualizado com sucesso!");
      } else {
        await createResource.mutateAsync(resourceData);
        toast.success("Recurso criado com sucesso!");
      }
      setOpen(false);
      setFormData({
        name: "",
        type: "",
        status: "available",
        location: "",
        manual_link: "",
        next_maintenance_date: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar recurso");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {resource ? "Editar Recurso" : "Novo Recurso"}
          </DialogTitle>
          <DialogDescription>
            {resource 
              ? "Atualize as informações do equipamento fotográfico" 
              : "Adicione um novo equipamento ao seu inventário"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Informações Básicas</h3>
            </div>
            
            <div className="grid gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome do Equipamento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Canon EOS R5, Sony A7IV"
                  required
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Identificação clara do equipamento
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">📷 Câmera</SelectItem>
                      <SelectItem value="lens">🔍 Lente</SelectItem>
                      <SelectItem value="lighting">💡 Iluminação</SelectItem>
                      <SelectItem value="tripod">📐 Tripé</SelectItem>
                      <SelectItem value="drone">🚁 Drone</SelectItem>
                      <SelectItem value="accessory">🔧 Acessório</SelectItem>
                      <SelectItem value="other">📦 Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-sm font-medium">Estado Atual</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">✅ Disponível</SelectItem>
                      <SelectItem value="in_use">🎬 Em Uso</SelectItem>
                      <SelectItem value="maintenance">🔧 Em Manutenção</SelectItem>
                      <SelectItem value="unavailable">❌ Indisponível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Localização e Documentação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Localização e Documentação</h3>
            </div>
            
            <div className="grid gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Localização
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Estúdio Principal, Armazém, Casa"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Onde o equipamento está guardado
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="manual_link" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Link do Manual
                </Label>
                <Input
                  id="manual_link"
                  type="url"
                  value={formData.manual_link}
                  onChange={(e) => setFormData({ ...formData, manual_link: e.target.value })}
                  placeholder="https://exemplo.com/manual.pdf"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Link para o manual ou documentação técnica
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Manutenção */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Manutenção</h3>
            </div>
            
            <div className="grid gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="next_maintenance_date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Próxima Manutenção
                </Label>
                <Input
                  id="next_maintenance_date"
                  type="date"
                  value={formData.next_maintenance_date}
                  onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Data prevista para a próxima manutenção ou revisão
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
              disabled={createResource.isPending || updateResource.isPending} 
              className="w-full sm:w-auto"
            >
              {createResource.isPending || updateResource.isPending 
                ? "Guardando..." 
                : resource ? "Atualizar Recurso" : "Criar Recurso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}