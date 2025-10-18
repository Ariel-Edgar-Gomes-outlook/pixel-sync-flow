import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CheckCircle2 } from "lucide-react";
import { useChecklistsByJob, useCreateChecklist, useUpdateChecklist, ChecklistItem } from "@/hooks/useChecklists";
import { toast } from "sonner";

interface ChecklistManagerProps {
  jobId: string;
}

const checklistTemplates = {
  "pre_producao": {
    label: "Pré-Produção",
    items: [
      { text: "Confirmar equipamento necessário", completed: false },
      { text: "Verificar localização e acesso", completed: false },
      { text: "Confirmar horário com cliente", completed: false },
      { text: "Preparar briefing criativo", completed: false },
      { text: "Verificar condições climáticas", completed: false },
    ]
  },
  "durante_sessao": {
    label: "Durante Sessão",
    items: [
      { text: "Verificar iluminação", completed: false },
      { text: "Testar equipamento", completed: false },
      { text: "Capturar diferentes ângulos", completed: false },
      { text: "Fazer backup das fotos", completed: false },
      { text: "Confirmar satisfação do cliente", completed: false },
    ]
  },
  "pos_producao": {
    label: "Pós-Produção",
    items: [
      { text: "Selecionar melhores fotos", completed: false },
      { text: "Editar e retocar imagens", completed: false },
      { text: "Aprovar com cliente", completed: false },
      { text: "Exportar em alta qualidade", completed: false },
      { text: "Entregar ao cliente", completed: false },
    ]
  }
};

export function ChecklistManager({ jobId }: ChecklistManagerProps) {
  const [newChecklistType, setNewChecklistType] = useState("");
  const [customItems, setCustomItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");

  const { data: checklists } = useChecklistsByJob(jobId);
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist();

  const handleCreateFromTemplate = async (type: string) => {
    const template = checklistTemplates[type as keyof typeof checklistTemplates];
    if (!template) return;

    try {
      await createChecklist.mutateAsync({
        job_id: jobId,
        type: template.label,
        items: template.items.map((item, idx) => ({ 
          ...item, 
          id: `${Date.now()}-${idx}` 
        })),
        estimated_time: null,
      });
      toast.success("Checklist criada!");
    } catch (error) {
      toast.error("Erro ao criar checklist");
    }
  };

  const handleCreateCustom = async () => {
    if (!newChecklistType || customItems.length === 0) {
      toast.error("Adicione um nome e itens à checklist");
      return;
    }

    try {
      await createChecklist.mutateAsync({
        job_id: jobId,
        type: newChecklistType,
        items: customItems,
        estimated_time: null,
      });
      toast.success("Checklist criada!");
      setNewChecklistType("");
      setCustomItems([]);
    } catch (error) {
      toast.error("Erro ao criar checklist");
    }
  };

  const handleToggleItem = async (checklistId: string, items: ChecklistItem[], itemId: string) => {
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    try {
      await updateChecklist.mutateAsync({
        id: checklistId,
        items: updatedItems,
      });
    } catch (error) {
      toast.error("Erro ao atualizar item");
    }
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    
    setCustomItems([...customItems, {
      id: `${Date.now()}`,
      text: newItemText,
      completed: false
    }]);
    setNewItemText("");
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Checklists</h3>
        
        {/* Templates */}
        <Card className="p-4 mb-4">
          <Label className="text-sm font-medium mb-2 block">Templates Rápidos</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(checklistTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleCreateFromTemplate(key)}
                disabled={createChecklist.isPending}
              >
                <Plus className="h-3 w-3 mr-1" />
                {template.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Custom Checklist */}
        <Card className="p-4 mb-4">
          <Label className="text-sm font-medium mb-2 block">Criar Checklist Personalizada</Label>
          <div className="space-y-3">
            <Input
              placeholder="Nome da checklist"
              value={newChecklistType}
              onChange={(e) => setNewChecklistType(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
              />
              <Button type="button" size="sm" onClick={addCustomItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {customItems.length > 0 && (
              <div className="space-y-2">
                {customItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1 text-sm">{item.text}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomItem(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button"
                  onClick={handleCreateCustom} 
                  disabled={createChecklist.isPending}
                  className="w-full"
                >
                  Criar Checklist
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Existing Checklists */}
      <div className="space-y-4">
        {checklists?.map((checklist) => {
          const completedCount = checklist.items.filter(item => item.completed).length;
          const totalCount = checklist.items.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <Card key={checklist.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{checklist.type}</h4>
                <Badge variant={progress === 100 ? "success" : "secondary"}>
                  {completedCount}/{totalCount}
                </Badge>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`${checklist.id}-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={() => handleToggleItem(checklist.id, checklist.items, item.id)}
                    />
                    <label
                      htmlFor={`${checklist.id}-${item.id}`}
                      className={`flex-1 text-sm cursor-pointer ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.text}
                    </label>
                    {item.completed && <CheckCircle2 className="h-4 w-4 text-success" />}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
