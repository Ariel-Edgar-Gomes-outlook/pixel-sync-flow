import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  amount: number;
  type: string;
  method: string | null;
  paid_at: string;
  notes: string | null;
}

interface Invoice {
  invoice_number: string;
  issue_date: string;
  total: number;
  currency: string;
}

interface Client {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export async function generateReceiptPDF(
  payment: Payment,
  invoice: Invoice,
  client: Client
): Promise<string> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGAMENTO', pageWidth / 2, 30, { align: 'center' });
  
  // Receipt number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const receiptNumber = `REC${new Date().getFullYear()}${payment.id.substring(0, 8).toUpperCase()}`;
  doc.text(`Recibo Nº: ${receiptNumber}`, pageWidth - 20, 45, { align: 'right' });
  
  let yPos = 60;
  
  // Client info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${client.name}`, 20, yPos);
  
  if (client.email) {
    yPos += 6;
    doc.text(`Email: ${client.email}`, 20, yPos);
  }
  
  if (client.phone) {
    yPos += 6;
    doc.text(`Telefone: ${client.phone}`, 20, yPos);
  }
  
  yPos += 15;
  
  // Payment details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes do Pagamento:', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Fatura Referência:', invoice.invoice_number],
    ['Data do Pagamento:', new Date(payment.paid_at).toLocaleDateString('pt-PT')],
    ['Tipo de Pagamento:', payment.type],
    ['Método de Pagamento:', payment.method || 'N/A'],
    ['Valor Pago:', `${Number(payment.amount).toFixed(2)} ${invoice.currency || 'AOA'}`],
  ];
  
  details.forEach(([label, value]) => {
    doc.text(label, 20, yPos);
    doc.text(value, 90, yPos);
    yPos += 7;
  });
  
  if (payment.notes) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(payment.notes, 170);
    doc.text(splitNotes, 20, yPos);
    yPos += splitNotes.length * 7;
  }
  
  // Amount box
  yPos += 15;
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'FD');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR RECEBIDO:', 30, yPos + 10);
  doc.setFontSize(18);
  doc.text(
    `${Number(payment.amount).toFixed(2)} ${invoice.currency || 'AOA'}`,
    pageWidth - 30,
    yPos + 15,
    { align: 'right' }
  );
  
  // Footer
  yPos = doc.internal.pageSize.getHeight() - 40;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Este recibo é válido como comprovativo de pagamento.', pageWidth / 2, yPos, { align: 'center' });
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, pageWidth / 2, yPos + 5, { align: 'center' });
  
  // Upload to Supabase Storage
  const pdfBlob = doc.output('blob');
  const fileName = `receipt_${payment.id}_${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false,
    });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}
