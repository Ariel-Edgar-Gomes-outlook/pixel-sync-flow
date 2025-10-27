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
    const logoSize = 35;
    let maxLogoWidth = 0;

    // Add logo if available (left side)
    if (this.businessSettings.logo_url) {
      try {
        const logoData = await this.loadImage(this.businessSettings.logo_url);
        if (logoData) {
          this.doc.addImage(logoData, 'PNG', this.margin, startY, logoSize, logoSize, undefined, 'FAST');
          maxLogoWidth = logoSize;
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }

    // Company name - right next to the logo
    const companyNameX = this.margin + maxLogoWidth + 5;
    this.doc.setFontSize(16);
    this.doc.setTextColor(40, 40, 40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.businessSettings.business_name, companyNameX, startY + 10);

    // Company contact details - below logo and company name
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    
    let detailsY = startY + logoSize + 5;
    
    if (this.businessSettings.email) {
      this.doc.text(`Email: ${this.businessSettings.email}`, this.margin, detailsY);
      detailsY += 4;
    }
    
    if (this.businessSettings.phone) {
      this.doc.text(`Tel: ${this.businessSettings.phone}`, this.margin, detailsY);
      detailsY += 4;
    }
    
    if (this.businessSettings.nif) {
      this.doc.text(`NIF: ${this.businessSettings.nif}`, this.margin, detailsY);
      detailsY += 4;
    }

    // Large INVOICE/PRO-FORMA title - right side
    const title = invoiceData.is_proforma ? 'PRO-FORMA' : 'FACTURA';
    this.doc.setFontSize(28);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth - this.margin, startY + 15, { align: 'right' });

    // Invoice number - right side, below title
    this.doc.setFontSize(11);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(invoiceData.invoice_number, this.pageWidth - this.margin, startY + 25, { align: 'right' });

    return detailsY + 10;
  }

  private addClientInfo(invoiceData: InvoiceData, startY: number) {
    const leftColumnWidth = 100;
    const rightColumnX = this.pageWidth - this.margin - 80;

    // CLIENTE section - left
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CLIENTE', this.margin, startY);

    let yPos = startY + 6;
    this.doc.setFontSize(10);
    this.doc.setTextColor(40, 40, 40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(invoiceData.client.name, this.margin, yPos);
    yPos += 5;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(80, 80, 80);
    
    if (invoiceData.client.email) {
      this.doc.text(invoiceData.client.email, this.margin, yPos);
      yPos += 4;
    }
    
    if (invoiceData.client.phone) {
      this.doc.text(invoiceData.client.phone, this.margin, yPos);
      yPos += 4;
    }

    // Dates section - right side
    let rightY = startY;
    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Data de Emissão:', rightColumnX, rightY);
    
    this.doc.setTextColor(40, 40, 40);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(invoiceData.issue_date).toLocaleDateString('pt-PT'), this.pageWidth - this.margin, rightY, { align: 'right' });
    rightY += 6;

    if (invoiceData.due_date) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Data de Vencimento:', rightColumnX, rightY);
      
      this.doc.setTextColor(40, 40, 40);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(new Date(invoiceData.due_date).toLocaleDateString('pt-PT'), this.pageWidth - this.margin, rightY, { align: 'right' });
      rightY += 6;
    }

    return Math.max(yPos, rightY) + 10;
  }

  private addItemsTable(invoiceData: InvoiceData, startY: number) {
    const tableData = invoiceData.items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      `${item.unit_price.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`,
      `${item.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(this.doc, {
      startY: startY,
      head: [['#', 'DESCRIÇÃO', 'PREÇO', 'TOTAL']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      },
      styles: {
        fontSize: 9,
        cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });

    return (this.doc as any).lastAutoTable.finalY + 8;
  }

  private addTotalsSection(invoiceData: InvoiceData, startY: number) {
    const rightX = this.pageWidth - this.margin;
    const labelX = rightX - 70;
    
    let yPos = startY + 5;
    const lineHeight = 6;

    // Thin top line
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.3);
    this.doc.line(labelX - 5, startY, rightX, startY);

    this.doc.setFontSize(9);
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFont('helvetica', 'normal');

    // Subtotal
    this.doc.text('Sub Total:', labelX, yPos);
    this.doc.text(
      `${invoiceData.currency} ${invoiceData.subtotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`,
      rightX,
      yPos,
      { align: 'right' }
    );
    yPos += lineHeight;

    // Discount (if applicable)
    if (invoiceData.discount_amount > 0) {
      this.doc.text('Desconto:', labelX, yPos);
      this.doc.text(
        `-${invoiceData.currency} ${invoiceData.discount_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`,
        rightX,
        yPos,
        { align: 'right' }
      );
      yPos += lineHeight;
    }

    // Tax
    if (invoiceData.tax_amount > 0) {
      this.doc.text(`IVA (${invoiceData.tax_rate}%):`, labelX, yPos);
      this.doc.text(
        `${invoiceData.currency} ${invoiceData.tax_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`,
        rightX,
        yPos,
        { align: 'right' }
      );
      yPos += lineHeight + 2;
    } else {
      yPos += 2;
    }

    // Bold line above total
    this.doc.setDrawColor(40, 40, 40);
    this.doc.setLineWidth(0.8);
    this.doc.line(labelX - 5, yPos, rightX, yPos);
    yPos += 6;

    // TOTAL - Large and bold
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('TOTAL:', labelX, yPos);
    this.doc.text(
      `${invoiceData.currency} ${invoiceData.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`,
      rightX,
      yPos,
      { align: 'right' }
    );

    return yPos + 15;
  }

  private addPaymentInfo(startY: number) {
    if (!this.businessSettings.iban && !this.businessSettings.payment_terms) {
      return startY;
    }

    // Clean payment information section
    this.doc.setFontSize(10);
    this.doc.setTextColor(40, 40, 40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMAÇÕES DE PAGAMENTO:', this.margin, startY);

    // Thin line
    this.doc.setDrawColor(40, 40, 40);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, startY + 2, this.margin + 70, startY + 2);

    let yPos = startY + 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(60, 60, 60);

    if (this.businessSettings.bank_name) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Banco:', this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.businessSettings.bank_name, this.margin + 22, yPos);
      yPos += 5;
    }
    
    if (this.businessSettings.account_holder) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Nome:', this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.businessSettings.account_holder, this.margin + 22, yPos);
      yPos += 5;
    }
    
    if (this.businessSettings.iban) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Conta:', this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.businessSettings.iban, this.margin + 22, yPos);
      yPos += 5;
    }

    return yPos + 8;
  }

  private async addFooter(invoiceData: InvoiceData, startY: number) {
    const footerY = this.pageHeight - 30;

    // Terms and Conditions section if exists
    if (this.businessSettings.payment_terms || invoiceData.notes) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(40, 40, 40);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('TERMOS E CONDIÇÕES:', this.margin, startY);

      // Thin line
      this.doc.setDrawColor(40, 40, 40);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, startY + 2, this.margin + 55, startY + 2);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(80, 80, 80);
      
      const termsText = invoiceData.notes || this.businessSettings.payment_terms || '';
      const terms = this.doc.splitTextToSize(termsText, this.pageWidth - 2 * this.margin);
      this.doc.text(terms, this.margin, startY + 8);
    }

    // Bottom bar - simple and clean
    this.doc.setFillColor(40, 40, 40);
    this.doc.rect(0, this.pageHeight - 15, this.pageWidth, 15, 'F');
    
    this.doc.setFontSize(7);
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `Documento gerado eletronicamente`,
      this.pageWidth / 2,
      this.pageHeight - 8,
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
