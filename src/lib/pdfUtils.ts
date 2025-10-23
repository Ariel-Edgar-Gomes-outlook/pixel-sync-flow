import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica se uma URL de PDF é acessível
 * @param url - URL do PDF a verificar
 * @returns true se o PDF for acessível, false caso contrário
 */
export async function verifyPdfAccess(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error verifying PDF access:', error);
    return false;
  }
}

/**
 * Obtém uma URL assinada do Supabase Storage para visualização de PDF
 * Útil quando o PDF está em bucket privado e precisa de URL temporária
 * @param pdfUrl - URL pública ou caminho do PDF
 * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
 * @returns URL assinada ou URL original se já for acessível
 */
export async function getPdfViewerUrl(pdfUrl: string, expiresIn: number = 3600): Promise<string> {
  // Se já é acessível, retorna direto
  const isAccessible = await verifyPdfAccess(pdfUrl);
  if (isAccessible) {
    return pdfUrl;
  }

  try {
    // Tenta extrair bucket e path da URL
    const urlParts = pdfUrl.split('/storage/v1/object/');
    if (urlParts.length > 1) {
      const pathParts = urlParts[1].split('/');
      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      // Tenta gerar URL assinada
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return pdfUrl; // Fallback para URL original
      }

      if (data?.signedUrl) {
        return data.signedUrl;
      }
    }

    // Se não conseguiu processar, retorna original
    return pdfUrl;
  } catch (error) {
    console.error('Error getting PDF viewer URL:', error);
    return pdfUrl; // Fallback para URL original
  }
}

/**
 * Extrai o nome do arquivo de uma URL de PDF
 * @param pdfUrl - URL do PDF
 * @returns Nome do arquivo ou 'documento.pdf' como fallback
 */
export function extractPdfFileName(pdfUrl: string): string {
  try {
    const url = new URL(pdfUrl);
    const pathSegments = url.pathname.split('/');
    const fileName = pathSegments[pathSegments.length - 1];
    
    // Remove query parameters
    const cleanFileName = fileName.split('?')[0];
    
    // Garante extensão .pdf
    if (!cleanFileName.toLowerCase().endsWith('.pdf')) {
      return `${cleanFileName}.pdf`;
    }
    
    return cleanFileName;
  } catch {
    return 'documento.pdf';
  }
}

/**
 * Valida se uma string é uma URL válida de PDF
 * @param url - String para validar
 * @returns true se for uma URL válida, false caso contrário
 */
export function isValidPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Faz download de um PDF via blob (útil para CORS issues)
 * @param pdfUrl - URL do PDF
 * @param fileName - Nome do arquivo para download
 */
export async function downloadPdfAsBlob(pdfUrl: string, fileName?: string): Promise<void> {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('Failed to fetch PDF');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || extractPdfFileName(pdfUrl);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    // Fallback: abre em nova aba
    window.open(pdfUrl, '_blank');
  }
}
