import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EntityQuickLinks } from '@/components/EntityQuickLinks';
import { useSmartBadges } from '@/hooks/useSmartBadges';
import {
  FileText,
  Edit,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
} from 'lucide-react';

interface InvoiceCardProps {
  invoice: any;
  statusConfig: Record<string, { label: string; variant: any; icon: any }>;
  onViewPDF: (invoice: any) => void;
  onEdit: (invoice: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function InvoiceCard({
  invoice,
  statusConfig,
  onViewPDF,
  onEdit,
  onUpdateStatus,
  onDelete,
}: InvoiceCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const smartBadges = useSmartBadges({ entityType: 'invoice', entity: invoice });
  const status = statusConfig[invoice.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
            <Badge variant={status.variant}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
            {invoice.is_proforma && (
              <Badge variant="secondary" className="text-xs">
                Pro-Forma
              </Badge>
            )}
            {smartBadges.map((badge) => (
              <Badge
                key={badge.id}
                variant={badge.variant as any}
                className="text-xs"
                title={badge.tooltip}
              >
                {badge.label}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{invoice.clients?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-primary">
                {invoice.total?.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                })} {invoice.currency || 'AOA'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Emissão</p>
              <p className="font-medium">
                {new Date(invoice.issue_date).toLocaleDateString('pt-PT')}
              </p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-sm text-muted-foreground">Data Vencimento</p>
                <p className="font-medium">
                  {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
                </p>
              </div>
            )}
          </div>

          {(invoice.amount_paid > 0 || invoice.status === 'partial') && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Valor Pago:</span>
                <span className="font-semibold text-success">
                  {invoice.amount_paid?.toLocaleString('pt-PT', {
                    minimumFractionDigits: 2,
                  })} {invoice.currency || 'AOA'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-muted-foreground">Valor Pendente:</span>
                <span className="font-semibold text-destructive">
                  {(invoice.total - invoice.amount_paid)?.toLocaleString('pt-PT', {
                    minimumFractionDigits: 2,
                  })} {invoice.currency || 'AOA'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <EntityQuickLinks
              links={[
                { type: 'client', id: invoice.client_id, name: invoice.clients?.name || 'Cliente' },
                ...(invoice.quote_id ? [{ type: 'quote' as const, id: invoice.quote_id, name: 'Orçamento', status: 'origem' }] : []),
                ...(invoice.job_id ? [{ type: 'job' as const, id: invoice.job_id, name: 'Job' }] : []),
              ]}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewPDF(invoice)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver PDF
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(invoice)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(invoice.id, 'paid')}
                    disabled={invoice.status === 'paid'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Paga
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(invoice.id, 'cancelled')}
                    disabled={invoice.status === 'cancelled'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(invoice.id, 'overdue')}
                    disabled={invoice.status === 'overdue'}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Marcar como Vencida
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteAlert(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Fatura
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Fatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar a fatura <strong>{invoice.invoice_number}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(invoice.id);
                setShowDeleteAlert(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
