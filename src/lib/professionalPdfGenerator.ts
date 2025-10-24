import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessSettings } from '@/hooks/useBusinessSettings';

interface InvoiceData {
  invoice_number: string;
  is_proforma: boolean;
  issue_date: string;
  due_date?: string;
  client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  notes?: string;
  payment_instructions?: string;
  status?: string;
}

export class ProfessionalPDFGenerator {
  private doc: jsPDF;
  private businessSettings: BusinessSettings;
  private primaryColor: [number, number, number];
  private secondaryColor: [number, number, number];
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor(businessSettings: BusinessSettings) {
    this.doc = new jsPDF();
    this.businessSettings = businessSettings;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    
    // Convert hex colors to RGB
    this.primaryColor = this.hexToRgb(businessSettings.primary_color || '#3B82F6');
    this.secondaryColor = this.hexToRgb(businessSettings.secondary_color || '#1E40AF');
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [59, 130, 246]; // Default blue
  }

  private imageCache: Map<string, string> = new Map();

  private async loadImage(url: string): Promise<string> {
    // Check cache first
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    try {
      const response = await fetch(url, { cache: 'force-cache' });
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Cache the result
      this.imageCache.set(url, base64);
      return base64;
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  }

  private async addHeader(invoiceData: InvoiceData) {
    const startY = this.margin;

    // Modern colored header bar
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, 0, this.pageWidth, 8, 'F');

    // Add logo with better sizing and positioning
    let logoWidth = 0;
    if (this.businessSettings.logo_url) {
      try {
        const logoData = await this.loadImage(this.businessSettings.logo_url);
        if (logoData) {
          const logoSize = 35;
          this.doc.addImage(logoData, 'PNG', this.margin, startY, logoSize, logoSize, undefined, 'FAST');
          logoWidth = logoSize + 10;
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }

    // Company name and details with better spacing
    const detailsX = this.margin + logoWidth;
    this.doc.setFontSize(18);
    this.doc.setTextColor(40, 40, 40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.businessSettings.business_name, detailsX, startY + 8);

    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    
    let yPos = startY + 14;
    if (this.businessSettings.trade_name) {
      this.doc.text(this.businessSettings.trade_name, detailsX, yPos);
      yPos += 4;
    }
    if (this.businessSettings.nif) {
      this.doc.text(`NIF: ${this.businessSettings.nif}`, detailsX, yPos);
      yPos += 4;
    }
    if (this.businessSettings.email) {
      this.doc.text(`✉ ${this.businessSettings.email}`, detailsX, yPos);
      yPos += 4;
    }
    if (this.businessSettings.phone) {
      this.doc.text(`☎ ${this.businessSettings.phone}`, detailsX, yPos);
      yPos += 4;
    }

    // Invoice title and number in elegant box
    const boxWidth = 85;
    const boxHeight = 28;
    const boxX = this.pageWidth - this.margin - boxWidth;
    const boxY = startY;

    // Box with gradient effect (simulated with multiple rectangles)
    this.doc.setFillColor(...this.primaryColor);
    this.doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'F');
    
    this.doc.setFillColor(255, 255, 255, 0.9);
    this.doc.roundedRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4, 1, 1, 'F');

    this.doc.setFontSize(20);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    const title = invoiceData.is_proforma ? 'PRO-FORMA' : 'FATURA';
    this.doc.text(title, boxX + boxWidth / 2, boxY + 12, { align: 'center' });

    this.doc.setFontSize(11);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(invoiceData.invoice_number, boxX + boxWidth / 2, boxY + 20, { align: 'center' });

    return Math.max(yPos, startY + boxHeight) + 10;
  }

  private addClientInfo(invoiceData: InvoiceData, startY: number) {
    const boxHeight = 32;
    const boxWidth = (this.pageWidth - 2 * this.margin - 5) / 2;

    // Client box with modern styling
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(...this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, startY, boxWidth, boxHeight, 2, 2, 'FD');

    // Client header with icon
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.margin, startY, boxWidth, 7, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('👤 CLIENTE', this.margin + 3, startY + 5);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(40, 40, 40);
    let yPos = startY + 13;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(invoiceData.client.name, this.margin + 3, yPos);
    yPos += 5;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    if (invoiceData.client.email) {
      this.doc.text(`✉ ${invoiceData.client.email}`, this.margin + 3, yPos);
      yPos += 4;
    }
    if (invoiceData.client.phone) {
      this.doc.text(`☎ ${invoiceData.client.phone}`, this.margin + 3, yPos);
    }

    // Dates box with modern styling
    const dateBoxX = this.margin + boxWidth + 5;
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(...this.secondaryColor);
    this.doc.roundedRect(dateBoxX, startY, boxWidth, boxHeight, 2, 2, 'FD');

    // Dates header
    this.doc.setFillColor(...this.secondaryColor);
    this.doc.rect(dateBoxX, startY, boxWidth, 7, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('📅 DATAS', dateBoxX + 3, startY + 5);

    yPos = startY + 13;
    this.doc.setFontSize(9);
    this.doc.setTextColor(40, 40, 40);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Emissão:', dateBoxX + 3, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(invoiceData.issue_date).toLocaleDateString('pt-PT'), dateBoxX + 25, yPos);
    
    if (invoiceData.due_date) {
      yPos += 5;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Vencimento:', dateBoxX + 3, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(new Date(invoiceData.due_date).toLocaleDateString('pt-PT'), dateBoxX + 25, yPos);
    }

    return startY + boxHeight + 8;
  }

  private addItemsTable(invoiceData: InvoiceData, startY: number) {
    const tableData = invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `${item.unit_price.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      `${item.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`
    ]);

    autoTable(this.doc, {
      startY: startY,
      head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 42, halign: 'right' },
        3: { cellWidth: 42, halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    return (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addTotalsSection(invoiceData: InvoiceData, startY: number) {
    const boxWidth = 85;
    const rightX = this.pageWidth - this.margin;
    const boxX = rightX - boxWidth;

    let yPos = startY;
    const lineHeight = 6;

    // Background box for totals
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.1);
    
    const boxHeight = 35 + (invoiceData.discount_amount > 0 ? 6 : 0);
    this.doc.roundedRect(boxX, yPos - 2, boxWidth, boxHeight, 1, 1, 'FD');

    this.doc.setFontSize(9);
    this.doc.setTextColor(70, 70, 70);
    this.doc.setFont('helvetica', 'normal');

    const labelX = boxX + 5;
    const valueX = rightX - 5;

    // Subtotal
    this.doc.text('Subtotal:', labelX, yPos);
    this.doc.text(
      `${invoiceData.subtotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      valueX,
      yPos,
      { align: 'right' }
    );
    yPos += lineHeight;

    // Discount
    if (invoiceData.discount_amount > 0) {
      this.doc.setTextColor(220, 38, 38);
      this.doc.text('Desconto:', labelX, yPos);
      this.doc.text(
        `-${invoiceData.discount_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
        valueX,
        yPos,
        { align: 'right' }
      );
      this.doc.setTextColor(70, 70, 70);
      yPos += lineHeight;
    }

    // Tax
    this.doc.text(`IVA (${invoiceData.tax_rate}%):`, labelX, yPos);
    this.doc.text(
      `${invoiceData.tax_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      valueX,
      yPos,
      { align: 'right' }
    );
    yPos += lineHeight + 3;

    // Total with colored background
    this.doc.setFillColor(...this.primaryColor);
    this.doc.roundedRect(boxX + 2, yPos - 4, boxWidth - 4, 10, 1, 1, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('TOTAL:', labelX, yPos + 2);
    this.doc.text(
      `${invoiceData.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      valueX,
      yPos + 2,
      { align: 'right' }
    );

    return yPos + 15;
  }

  private addPaymentInfo(startY: number) {
    if (!this.businessSettings.iban && !this.businessSettings.payment_terms) {
      return startY;
    }

    // Modern payment info box
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(...this.secondaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, startY, this.pageWidth - 2 * this.margin, 24, 2, 2, 'FD');

    // Header bar
    this.doc.setFillColor(...this.secondaryColor);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, 7, 'F');

    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🏦 DADOS BANCÁRIOS', this.margin + 3, startY + 5);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(40, 40, 40);
    let yPos = startY + 13;

    if (this.businessSettings.bank_name) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Banco:', this.margin + 3, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.businessSettings.bank_name, this.margin + 20, yPos);
      yPos += 5;
    }
    if (this.businessSettings.iban) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('IBAN:', this.margin + 3, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.businessSettings.iban, this.margin + 20, yPos);
      yPos += 5;
    }
    if (this.businessSettings.account_holder) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Titular:', this.margin + 3, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.businessSettings.account_holder, this.margin + 20, yPos);
    }

    return startY + 28;
  }

  private async addFooter(invoiceData: InvoiceData, startY: number) {
    const footerY = this.pageHeight - 32;

    // Decorative line
    this.doc.setDrawColor(...this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    // Legal terms
    if (this.businessSettings.terms_footer) {
      this.doc.setFontSize(7);
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFont('helvetica', 'italic');
      const terms = this.doc.splitTextToSize(this.businessSettings.terms_footer, this.pageWidth - 2 * this.margin);
      this.doc.text(terms, this.pageWidth / 2, footerY, { align: 'center' });
    }

    // Bottom bar with page number
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, this.pageHeight - 12, this.pageWidth, 12, 'F');
    
    this.doc.setFontSize(7);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(
      `Documento gerado eletronicamente | Página 1 de 1`,
      this.pageWidth / 2,
      this.pageHeight - 6,
      { align: 'center' }
    );
  }

  private addWatermark(text: string) {
    this.doc.setFontSize(60);
    this.doc.setTextColor(200, 200, 200);
    this.doc.setFont('helvetica', 'bold');
    
    const textWidth = this.doc.getTextWidth(text);
    this.doc.text(
      text,
      (this.pageWidth - textWidth) / 2,
      this.pageHeight / 2,
      { angle: 45 }
    );
  }

  async generateInvoice(invoiceData: InvoiceData): Promise<string> {
    let currentY = await this.addHeader(invoiceData);
    currentY = this.addClientInfo(invoiceData, currentY + 10);
    currentY = this.addItemsTable(invoiceData, currentY + 5);
    currentY = this.addTotalsSection(invoiceData, currentY);
    currentY = this.addPaymentInfo(currentY + 5);
    this.addFooter(invoiceData, currentY);

    // Add watermark for paid/cancelled invoices
    if (invoiceData.status === 'paid') {
      this.addWatermark('PAGO');
    } else if (invoiceData.status === 'cancelled') {
      this.addWatermark('CANCELADA');
    }

    // Upload to Supabase Storage
    const pdfBlob = this.doc.output('blob');
    const fileName = `${invoiceData.invoice_number.replace(/\//g, '-')}.pdf`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async generateProForma(invoiceData: InvoiceData): Promise<string> {
    return this.generateInvoice({ ...invoiceData, is_proforma: true });
  }
}

export async function generateInvoicePDF(
  invoice: any,
  client: any,
  businessSettings: BusinessSettings
): Promise<string> {
  const generator = new ProfessionalPDFGenerator(businessSettings);

  const invoiceData: InvoiceData = {
    invoice_number: invoice.invoice_number,
    is_proforma: invoice.is_proforma,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    client: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    },
    items: invoice.items,
    subtotal: invoice.subtotal,
    tax_rate: invoice.tax_rate,
    tax_amount: invoice.tax_amount,
    discount_amount: invoice.discount_amount,
    total: invoice.total,
    currency: invoice.currency,
    notes: invoice.notes,
    payment_instructions: invoice.payment_instructions,
    status: invoice.status,
  };

  return await generator.generateInvoice(invoiceData);
}
