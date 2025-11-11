import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CheckCircle2, Save, Trash2 } from "lucide-react";
import { useChecklistsByJob, useCreateChecklist, useUpdateChecklist, useDeleteChecklist, ChecklistItem } from "@/hooks/useChecklists";
import { useChecklistTemplates, useCreateChecklistTemplate } from "@/hooks/useTemplates";
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
  const { data: templates } = useChecklistTemplates();
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist();
  const deleteChecklist = useDeleteChecklist();
  const createTemplate = useCreateChecklistTemplate();

  const handleCreateFromTemplate = async (type: string) => {
    const template = checklistTemplates[type as keyof typeof checklistTemplates];
    if (!template) return;

    try {
      const items = template.items.map((item, idx) => ({ 
        id: `${Date.now()}-${idx}`,
        text: item.text,
        completed: false
      }));

      await createChecklist.mutateAsync({
        job_id: jobId,
        type: template.label,
        items: items,
        estimated_time: null,
      });
      toast.success("Checklist criada!");
    } catch (error) {
      console.error("Erro ao criar checklist:", error);
      toast.error("Erro ao criar checklist");
    }
  };

  const handleCreateCustom = async () => {
    if (!newChecklistType || customItems.length === 0) {
      toast.error("Adicione um nome e itens à checklist");
      return;
    }

    try {
      const items = customItems.map((item) => ({
        id: item.id,
        text: item.text,
        completed: false
      }));

      await createChecklist.mutateAsync({
        job_id: jobId,
        type: newChecklistType,
        items: items,
        estimated_time: null,
      });
      toast.success("Checklist criada!");
      setNewChecklistType("");
      setCustomItems([]);
    } catch (error) {
      console.error("Erro ao criar checklist:", error);
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

  const handleSaveAsTemplate = async (checklist: any) => {
    if (!checklist) return;
    
    try {
      const items = checklist.items.map((item: ChecklistItem) => ({
        id: item.id,
        text: item.text,
        completed: false
      }));

      await createTemplate.mutateAsync({
        name: `Template: ${checklist.type}`,
        job_type: checklist.type,
        items: items,
        estimated_time: checklist.estimated_time,
      });
      toast.success("Template salvo!");
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast.error("Erro ao salvar template");
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await deleteChecklist.mutateAsync({
        id: checklistId,
        job_id: jobId
      });
      toast.success("Checklist deletada!");
    } catch (error) {
      console.error("Erro ao deletar checklist:", error);
      toast.error("Erro ao deletar checklist");
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) return;

    try {
      const items = template.items.map((item: any, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        text: item.text,
        completed: false
      }));

      await createChecklist.mutateAsync({
        job_id: jobId,
        type: template.job_type,
        items: items,
        estimated_time: template.estimated_time,
      });
      toast.success("Template aplicado!");
    } catch (error) {
      console.error("Erro ao aplicar template:", error);
      toast.error("Erro ao aplicar template");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Checklists</h3>
        
        {/* Templates from Database */}
        <Card className="p-4 mb-4">
          <Label className="text-sm font-medium mb-2 block">Templates Salvos</Label>
          {templates && templates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={createChecklist.isPending}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {template.name}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum template salvo ainda</p>
          )}
        </Card>

        {/* Quick Templates */}
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    disabled={deleteChecklist.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Deletar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveAsTemplate(checklist)}
                    disabled={createTemplate.isPending}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Salvar Template
                  </Button>
                  <Badge variant={progress === 100 ? "success" : "secondary"}>
                    {completedCount}/{totalCount}
                  </Badge>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-2">
                {checklist.items && checklist.items.length > 0 ? (
                  checklist.items.map((item, itemIndex) => {
                    const uniqueCheckboxId = `checklist-${checklist.id}-item-${item.id || itemIndex}`;
                    return (
                      <div key={item.id || itemIndex} className="flex items-center gap-2">
                        <Checkbox
                          id={uniqueCheckboxId}
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(checklist.id, checklist.items, item.id)}
                        />
                        <label
                          htmlFor={uniqueCheckboxId}
                          className={`flex-1 text-sm cursor-pointer ${
                            item.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.text || "Item sem texto"}
                        </label>
                        {item.completed && <CheckCircle2 className="h-4 w-4 text-success" />}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum item nesta checklist</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
