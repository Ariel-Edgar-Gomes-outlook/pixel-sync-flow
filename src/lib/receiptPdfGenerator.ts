import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyForPDF } from '@/lib/utils';

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
  
  // Top colored bar
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  let yPos = 18;
  
  // Logo and business header
  if (settings.logo_url) {
    try {
      const response = await fetch(settings.logo_url, { cache: 'force-cache' });
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.addImage(base64, 'PNG', 20, yPos, 35, 35, undefined, 'FAST');
      
      // Company info next to logo
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(r, g, b);
      doc.text(settings.business_name, 60, yPos + 8);
      
      yPos += 12;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      
      if (settings.trade_name) {
        doc.text(settings.trade_name, 60, yPos);
        yPos += 4;
      }
      if (settings.nif) {
        doc.text(`NIF: ${settings.nif}`, 60, yPos);
        yPos += 4;
      }
      doc.text(`✉ ${settings.email}`, 60, yPos);
      yPos += 4;
      if (settings.phone) {
        doc.text(`☎ ${settings.phone}`, 60, yPos);
      }
      
      yPos = 60;
    } catch (error) {
      console.error('Error loading logo:', error);
      
      // Fallback if logo fails
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(r, g, b);
      doc.text(settings.business_name, 20, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      
      if (settings.trade_name) {
        doc.text(settings.trade_name, 20, yPos);
        yPos += 4;
      }
      if (settings.nif) {
        doc.text(`NIF: ${settings.nif}`, 20, yPos);
        yPos += 4;
      }
      doc.text(`✉ ${settings.email}`, 20, yPos);
      yPos += 4;
      if (settings.phone) {
        doc.text(`☎ ${settings.phone}`, 20, yPos);
        yPos += 10;
      }
    }
  }
  
  // Receipt title box
  const titleBoxWidth = 120;
  const titleBoxX = (pageWidth - titleBoxWidth) / 2;
  
  doc.setFillColor(r, g, b);
  doc.roundedRect(titleBoxX, yPos, titleBoxWidth, 20, 2, 2, 'F');
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RECIBO DE PAGAMENTO', pageWidth / 2, yPos + 8, { align: 'center' });
  
  yPos += 13;
  const receiptNumber = `REC${new Date().getFullYear()}${payment.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(10);
  doc.text(`Nº: ${receiptNumber}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Client info box with modern design
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPos, pageWidth - 40, 32, 2, 2, 'FD');
  
  // Client header
  doc.setFillColor(r, g, b);
  doc.rect(20, yPos, pageWidth - 40, 7, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('👤 DADOS DO CLIENTE', 23, yPos + 5);
  
  yPos += 13;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(client.name, 23, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  if (client.email) {
    doc.text(`✉ ${client.email}`, 23, yPos);
    yPos += 4;
  }
  
  if (client.phone) {
    doc.text(`☎ ${client.phone}`, 23, yPos);
    yPos += 4;
  }
  
  if (client.address) {
    doc.text(`📍 ${client.address}`, 23, yPos);
  }
  
  yPos += 12;
  
  // Payment details with modern design
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(r, g, b);
  doc.roundedRect(20, yPos, pageWidth - 40, 45, 2, 2, 'FD');
  
  // Payment header
  doc.setFillColor(r, g, b);
  doc.rect(20, yPos, pageWidth - 40, 7, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('💳 DETALHES DO PAGAMENTO', 23, yPos + 5);
  
  yPos += 14;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  
  const details = [
    ['Fatura Referência:', invoice.invoice_number],
    ['Data de Emissão:', new Date(invoice.issue_date).toLocaleDateString('pt-PT')],
    ['Data do Pagamento:', new Date(payment.paid_at).toLocaleDateString('pt-PT')],
    ['Tipo:', payment.type === 'full' ? 'Pagamento Completo' : payment.type === 'partial' ? 'Pagamento Parcial' : payment.type],
    ['Método:', payment.method || 'N/A'],
  ];
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 23, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 5.5;
  });
  
  if (payment.notes) {
    yPos += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 23, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(payment.notes, 165);
    doc.text(splitNotes, 23, yPos);
    yPos += splitNotes.length * 4 + 8;
  } else {
    yPos += 10;
  }
  
  // Payment summary with modern design
  const summaryWidth = pageWidth - 40;
  doc.setFillColor(r, g, b);
  doc.roundedRect(20, yPos, summaryWidth, 8, 1, 1, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('💰 RESUMO FINANCEIRO', 25, yPos + 5);
  
  yPos += 8;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos, summaryWidth, 32, 'F');
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.text('Total da Fatura:', 25, yPos);
  doc.text(formatCurrencyForPDF(Number(invoice.total), invoice.currency || 'AOA'), pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text('Valor já Pago:', 25, yPos);
  doc.text(formatCurrencyForPDF(Number(invoice.amount_paid || 0), invoice.currency || 'AOA'), pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 10;
  
  // Highlight the receipt amount
  doc.setFillColor(r, g, b);
  doc.roundedRect(22, yPos - 5, summaryWidth - 4, 10, 1, 1, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('Valor deste Recibo:', 25, yPos);
  doc.text(formatCurrencyForPDF(Number(payment.amount), invoice.currency || 'AOA'), pageWidth - 25, yPos, { align: 'right' });
  
  // Footer with signature
  yPos = pageHeight - 50;
  
  if (settings.signature_url) {
    try {
      const response = await fetch(settings.signature_url, { cache: 'force-cache' });
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      doc.addImage(base64, 'PNG', 25, yPos, 40, 15, undefined, 'FAST');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.line(25, yPos + 18, 65, yPos + 18);
      doc.text('Assinatura Autorizada', 45, yPos + 22, { align: 'center' });
    } catch (error) {
      console.error('Error loading signature:', error);
    }
  }
  
  // Bottom bar
  yPos = pageHeight - 22;
  doc.setFillColor(r, g, b);
  doc.rect(0, yPos, pageWidth, 22, 'F');
  
  yPos += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(255, 255, 255);
  doc.text('✓ Este recibo é válido como comprovativo de pagamento e tem valor legal.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.setFont('helvetica', 'bold');
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
