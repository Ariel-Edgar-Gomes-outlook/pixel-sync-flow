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

  private async loadImage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  }

  private addHeader(invoiceData: InvoiceData) {
    const startY = this.margin;

    // Add logo if available
    if (this.businessSettings.logo_url) {
      // Logo will be added asynchronously
      this.doc.text('', this.margin, startY);
    }

    // Company name and details
    this.doc.setFontSize(20);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.businessSettings.business_name, this.margin, startY + 10);

    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    
    let yPos = startY + 18;
    if (this.businessSettings.trade_name) {
      this.doc.text(this.businessSettings.trade_name, this.margin, yPos);
      yPos += 5;
    }
    if (this.businessSettings.nif) {
      this.doc.text(`NIF: ${this.businessSettings.nif}`, this.margin, yPos);
      yPos += 5;
    }
    if (this.businessSettings.email) {
      this.doc.text(`Email: ${this.businessSettings.email}`, this.margin, yPos);
      yPos += 5;
    }
    if (this.businessSettings.phone) {
      this.doc.text(`Tel: ${this.businessSettings.phone}`, this.margin, yPos);
      yPos += 5;
    }

    // Invoice title and number
    this.doc.setFontSize(24);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    const title = invoiceData.is_proforma ? 'FACTURA PRO-FORMA' : 'FACTURA';
    this.doc.text(title, this.pageWidth - this.margin, startY + 15, { align: 'right' });

    this.doc.setFontSize(14);
    this.doc.setTextColor(80, 80, 80);
    this.doc.text(invoiceData.invoice_number, this.pageWidth - this.margin, startY + 25, { align: 'right' });

    return yPos + 10;
  }

  private addClientInfo(invoiceData: InvoiceData, startY: number) {
    // Client box
    this.doc.setFillColor(245, 245, 245);
    this.doc.rect(this.margin, startY, (this.pageWidth - 2 * this.margin) / 2, 35, 'F');

    this.doc.setFontSize(11);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CLIENTE', this.margin + 5, startY + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    let yPos = startY + 15;
    
    this.doc.text(invoiceData.client.name, this.margin + 5, yPos);
    yPos += 5;
    
    if (invoiceData.client.email) {
      this.doc.text(invoiceData.client.email, this.margin + 5, yPos);
      yPos += 5;
    }
    if (invoiceData.client.phone) {
      this.doc.text(invoiceData.client.phone, this.margin + 5, yPos);
      yPos += 5;
    }

    // Invoice dates
    const dateBoxX = this.pageWidth / 2 + 5;
    this.doc.setFont('helvetica', 'bold');
    yPos = startY + 8;
    
    this.doc.text('Data de Emissão:', dateBoxX, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(invoiceData.issue_date).toLocaleDateString('pt-PT'), dateBoxX + 40, yPos);
    
    if (invoiceData.due_date) {
      yPos += 7;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Data de Vencimento:', dateBoxX, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(new Date(invoiceData.due_date).toLocaleDateString('pt-PT'), dateBoxX + 40, yPos);
    }

    return startY + 45;
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
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
      },
    });

    return (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addTotalsSection(invoiceData: InvoiceData, startY: number) {
    const rightX = this.pageWidth - this.margin;
    const labelX = rightX - 80;
    const valueX = rightX - 5;

    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);

    let yPos = startY;

    // Subtotal
    this.doc.text('Subtotal:', labelX, yPos);
    this.doc.text(
      `${invoiceData.subtotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      valueX,
      yPos,
      { align: 'right' }
    );
    yPos += 7;

    // Discount
    if (invoiceData.discount_amount > 0) {
      this.doc.text('Desconto:', labelX, yPos);
      this.doc.text(
        `-${invoiceData.discount_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
        valueX,
        yPos,
        { align: 'right' }
      );
      yPos += 7;
    }

    // Tax
    this.doc.text(`IVA (${invoiceData.tax_rate}%):`, labelX, yPos);
    this.doc.text(
      `${invoiceData.tax_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      valueX,
      yPos,
      { align: 'right' }
    );
    yPos += 10;

    // Total
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text('TOTAL:', labelX, yPos);
    this.doc.text(
      `${invoiceData.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${invoiceData.currency}`,
      valueX,
      yPos,
      { align: 'right' }
    );

    return yPos + 15;
  }

  private addPaymentInfo(startY: number) {
    if (!this.businessSettings.iban && !this.businessSettings.payment_terms) {
      return startY;
    }

    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, 25, 'F');

    this.doc.setFontSize(10);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DADOS BANCÁRIOS', this.margin + 5, startY + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    let yPos = startY + 14;

    if (this.businessSettings.bank_name) {
      this.doc.text(`Banco: ${this.businessSettings.bank_name}`, this.margin + 5, yPos);
      yPos += 5;
    }
    if (this.businessSettings.iban) {
      this.doc.text(`IBAN: ${this.businessSettings.iban}`, this.margin + 5, yPos);
      yPos += 5;
    }
    if (this.businessSettings.account_holder) {
      this.doc.text(`Titular: ${this.businessSettings.account_holder}`, this.margin + 5, yPos);
    }

    return startY + 30;
  }

  private addFooter(invoiceData: InvoiceData, startY: number) {
    const footerY = this.pageHeight - 30;

    // Signature
    if (this.businessSettings.signature_url) {
      // Signature will be added asynchronously
    }

    // Legal terms
    if (this.businessSettings.terms_footer) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(120, 120, 120);
      this.doc.setFont('helvetica', 'italic');
      const terms = this.doc.splitTextToSize(this.businessSettings.terms_footer, this.pageWidth - 2 * this.margin);
      this.doc.text(terms, this.margin, footerY);
    }

    // Page number
    this.doc.setFontSize(8);
    this.doc.text(
      `Página 1 de 1`,
      this.pageWidth / 2,
      this.pageHeight - 10,
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
    let currentY = this.addHeader(invoiceData);
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
