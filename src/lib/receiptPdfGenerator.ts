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
  status: string;
}

interface Invoice {
  invoice_number: string;
  issue_date: string;
  total: number;
  currency: string;
  amount_paid?: number;
}

interface Client {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface BusinessSettings {
  business_name: string;
  trade_name?: string;
  nif?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  country?: string;
  postal_code?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  logo_url?: string;
  primary_color?: string;
  signature_url?: string;
}

export async function generateReceiptPDF(
  payment: Payment,
  invoice: Invoice,
  client: Client
): Promise<string> {
  // Fetch business settings
  const { data: settings } = await supabase
    .from('business_settings')
    .select('*')
    .single();

  if (!settings) {
    throw new Error('Configurações de negócio não encontradas');
  }
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Parse primary color
  const primaryColor = settings.primary_color || '#3B82F6';
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [59, 130, 246];
  };
  const [r, g, b] = hexToRgb(primaryColor);
  
  let yPos = 20;
  
  // Logo and business header
  if (settings.logo_url) {
    try {
      doc.addImage(settings.logo_url, 'PNG', 20, yPos, 30, 30);
      yPos += 35;
    } catch (error) {
      console.error('Error loading logo:', error);
      yPos += 5;
    }
  }
  
  // Business info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text(settings.business_name, 20, yPos);
  
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  if (settings.trade_name) {
    doc.text(settings.trade_name, 20, yPos);
    yPos += 5;
  }
  
  if (settings.nif) {
    doc.text(`NIF: ${settings.nif}`, 20, yPos);
    yPos += 5;
  }
  
  if (settings.address_line1) {
    doc.text(settings.address_line1, 20, yPos);
    yPos += 5;
  }
  
  const locationParts = [settings.city, settings.province, settings.country].filter(Boolean);
  if (locationParts.length > 0) {
    doc.text(locationParts.join(', '), 20, yPos);
    yPos += 5;
  }
  
  doc.text(`Email: ${settings.email}`, 20, yPos);
  yPos += 5;
  
  if (settings.phone) {
    doc.text(`Tel: ${settings.phone}`, 20, yPos);
    yPos += 5;
  }
  
  // Receipt title and number
  yPos += 10;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('RECIBO DE PAGAMENTO', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  const receiptNumber = `REC${new Date().getFullYear()}${payment.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Recibo Nº: ${receiptNumber}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Client info box
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('DADOS DO CLIENTE', 20, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Nome: ${client.name}`, 20, yPos);
  
  if (client.email) {
    yPos += 6;
    doc.text(`Email: ${client.email}`, 20, yPos);
  }
  
  if (client.phone) {
    yPos += 6;
    doc.text(`Telefone: ${client.phone}`, 20, yPos);
  }
  
  if (client.address) {
    yPos += 6;
    doc.text(`Endereço: ${client.address}`, 20, yPos);
  }
  
  yPos += 10;
  doc.setDrawColor(r, g, b);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;
  
  // Payment details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('DETALHES DO PAGAMENTO', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const details = [
    ['Fatura Referência:', invoice.invoice_number],
    ['Data de Emissão da Fatura:', new Date(invoice.issue_date).toLocaleDateString('pt-PT')],
    ['Data do Pagamento:', new Date(payment.paid_at).toLocaleDateString('pt-PT')],
    ['Tipo de Pagamento:', payment.type === 'full' ? 'Pagamento Completo' : payment.type === 'partial' ? 'Pagamento Parcial' : payment.type],
    ['Método de Pagamento:', payment.method || 'N/A'],
  ];
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 95, yPos);
    yPos += 6;
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
  
  // Payment summary table
  yPos += 10;
  doc.setFillColor(r, g, b);
  doc.rect(20, yPos, pageWidth - 40, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RESUMO FINANCEIRO', 25, yPos + 5);
  
  yPos += 8;
  doc.setFillColor(250, 250, 250);
  doc.rect(20, yPos, pageWidth - 40, 30, 'F');
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('Total da Fatura:', 25, yPos);
  doc.text(`${Number(invoice.total).toFixed(2)} ${invoice.currency || 'AOA'}`, pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text('Valor já Pago:', 25, yPos);
  doc.text(`${Number(invoice.amount_paid || 0).toFixed(2)} ${invoice.currency || 'AOA'}`, pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(r, g, b);
  doc.text('Valor deste Recibo:', 25, yPos);
  doc.text(`${Number(payment.amount).toFixed(2)} ${invoice.currency || 'AOA'}`, pageWidth - 25, yPos, { align: 'right' });
  
  // Watermark for paid receipts
  if (payment.status === 'paid') {
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94, 0.1);
    doc.text('PAGO', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
  }
  
  // Footer
  yPos = pageHeight - 50;
  
  // Signature if available
  if (settings.signature_url) {
    try {
      doc.addImage(settings.signature_url, 'PNG', 25, yPos, 40, 15);
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('_______________________', 25, yPos + 20);
      doc.text('Assinatura Autorizada', 25, yPos + 25);
    } catch (error) {
      console.error('Error loading signature:', error);
    }
  }
  
  yPos = pageHeight - 25;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Este recibo é válido como comprovativo de pagamento e tem valor legal.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text(`Recibo Nº: ${receiptNumber}`, pageWidth / 2, yPos, { align: 'center' });
  
  // Upload to Supabase Storage
  const pdfBlob = doc.output('blob');
  const fileName = `receipts/receipt_${receiptNumber}_${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });
  
  if (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
  
  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName);
  
  console.log('Receipt PDF generated:', urlData.publicUrl);
  
  return urlData.publicUrl;
}
