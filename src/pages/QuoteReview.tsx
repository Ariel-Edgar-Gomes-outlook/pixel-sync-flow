import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, FileText, Download, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';

export default function QuoteReview() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchQuote();
  }, [token]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('review_token', token)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Orçamento não encontrado');
        return;
      }

      // Check if quote is still valid for review
      if (data.status !== 'sent' && data.status !== 'draft') {
        toast.info(`Este orçamento já foi ${data.status === 'accepted' ? 'aceite' : 'rejeitado'}`);
      }

      setQuote(data);
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      toast.error('Erro ao carregar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setProcessing(true);

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('review_token', token);

      if (updateError) throw updateError;

      // Call edge function to send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-quote-email', {
        body: { quoteId: quote?.id, type: 'accepted' },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw - email is optional
      }

      toast.success('Orçamento aceite com sucesso!', {
        description: 'Entraremos em contacto em breve.',
      });

      setShowAcceptDialog(false);
      await fetchQuote(); // Refresh quote data
    } catch (error: any) {
      console.error('Error accepting quote:', error);
      toast.error('Erro ao aceitar orçamento');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'rejected',
        })
        .eq('review_token', token);

      if (updateError) throw updateError;

      // Call edge function to notify rejection
      const { error: emailError } = await supabase.functions.invoke('send-quote-email', {
        body: { quoteId: quote?.id, type: 'rejected' },
      });

      if (emailError) {
        console.error('Email error:', emailError);
      }

      toast.info('Decisão registada', {
        description: 'Obrigado pelo seu feedback.',
      });

      setShowRejectDialog(false);
      await fetchQuote();
    } catch (error: any) {
      console.error('Error rejecting quote:', error);
      toast.error('Erro ao rejeitar orçamento');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Orçamento não encontrado</h2>
            <p className="text-muted-foreground">Este link pode estar inválido ou expirado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = quote.items?.reduce((sum: number, item: any) => 
    sum + ((item.quantity || 1) * (item.price || 0)), 0
  ) || 0;
  const taxAmount = subtotal * (quote.tax / 100);
  const discountAmount = quote.discount || 0;
  const isExpired = quote.validity_date && new Date(quote.validity_date) < new Date();
  const canTakeAction = (quote.status === 'sent' || quote.status === 'draft') && !isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Revisão de Orçamento</CardTitle>
            <p className="text-muted-foreground mt-2">
              Orçamento Nº ORC-{quote.id.substring(0, 8).toUpperCase()}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant={
                quote.status === 'accepted' ? 'default' :
                quote.status === 'rejected' ? 'destructive' :
                quote.status === 'sent' ? 'secondary' : 'outline'
              }>
                {quote.status === 'accepted' ? '✓ Aceite' :
                 quote.status === 'rejected' ? '✗ Rejeitado' :
                 quote.status === 'sent' ? '📤 Enviado' : '📝 Rascunho'}
              </Badge>
              {isExpired && (
                <Badge variant="destructive">Expirado</Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Client & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Nome:</strong> {quote.clients?.name}</p>
              {quote.clients?.email && <p><strong>Email:</strong> {quote.clients.email}</p>}
              {quote.clients?.phone && <p><strong>Telefone:</strong> {quote.clients.phone}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Emitido: {new Date(quote.created_at).toLocaleDateString('pt-AO')}
                </span>
              </div>
              {quote.validity_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Válido até: {new Date(quote.validity_date).toLocaleDateString('pt-AO')}
                  </span>
                </div>
              )}
              {quote.accepted_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">
                    Aceite em: {new Date(quote.accepted_at).toLocaleDateString('pt-AO')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quote.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.description || item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity || 1} × {formatCurrency(Number(item.price || 0))}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency((item.quantity || 1) * (item.price || 0))}
                    </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Calculations */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {quote.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>IVA ({quote.tax}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {quote.discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Desconto:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>TOTAL:</span>
                <span>{formatCurrency(Number(quote.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canTakeAction && (
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowAcceptDialog(true)}
                  disabled={processing}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Aceitar Orçamento
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Rejeitar
                </Button>
              </div>

              {quote.pdf_link && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.open(quote.pdf_link, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descarregar PDF
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!canTakeAction && quote.status !== 'accepted' && quote.status !== 'rejected' && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-semibold">Orçamento Expirado</p>
              <p className="text-muted-foreground mt-2">
                Este orçamento expirou em {new Date(quote.validity_date).toLocaleDateString('pt-AO')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Por favor, contacte-nos para um novo orçamento.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Accept Dialog */}
        <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Aceitação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que deseja aceitar este orçamento de {formatCurrency(Number(quote.total))}?
                <br /><br />
                Entraremos em contacto em breve para os próximos passos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleAccept} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirmar Aceitação
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Dialog */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rejeitar Orçamento</AlertDialogTitle>
              <AlertDialogDescription>
                Lamentamos que não possamos avançar neste momento.
                <br /><br />
                Gostaria de deixar algum feedback? (opcional)
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Motivo da rejeição, sugestões, etc..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirmar Rejeição
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
