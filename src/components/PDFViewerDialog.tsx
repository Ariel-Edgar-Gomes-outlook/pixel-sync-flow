import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Printer, ZoomIn, ZoomOut, X, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  generateContractPDFLocal,
  generateQuotePDFLocal,
  generateInvoicePDFLocal,
  generateReceiptPDFLocal,
} from '@/lib/localPdfGenerator';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker with fallback
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
} catch (error) {
  console.error('Failed to load PDF.js worker:', error);
}

// PDF Source types
type PDFSource = 
  | { type: 'url'; url: string }
  | { type: 'local'; entityType: 'contract' | 'quote' | 'invoice' | 'receipt'; entityId: string }
  | { type: 'blob'; blob: Blob; filename?: string }
  | null;

interface PDFViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl?: string | null; // Legacy prop for backwards compatibility
  pdfSource?: PDFSource; // New prop for dynamic generation
  title?: string;
}

export function PDFViewerDialog({ 
  open, 
  onOpenChange, 
  pdfUrl, 
  pdfSource, 
  title = "Visualizar PDF" 
}: PDFViewerDialogProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState<boolean>(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Generate PDF from local data or use provided URL/Blob
  useEffect(() => {
    if (!open) {
      // Clean up blob URL when dialog closes
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setCurrentPdfUrl(null);
      return;
    }

    const generatePDF = async () => {
      try {
        setIsGenerating(true);
        setIsLoading(true);
        setError(null);
        setLoadTimeout(false);
        setPageNumber(1);
        setScale(1.0);

        // Clean up previous blob URL
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          setBlobUrl(null);
        }

        // Determine PDF source (prioritize pdfSource over legacy pdfUrl)
        const source: PDFSource = pdfSource || (pdfUrl ? { type: 'url', url: pdfUrl } : null);

        if (!source) {
          setCurrentPdfUrl(null);
          setIsGenerating(false);
          return;
        }

        let url: string;

        if (source.type === 'url') {
          // Use existing URL
          url = source.url;
          setPdfBlob(null);
          setCurrentPdfUrl(url);
        } else if (source.type === 'blob') {
          // Convert blob to URL
          setPdfBlob(source.blob);
          const objectUrl = URL.createObjectURL(source.blob);
          setBlobUrl(objectUrl);
          url = objectUrl;
          setCurrentPdfUrl(url);
        } else if (source.type === 'local') {
          // Generate PDF locally from database
          let blob: Blob;

          switch (source.entityType) {
            case 'contract':
              blob = await generateContractPDFLocal(source.entityId);
              break;
            case 'quote':
              blob = await generateQuotePDFLocal(source.entityId);
              break;
            case 'invoice':
              blob = await generateInvoicePDFLocal(source.entityId);
              break;
            case 'receipt':
              blob = await generateReceiptPDFLocal(source.entityId);
              break;
            default:
              throw new Error('Tipo de entidade desconhecido');
          }

          setPdfBlob(blob);
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          url = objectUrl;
          setCurrentPdfUrl(url);
        }

        setIsGenerating(false);

        // Set timeout for loading (15 seconds)
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            setLoadTimeout(true);
            setError('O PDF está demorando muito para carregar. Tente abrir em nova aba ou fazer download.');
          }
        }, 15000);

        return () => clearTimeout(timeoutId);
      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        setIsGenerating(false);
        setIsLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao gerar PDF';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    generatePDF();
  }, [open, pdfUrl, pdfSource]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadTimeout(false);
    setError(null);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar PDF:', error);
    setIsLoading(false);
    
    let errorMessage = 'Erro ao carregar PDF. ';
    
    if (error.message.includes('CORS')) {
      errorMessage += 'Problema de permissão de acesso (CORS). Tente fazer download do arquivo.';
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorMessage += 'PDF não encontrado. O link pode ter expirado.';
    } else if (error.message.includes('InvalidPDF')) {
      errorMessage += 'Arquivo PDF corrompido ou inválido.';
    } else {
      errorMessage += 'Tente novamente ou abra em nova aba.';
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (!pdfBlob) {
      toast.error('PDF não está disponível para download');
      return;
    }
    
    try {
      // Determine filename
      let filename = 'documento.pdf';
      if (pdfSource?.type === 'blob' && pdfSource.filename) {
        filename = pdfSource.filename;
      } else if (pdfSource?.type === 'local') {
        filename = `${pdfSource.entityType}_${pdfSource.entityId.substring(0, 8)}.pdf`;
      }
      
      // Create download link directly from blob
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Falha ao baixar PDF');
    }
  };

  const handleOpenInNewTab = () => {
    if (!pdfBlob) {
      toast.error('PDF não está disponível');
      return;
    }
    
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        toast.error('Pop-up bloqueado. Por favor, permita pop-ups.');
        URL.revokeObjectURL(blobUrl);
        return;
      }
      
      toast.success('PDF aberto em nova aba!');
    } catch (error) {
      console.error('Erro ao abrir em nova aba:', error);
      toast.error('Falha ao abrir PDF em nova aba');
    }
  };

  const handlePrint = () => {
    if (!pdfBlob) {
      toast.error('PDF não está disponível para impressão');
      return;
    }
    
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(blobUrl, '_blank');
      
      if (!printWindow) {
        toast.error('Pop-up bloqueado. Por favor, permita pop-ups para imprimir.');
        URL.revokeObjectURL(blobUrl);
        return;
      }

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
      
      toast.success('Abrindo PDF para impressão...');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Falha ao abrir impressão');
    }
  };

  const resetAndClose = () => {
    setPageNumber(1);
    setScale(1.0);
    setIsLoading(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={resetAndClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {numPages > 0 ? `${pageNumber} / ${numPages}` : 'Carregando...'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nova Aba</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-muted/10 flex flex-col items-center justify-center p-6">
          {isGenerating ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Gerando PDF...</p>
              <p className="text-xs text-muted-foreground mt-2">Buscando dados e criando documento</p>
            </div>
          ) : !currentPdfUrl ? (
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum PDF selecionado</p>
            </div>
          ) : error || loadTimeout ? (
            <div className="max-w-md w-full space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'O PDF está demorando muito para carregar.'}
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-2">
                <Button onClick={handleOpenInNewTab} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
                <Button onClick={handleDownload} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button 
                  onClick={() => {
                    setError(null);
                    setLoadTimeout(false);
                    setIsLoading(true);
                  }} 
                  variant="ghost" 
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-lg">
              <Document
                file={currentPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-[600px] w-[500px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Carregando PDF...</p>
                      <p className="text-xs text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
                    </div>
                  </div>
                }
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                  cMapPacked: true,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="flex items-center justify-center h-[600px] w-[500px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                />
              </Document>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
