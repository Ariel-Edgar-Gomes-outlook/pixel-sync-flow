import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useTimeEntries, useCreateTimeEntry, useDeleteTimeEntry } from '@/hooks/useTimeEntries';
import { format } from 'date-fns';

interface TimeTrackerProps {
  jobId: string;
  estimatedHours?: number;
}

export function TimeTracker({ jobId, estimatedHours }: TimeTrackerProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    description: '',
  });

  const { data: timeEntries, isLoading } = useTimeEntries(jobId);
  const createTimeEntry = useCreateTimeEntry();
  const deleteTimeEntry = useDeleteTimeEntry();

  const totalHours = timeEntries?.reduce((sum, entry) => sum + Number(entry.hours), 0) || 0;
  const efficiency = estimatedHours ? ((estimatedHours / totalHours) * 100).toFixed(1) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hours || Number(formData.hours) <= 0) {
      return;
    }

    createTimeEntry.mutate(
      {
        job_id: jobId,
        entry_date: formData.entry_date,
        hours: Number(formData.hours),
        description: formData.description || null,
      },
      {
        onSuccess: () => {
          setFormData({
            entry_date: format(new Date(), 'yyyy-MM-dd'),
            hours: '',
            description: '',
          });
          setOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este registro?')) {
      deleteTimeEntry.mutate({ id, jobId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Clock className="h-4 w-4" />
          Registar Tempo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tracking de Tempo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
              {estimatedHours && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimado</p>
                    <p className="text-2xl font-bold">{estimatedHours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiência</p>
                    <p className={`text-2xl font-bold ${Number(efficiency) > 100 ? 'text-destructive' : 'text-green-600'}`}>
                      {efficiency}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Add Time Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_date">Data</Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Horas</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Ex: 2.5"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="O que foi feito?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <Button type="submit" disabled={createTimeEntry.isPending} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Entrada
            </Button>
          </form>

          {/* Time Entries List */}
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : timeEntries && timeEntries.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold">Registos</h4>
              <div className="space-y-2">
                {timeEntries.map((entry) => (
                  <Card key={entry.id} className="p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{entry.hours}h</span>
                          <span className="text-sm text-muted-foreground">
                            • {format(new Date(entry.entry_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Nenhum registo ainda</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
