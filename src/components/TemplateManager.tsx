import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import {
  useQuoteTemplates,
  useCreateQuoteTemplate,
  useDeleteQuoteTemplate,
  useChecklistTemplates,
  useCreateChecklistTemplate,
  useDeleteChecklistTemplate,
  useContractTemplates,
  useCreateContractTemplate,
  useDeleteContractTemplate,
} from '@/hooks/useTemplates';

interface TemplateManagerProps {
  type: 'quote' | 'checklist' | 'contract';
}

export function TemplateManager({ type }: TemplateManagerProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    job_type: 'Casamento',
    items: [],
    terms_text: '',
  });

  // Hooks based on type
  const quoteTemplates = useQuoteTemplates();
  const checklistTemplates = useChecklistTemplates();
  const contractTemplates = useContractTemplates();

  const createQuote = useCreateQuoteTemplate();
  const deleteQuote = useDeleteQuoteTemplate();
  const createChecklist = useCreateChecklistTemplate();
  const deleteChecklist = useDeleteChecklistTemplate();
  const createContract = useCreateContractTemplate();
  const deleteContract = useDeleteContractTemplate();

  const templates =
    type === 'quote'
      ? quoteTemplates.data
      : type === 'checklist'
      ? checklistTemplates.data
      : contractTemplates.data;

  const isLoading =
    type === 'quote'
      ? quoteTemplates.isLoading
      : type === 'checklist'
      ? checklistTemplates.isLoading
      : contractTemplates.isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'quote') {
      createQuote.mutate(formData, {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      });
    } else if (type === 'checklist') {
      createChecklist.mutate(formData, {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      });
    } else {
      createContract.mutate(formData, {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente remover este template?')) return;

    if (type === 'quote') {
      deleteQuote.mutate(id);
    } else if (type === 'checklist') {
      deleteChecklist.mutate(id);
    } else {
      deleteContract.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      job_type: 'Casamento',
      items: [],
      terms_text: '',
    });
  };

  const jobTypes = ['Casamento', 'Evento Corporativo', 'Aniversário', 'Sessão Fotográfica', 'Outro'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {type === 'quote' ? 'Templates de Orçamentos' : type === 'checklist' ? 'Templates de Checklists' : 'Templates de Contratos'}
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Casamento Padrão"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">Tipo de Job</Label>
                <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === 'contract' && (
                <div className="space-y-2">
                  <Label htmlFor="terms">Termos e Condições</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms_text}
                    onChange={(e) => setFormData({ ...formData, terms_text: e.target.value })}
                    placeholder="Digite os termos do contrato..."
                    rows={8}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createQuote.isPending || createChecklist.isPending || createContract.isPending}>
                  Criar Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Carregando templates...</p>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template: any) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.job_type}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {type === 'quote' && (
                  <div className="text-sm text-muted-foreground">
                    <p>{template.items?.length || 0} itens</p>
                    <p>IVA: {template.tax}%</p>
                    <p>Desconto: {template.discount}%</p>
                  </div>
                )}
                {type === 'checklist' && (
                  <div className="text-sm text-muted-foreground">
                    <p>{template.items?.length || 0} itens</p>
                    {template.estimated_time && <p>Tempo estimado: {template.estimated_time}min</p>}
                  </div>
                )}
                {type === 'contract' && (
                  <div className="text-sm text-muted-foreground">
                    <p>{template.terms_text?.substring(0, 100)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum template criado ainda</p>
            <p className="text-sm text-muted-foreground mt-2">Clique em "Novo Template" para começar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
