import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessSettings } from '@/hooks/useBusinessSettings';

// ============================================
// IMAGE CACHE FOR PERFORMANCE
// ============================================
const imageCache = new Map<string, string>();

async function loadImageWithCache(url: string): Promise<string> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    imageCache.set(url, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error('Error loading image:', error);
    return '';
  }
}

// ============================================
// INTERFACES
// ============================================

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

interface Payment {
  id: string;
  amount: number;
  type: string;
  method: string | null;
  paid_at: string;
  notes: string | null;
  status: string;
}

interface InvoiceRecord {
  invoice_number: string;
  issue_date: string;
  total: number;
  currency: string;
  amount_paid?: number;
  items: any[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  is_proforma: boolean;
  due_date?: string;
  notes?: string;
  payment_instructions?: string;
  status?: string;
}

interface Client {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Contract {
  id: string;
  client_id: string;
  job_id?: string;
  terms_text: string;
  usage_rights_text?: string;
  cancellation_policy_text?: string;
  late_delivery_clause?: string;
  copyright_notice?: string;
  reschedule_policy?: string;
  revision_policy?: string;
  cancellation_fee?: number;
  issued_at: string;
  signed_at?: string | null;
  signature_url?: string | null;
}

interface Quote {
  id: string;
  client_id: string;
  job_id?: string;
  items: any[];
  tax: number;
  discount: number;
  total: number;
  currency: string;
  validity_date: string | null;
  status: string;
  created_at: string;
  accepted_at?: string | null;
}

// ============================================
// PROFESSIONAL PDF GENERATOR CLASS (Modified - Returns Blob)
// ============================================

export class ProfessionalPDFGenerator {
  private doc: jsPDF;
  private businessSettings: BusinessSettings;
  private primaryColor: [number, number, number];
  private secondaryColor: [number, number, number];
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor(businessSettings: BusinessSettings) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
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
    return loadImageWithCache(url);
  }

  private async addHeader(invoiceData: InvoiceData) {
    const startY = this.margin;

    // Add logo if available
    if (this.businessSettings.logo_url) {
      try {
        const logoData = await this.loadImage(this.businessSettings.logo_url);
        if (logoData) {
          this.doc.addImage(logoData, 'PNG', this.margin, startY, 30, 30);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
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

  async generateInvoice(invoiceData: InvoiceData): Promise<Blob> {
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

    // Return Blob directly (NO UPLOAD)
    return this.doc.output('blob');
  }
}

// ============================================
// LOCAL PDF GENERATION FUNCTIONS
// ============================================

/**
 * Generate Contract PDF locally from database data
 */
export async function generateContractPDFLocal(contractId: string): Promise<Blob> {
  // 1. Verify authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // 2. Fetch ALL data in parallel for better performance
  const [contractResult, businessResult] = await Promise.all([
    supabase.from('contracts').select('*, clients(*), jobs(id, title)').eq('id', contractId).single(),
    supabase.from('business_settings').select('*').eq('user_id', user.id).maybeSingle()
  ]);

  if (contractResult.error) throw contractResult.error;
  if (!contractResult.data) throw new Error('Contrato não encontrado');
  if (businessResult.error) throw businessResult.error;
  if (!businessResult.data) {
    throw new Error('Configurações de negócio não encontradas. Configure em Configurações > Negócio.');
  }

  const contract = contractResult.data;
  const businessSettings = businessResult.data;

  // 3. Pre-load images in parallel
  const imagePromises: Promise<string | null>[] = [];
  if (businessSettings.logo_url) {
    imagePromises.push(loadImageWithCache(businessSettings.logo_url).catch(() => null));
  } else {
    imagePromises.push(Promise.resolve(null));
  }
  if (contract.signature_url) {
    imagePromises.push(loadImageWithCache(contract.signature_url).catch(() => null));
  } else {
    imagePromises.push(Promise.resolve(null));
  }
  if (businessSettings.signature_url) {
    imagePromises.push(loadImageWithCache(businessSettings.signature_url).catch(() => null));
  } else {
    imagePromises.push(Promise.resolve(null));
  }

  const [logoData, clientSigData, businessSigData] = await Promise.all(imagePromises);

  // 4. Generate PROFESSIONAL CONTRACT PDF (A4 format)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Parse colors
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [59, 130, 246];
  };
  
  const primaryColor = hexToRgb(businessSettings.primary_color || '#2563EB');
  const companyName = businessSettings.business_name || businessSettings.trade_name || 'Empresa';
  
  let yPos = margin;
  
  // === CABEÇALHO PROFISSIONAL com Logo Proporcional ===
  if (logoData) {
    try {
      // Obter dimensões reais da imagem para manter aspect ratio
      const img = new Image();
      img.src = logoData;
      await new Promise<void>((resolve) => { 
        img.onload = () => resolve(); 
      });
      
      const aspectRatio = img.width / img.height;
      const maxWidth = 40;
      const maxHeight = 25;
      
      let finalWidth = maxWidth;
      let finalHeight = maxWidth / aspectRatio;
      
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = maxHeight * aspectRatio;
      }
      
      const logoX = (pageWidth - finalWidth) / 2;
      doc.addImage(logoData, 'PNG', logoX, yPos, finalWidth, finalHeight);
      yPos += finalHeight + 8;
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
      yPos += 10;
    }
  }
  
  // Nome da empresa (centralizado, negrito, maiúsculas)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(companyName.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Informações da empresa (centralizadas, fonte menor)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  if (businessSettings.nif) {
    doc.text(`NIF: ${businessSettings.nif}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  }
  
  const addressParts = [];
  if (businessSettings.address_line1) addressParts.push(businessSettings.address_line1);
  if (businessSettings.city) addressParts.push(businessSettings.city);
  if (businessSettings.province) addressParts.push(businessSettings.province);
  
  if (addressParts.length > 0) {
    doc.text(addressParts.join(', '), pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  }
  
  if (businessSettings.email) {
    doc.text(`Email: ${businessSettings.email}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  }
  if (businessSettings.phone) {
    doc.text(`Telefone: ${businessSettings.phone}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  }

  yPos += 5;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // === TÍTULO DO CONTRATO (centralizado) ===
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contrato Nº: ${contract.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Data: ${new Date(contract.created_at).toLocaleDateString('pt-PT')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Linha dupla de separação
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 2;
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;
  
  // === SEÇÃO DAS PARTES (Formal) ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATANTE:', margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${businessSettings.business_name || 'N/A'}`, margin + 5, yPos);
  yPos += 5;
  
  if (businessSettings.nif) {
    doc.text(`NIF: ${businessSettings.nif}`, margin + 5, yPos);
    yPos += 5;
  }
  
  const businessAddressParts = [];
  if (businessSettings.address_line1) businessAddressParts.push(businessSettings.address_line1);
  if (businessSettings.city) businessAddressParts.push(businessSettings.city);
  if (businessSettings.province) businessAddressParts.push(businessSettings.province);
  
  if (businessAddressParts.length > 0) {
    const addressLines = doc.splitTextToSize(`Endereço: ${businessAddressParts.join(', ')}`, contentWidth - 5);
    doc.text(addressLines, margin + 5, yPos);
    yPos += addressLines.length * 5;
  }

  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATADO:', margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (contract.clients) {
    doc.text(`Nome: ${contract.clients.name}`, margin + 5, yPos);
    yPos += 5;
    if (contract.clients.email) {
      doc.text(`Email: ${contract.clients.email}`, margin + 5, yPos);
      yPos += 5;
    }
    if (contract.clients.phone) {
      doc.text(`Telefone: ${contract.clients.phone}`, margin + 5, yPos);
      yPos += 5;
    }
    if (contract.clients.address) {
      const clientAddressLines = doc.splitTextToSize(`Endereço: ${contract.clients.address}`, contentWidth - 5);
      doc.text(clientAddressLines, margin + 5, yPos);
      yPos += clientAddressLines.length * 5;
    }
  }

  yPos += 12;

  // === CLÁUSULAS DO CONTRATO (Numeradas e Justificadas) ===
  let clauseNumber = 1;
  
  const addClause = (title: string, content: string) => {
    // Verificar se precisa de nova página
    if (yPos > 240) {
      doc.addPage();
      yPos = margin + 10;
    }

    // Título da cláusula (maiúsculas, negrito, numerado)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`CLÁUSULA ${clauseNumber}ª - ${title.toUpperCase()}`, margin, yPos);
    yPos += 7;
    clauseNumber++;

    // Conteúdo da cláusula (texto justificado)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    
    const lines = doc.splitTextToSize(content, contentWidth);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin + 10;
      }
      doc.text(line, margin, yPos, { align: 'justify', maxWidth: contentWidth });
      yPos += 5;
    });
    
    yPos += 6;
  };

  // Adicionar todas as cláusulas do contrato
  if (contract.terms_text) {
    addClause('OBJETO DO CONTRATO', contract.terms_text);
  }
  if (contract.usage_rights_text) {
    addClause('DIREITOS DE USO', contract.usage_rights_text);
  }
  if (contract.cancellation_policy_text) {
    addClause('CANCELAMENTO', contract.cancellation_policy_text);
  }
  if (contract.reschedule_policy) {
    addClause('REAGENDAMENTO', contract.reschedule_policy);
  }
  if (contract.revision_policy) {
    addClause('REVISÕES', contract.revision_policy);
  }
  if (contract.copyright_notice) {
    addClause('DIREITOS AUTORAIS', contract.copyright_notice);
  }
  if (contract.late_delivery_clause) {
    addClause('PRAZOS DE ENTREGA', contract.late_delivery_clause);
  }

  // === SEÇÃO DE ASSINATURAS (Formal) ===
  if (yPos > 210) {
    doc.addPage();
    yPos = margin + 10;
  }

  yPos += 15;
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURAS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  const signatureLeftX = margin + 35;
  const signatureRightX = pageWidth / 2 + 35;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // CONTRATANTE (esquerda)
  if (clientSigData) {
    try {
      doc.addImage(clientSigData, 'PNG', signatureLeftX - 20, yPos, 40, 20);
      yPos += 25;
    } catch (error) {
      yPos += 25;
    }
  } else {
    yPos += 25;
  }
  
  doc.setLineWidth(0.2);
  doc.line(signatureLeftX - 30, yPos, signatureLeftX + 30, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATANTE', signatureLeftX, yPos, { align: 'center' });
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(businessSettings.business_name || '', signatureLeftX, yPos, { align: 'center' });

  // Reset yPos para CONTRATADO
  yPos -= 35;

  // CONTRATADO (direita)
  yPos += 25;
  doc.setFontSize(10);
  doc.setLineWidth(0.2);
  doc.line(signatureRightX - 30, yPos, signatureRightX + 30, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATADO', signatureRightX, yPos, { align: 'center' });
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(contract.clients?.name || '', signatureRightX, yPos, { align: 'center' });

  yPos += 10;

  // === RODAPÉ EM TODAS AS PÁGINAS ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 15;
    
    // Número da página
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    // Texto do rodapé (se existir) - removido pois campo não existe
  }

  // 5. Retornar Blob diretamente
  return doc.output('blob');
}

/**
 * Generate Quote PDF locally from database data
 */
export async function generateQuotePDFLocal(quoteId: string): Promise<Blob> {
  // 1. Verify authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // 2. Fetch quote with related data
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*, clients(*), jobs(id, title)')
    .eq('id', quoteId)
    .single();

  if (quoteError) throw quoteError;
  if (!quote) throw new Error('Orçamento não encontrado');

  // 3. Fetch business settings
  const { data: businessSettings, error: settingsError } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (settingsError) throw settingsError;
  if (!businessSettings) {
    throw new Error('Configurações de negócio não encontradas. Configure em Configurações > Negócio.');
  }

  // 4. Generate PDF with jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  let yPos = 20;

  // Header with logo (using cache)
  if (businessSettings.logo_url) {
    try {
      const logoData = await loadImageWithCache(businessSettings.logo_url);
      if (logoData) {
        doc.addImage(logoData, 'PNG', 20, yPos, 40, 20);
      }
    } catch (e) {
      console.warn('Failed to load logo');
    }
  }

  // Company info (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const companyName = businessSettings.business_name || businessSettings.trade_name || 'Empresa';
  doc.text(companyName, 200, yPos + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (businessSettings.nif) {
    doc.text(`NIF: ${businessSettings.nif}`, 200, yPos + 10, { align: 'right' });
  }
  if (businessSettings.email) {
    doc.text(businessSettings.email, 200, yPos + 14, { align: 'right' });
  }
  if (businessSettings.phone) {
    doc.text(businessSettings.phone, 200, yPos + 18, { align: 'right' });
  }

  yPos = 50;

  // Title
  doc.setFontSize(22); // Increased from 18
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(11); // Increased from 10
  doc.setFont('helvetica', 'normal');
  const quoteNumber = `ORC-${quote.id.substring(0, 8).toUpperCase()}`;
  doc.text(`Nº ${quoteNumber}`, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.text(`Emitido em: ${new Date(quote.created_at).toLocaleDateString('pt-AO')}`, 105, yPos, { align: 'center' });
  
  if (quote.validity_date) {
    yPos += 6;
    doc.text(`Válido até: ${new Date(quote.validity_date).toLocaleDateString('pt-AO')}`, 105, yPos, { align: 'center' });
  }

  yPos += 18; // Increased spacing

  // Client Info Box
  doc.setFillColor(245, 247, 250); // Lighter gray
  doc.rect(20, yPos, 170, quote.jobs?.title ? 28 : 23, 'F'); // Increased height
  
  doc.setFontSize(10); // Increased from 9
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 25, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clients.name, 25, yPos + 13);
  if (quote.clients.email) {
    doc.text(quote.clients.email, 25, yPos + 18);
  }
  if (quote.clients.phone) {
    doc.text(quote.clients.phone, 25, yPos + 23);
  }

  if (quote.jobs?.title) {
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇO:', 120, yPos + 7);
    doc.setFont('helvetica', 'normal');
    const jobLines = doc.splitTextToSize(quote.jobs.title, 65);
    doc.text(jobLines, 120, yPos + 13);
  }

  yPos += (quote.jobs?.title ? 38 : 33); // Increased spacing

  // Status Badge
  if (quote.status === 'accepted' && quote.accepted_at) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(20, yPos, 60, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ ACEITE', 50, yPos + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 15;
  }

  // Items Table
  const items = Array.isArray(quote.items) ? quote.items : [];
  const tableData = items.map((item: any) => [
    item.description || item.name,
    (item.quantity || 1).toString(),
    `${quote.currency} ${Number(item.price || 0).toFixed(2)}`,
    `${quote.currency} ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}`,
  ]);

  // Parse primary color for table header
  const primaryColorRgb = businessSettings.primary_color ? 
    [parseInt(businessSettings.primary_color.slice(1,3), 16), 
     parseInt(businessSettings.primary_color.slice(3,5), 16), 
     parseInt(businessSettings.primary_color.slice(5,7), 16)] : 
    [59, 130, 246];

  autoTable(doc, {
    startY: yPos,
    head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: primaryColorRgb as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11, // Increased from 10
      cellPadding: 5, // Increased padding
    },
    bodyStyles: {
      fontSize: 10, // Increased from 9
      cellPadding: 4, // Increased padding
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // Calculations
  const finalY = (doc as any).lastAutoTable.finalY || yPos;
  const subtotal = Number(items.reduce((sum: number, item: any) => sum + ((item.quantity || 1) * (item.price || 0)), 0));
  const taxRate = Number(quote.tax) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discountAmount = Number(quote.discount) || 0;
  const currency = String(quote.currency);
  const total = Number(quote.total) || 0;

  let calcY = finalY + 18; // Increased spacing

  doc.setFontSize(11); // Increased from 10
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Subtotal:', 130, calcY);
  doc.text(`${currency} ${subtotal.toFixed(2)}`, 185, calcY, { align: 'right' });

  if (taxRate > 0) {
    calcY += 8; // Increased from 7
    doc.text(`IVA (${taxRate}%):`, 130, calcY);
    doc.text(`${currency} ${taxAmount.toFixed(2)}`, 185, calcY, { align: 'right' });
  }

  if (discountAmount > 0) {
    calcY += 8; // Increased from 7
    doc.text(`Desconto:`, 130, calcY);
    doc.text(`-${currency} ${discountAmount.toFixed(2)}`, 185, calcY, { align: 'right' });
  }

  calcY += 12; // Increased from 10
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(130, calcY, 190, calcY);

  calcY += 9; // Increased from 8
  doc.setFontSize(15); // Increased from 14
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 130, calcY);
  doc.text(`${currency} ${total.toFixed(2)}`, 185, calcY, { align: 'right' });

  // Payment Terms
  if (businessSettings.payment_terms) {
    calcY += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Condições de Pagamento:', 20, calcY);
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(businessSettings.payment_terms, 170);
    doc.text(termsLines, 20, calcY + 5);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const footerText = businessSettings.terms_footer || 
    `Este orçamento é válido até ${quote.validity_date ? new Date(quote.validity_date).toLocaleDateString('pt-AO') : 'a data indicada'}. Sujeito a disponibilidade.`;
  doc.text(footerText, 105, 280, { align: 'center', maxWidth: 170 });
  doc.text('Obrigado pela sua confiança!', 105, 285, { align: 'center' });

  // 5. Return Blob directly (NO UPLOAD)
  return doc.output('blob');
}

/**
 * Generate Invoice PDF locally from database data
 */
export async function generateInvoicePDFLocal(invoiceId: string): Promise<Blob> {
  // 1. Verify authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // 2. Fetch invoice with related data
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', invoiceId)
    .single();

  if (invoiceError) throw invoiceError;
  if (!invoice) throw new Error('Fatura não encontrada');

  // 3. Fetch business settings
  const { data: businessSettings, error: settingsError } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (settingsError) throw settingsError;
  if (!businessSettings) {
    throw new Error('Configurações de negócio não encontradas. Configure em Configurações > Negócio.');
  }

  // 4. Create invoice data and generate PDF using the class
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const invoiceData: InvoiceData = {
    invoice_number: invoice.invoice_number,
    is_proforma: invoice.is_proforma,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    client: {
      name: invoice.clients.name,
      email: invoice.clients.email,
      phone: invoice.clients.phone,
      address: invoice.clients.address,
    },
    items: items as any,
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

  const generator = new ProfessionalPDFGenerator(businessSettings);
  
  // 5. Return Blob directly (NO UPLOAD)
  return await generator.generateInvoice(invoiceData);
}

/**
 * Generate Receipt PDF locally from database data
 */
export async function generateReceiptPDFLocal(paymentId: string): Promise<Blob> {
  // 1. Verify authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // 2. Fetch payment with related data
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*, clients(*), invoices(*)')
    .eq('id', paymentId)
    .single();

  if (paymentError) throw paymentError;
  if (!payment) throw new Error('Pagamento não encontrado');

  // 3. Fetch business settings
  const { data: settings, error: settingsError } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (settingsError) throw settingsError;
  if (!settings) {
    throw new Error('Configurações de negócio não encontradas');
  }

  // 4. Generate PDF with jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
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
  
  // Logo and business header (using cache)
  if (settings.logo_url) {
    try {
      const logoData = await loadImageWithCache(settings.logo_url);
      if (logoData) {
        doc.addImage(logoData, 'PNG', 20, yPos, 30, 30);
        yPos += 35;
      }
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
  doc.text(`Nome: ${payment.clients.name}`, 20, yPos);
  
  if (payment.clients.email) {
    yPos += 6;
    doc.text(`Email: ${payment.clients.email}`, 20, yPos);
  }
  
  if (payment.clients.phone) {
    yPos += 6;
    doc.text(`Telefone: ${payment.clients.phone}`, 20, yPos);
  }
  
  if (payment.clients.address) {
    yPos += 6;
    doc.text(`Endereço: ${payment.clients.address}`, 20, yPos);
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
    ['Fatura Referência:', payment.invoices.invoice_number],
    ['Data de Emissão da Fatura:', new Date(payment.invoices.issue_date).toLocaleDateString('pt-PT')],
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
  doc.text(`${Number(payment.invoices.total).toFixed(2)} ${payment.invoices.currency || 'AOA'}`, pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text('Valor já Pago:', 25, yPos);
  doc.text(`${Number(payment.invoices.amount_paid || 0).toFixed(2)} ${payment.invoices.currency || 'AOA'}`, pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(r, g, b);
  doc.text('Valor deste Recibo:', 25, yPos);
  doc.text(`${Number(payment.amount).toFixed(2)} ${payment.invoices.currency || 'AOA'}`, pageWidth - 25, yPos, { align: 'right' });
  
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
      const response = await fetch(settings.signature_url);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      doc.addImage(dataUrl, 'PNG', 25, yPos, 40, 15);
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
  
  // 5. Return Blob directly (NO UPLOAD)
  return doc.output('blob');
}
