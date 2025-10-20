import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

export interface QuoteData {
  id: string;
  client_name: string;
  validity_date: string | null;
  items: any[];
  tax: number;
  discount: number;
  total: number;
  currency: string;
  created_at: string;
}

export interface ContractData {
  id: string;
  client_name: string;
  job_title?: string;
  terms_text: string;
  issued_at: string;
  signed_at: string | null;
}

export async function generateQuotePDF(quote: QuoteData): Promise<string> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('ORÇAMENTO', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Nº ${quote.id.slice(0, 8).toUpperCase()}`, 105, 28, { align: 'center' });
  doc.text(`Data: ${new Date(quote.created_at).toLocaleDateString('pt-AO')}`, 105, 34, { align: 'center' });
  
  // Client Info
  doc.setFontSize(12);
  doc.text('Cliente:', 20, 50);
  doc.setFontSize(10);
  doc.text(quote.client_name, 20, 56);
  
  if (quote.validity_date) {
    doc.text(`Válido até: ${new Date(quote.validity_date).toLocaleDateString('pt-AO')}`, 20, 62);
  }
  
  // Items Table
  const tableData = quote.items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    `${quote.currency} ${Number(item.price).toFixed(2)}`,
    `${quote.currency} ${(item.quantity * item.price).toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    startY: 75,
    head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Calculations
  const finalY = (doc as any).lastAutoTable.finalY || 75;
  const subtotal = quote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (quote.tax / 100);
  const discountAmount = subtotal * (quote.discount / 100);
  
  doc.text('Subtotal:', 130, finalY + 15);
  doc.text(`${quote.currency} ${subtotal.toFixed(2)}`, 180, finalY + 15, { align: 'right' });
  
  if (quote.tax > 0) {
    doc.text(`IVA (${quote.tax}%):`, 130, finalY + 22);
    doc.text(`${quote.currency} ${taxAmount.toFixed(2)}`, 180, finalY + 22, { align: 'right' });
  }
  
  if (quote.discount > 0) {
    doc.text(`Desconto (${quote.discount}%):`, 130, finalY + 29);
    doc.text(`-${quote.currency} ${discountAmount.toFixed(2)}`, 180, finalY + 29, { align: 'right' });
  }
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', 130, finalY + 40);
  doc.text(`${quote.currency} ${quote.total.toFixed(2)}`, 180, finalY + 40, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Este orçamento é válido apenas até a data indicada.', 105, 280, { align: 'center' });
  
  // Convert to blob and upload
  const pdfBlob = doc.output('blob');
  const fileName = `quote_${quote.id}_${Date.now()}.pdf`;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const filePath = `${user.id}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
    });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('pdfs')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

export async function generateContractPDF(contract: ContractData): Promise<string> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Nº ${contract.id.slice(0, 8).toUpperCase()}`, 105, 28, { align: 'center' });
  doc.text(`Emitido em: ${new Date(contract.issued_at).toLocaleDateString('pt-AO')}`, 105, 34, { align: 'center' });
  
  // Client Info
  doc.setFontSize(12);
  doc.text('Contratante:', 20, 50);
  doc.setFontSize(10);
  doc.text(contract.client_name, 20, 56);
  
  if (contract.job_title) {
    doc.text(`Serviço: ${contract.job_title}`, 20, 62);
  }
  
  // Terms
  doc.setFontSize(11);
  doc.text('Termos e Condições:', 20, 75);
  
  doc.setFontSize(9);
  const splitText = doc.splitTextToSize(contract.terms_text, 170);
  doc.text(splitText, 20, 85);
  
  // Signature section
  const textHeight = splitText.length * 5;
  const signY = Math.min(85 + textHeight + 30, 240);
  
  doc.line(20, signY, 90, signY);
  doc.text('Assinatura do Contratante', 20, signY + 5);
  
  doc.line(120, signY, 190, signY);
  doc.text('Assinatura do Prestador', 120, signY + 5);
  
  if (contract.signed_at) {
    doc.text(`Assinado em: ${new Date(contract.signed_at).toLocaleDateString('pt-AO')}`, 20, signY + 15);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text('Este contrato é regido pelas leis vigentes em Angola.', 105, 280, { align: 'center' });
  
  // Convert to blob and upload
  const pdfBlob = doc.output('blob');
  const fileName = `contract_${contract.id}_${Date.now()}.pdf`;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const filePath = `${user.id}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
    });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('pdfs')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}
