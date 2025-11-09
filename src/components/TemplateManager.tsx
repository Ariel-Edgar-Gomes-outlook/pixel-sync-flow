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
    cancellation_fee: 0,
    tax: 14,
    discount: 0,
    currency: 'AOA',
    notes: '',
    estimated_time: null,
    clauses: {
      usage_rights_text: '',
      cancellation_policy_text: '',
      late_delivery_clause: '',
      copyright_notice: '',
      reschedule_policy: '',
      revision_policy: '',
    },
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
      const quoteData = {
        name: formData.name,
        job_type: formData.job_type,
        items: formData.items,
        tax: formData.tax,
        discount: formData.discount,
        currency: formData.currency,
        notes: formData.notes,
      };
      createQuote.mutate(quoteData, {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      });
    } else if (type === 'checklist') {
      const checklistData = {
        name: formData.name,
        job_type: formData.job_type,
        items: formData.items,
        estimated_time: formData.estimated_time,
      };
      createChecklist.mutate(checklistData, {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      });
    } else {
      const contractData = {
        name: formData.name,
        terms_text: formData.terms_text,
        cancellation_fee: formData.cancellation_fee,
        clauses: {
          ...formData.clauses,
          job_type: formData.job_type,
        },
      };
      createContract.mutate(contractData, {
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
      cancellation_fee: 0,
      tax: 14,
      discount: 0,
      currency: 'AOA',
      notes: '',
      estimated_time: null,
      clauses: {
        usage_rights_text: '',
        cancellation_policy_text: '',
        late_delivery_clause: '',
        copyright_notice: '',
        reschedule_policy: '',
        revision_policy: '',
      },
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

              {type === 'quote' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax">IVA (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount">Desconto (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AOA">Kwanza (AOA)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas/Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Observações gerais do orçamento..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {type === 'checklist' && (
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Tempo Estimado (minutos)</Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.estimated_time || ''}
                    onChange={(e) => setFormData({ ...formData, estimated_time: parseInt(e.target.value) || null })}
                    placeholder="Ex: 120"
                  />
                </div>
              )}

              {type === 'contract' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="terms">Termos e Condições Principais</Label>
                    <Textarea
                      id="terms"
                      value={formData.terms_text}
                      onChange={(e) => setFormData({ ...formData, terms_text: e.target.value })}
                      placeholder="Digite os termos principais do contrato..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage_rights">Direitos de Uso de Imagem</Label>
                    <Textarea
                      id="usage_rights"
                      value={formData.clauses.usage_rights_text}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clauses: { ...formData.clauses, usage_rights_text: e.target.value }
                      })}
                      placeholder="Ex: O cliente terá direito de uso pessoal e não comercial..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellation_policy">Política de Cancelamento</Label>
                    <Textarea
                      id="cancellation_policy"
                      value={formData.clauses.cancellation_policy_text}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clauses: { ...formData.clauses, cancellation_policy_text: e.target.value }
                      })}
                      placeholder="Ex: Cancelamento com mais de 15 dias: reembolso de 70%..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellation_fee">Taxa de Cancelamento (Kz)</Label>
                    <Input
                      id="cancellation_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cancellation_fee}
                      onChange={(e) => setFormData({ ...formData, cancellation_fee: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reschedule_policy">Política de Remarcação</Label>
                    <Textarea
                      id="reschedule_policy"
                      value={formData.clauses.reschedule_policy}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clauses: { ...formData.clauses, reschedule_policy: e.target.value }
                      })}
                      placeholder="Ex: Uma remarcação gratuita com aviso de 7 dias..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revision_policy">Política de Revisões</Label>
                    <Textarea
                      id="revision_policy"
                      value={formData.clauses.revision_policy}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clauses: { ...formData.clauses, revision_policy: e.target.value }
                      })}
                      placeholder="Ex: Incluídas 3 rodadas de revisões..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="late_delivery">Cláusula de Entrega Tardia</Label>
                    <Textarea
                      id="late_delivery"
                      value={formData.clauses.late_delivery_clause}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clauses: { ...formData.clauses, late_delivery_clause: e.target.value }
                      })}
                      placeholder="Ex: Em caso de atraso, desconto de 10%..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="copyright">Aviso de Direitos Autorais</Label>
                    <Textarea
                      id="copyright"
                      value={formData.clauses.copyright_notice}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        clauses: { ...formData.clauses, copyright_notice: e.target.value }
                      })}
                      placeholder="Ex: Todos os direitos autorais pertencem ao fotógrafo..."
                      rows={2}
                    />
                  </div>
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
                    {(template.clauses as any)?.job_type && (
                      <p className="font-medium mb-1">{(template.clauses as any).job_type}</p>
                    )}
                    <p className="line-clamp-2">{template.terms_text?.substring(0, 100)}...</p>
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
