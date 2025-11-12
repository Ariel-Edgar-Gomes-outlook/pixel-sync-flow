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

// Professional Contract PDF with full business branding and all clauses
export interface ProfessionalContractData {
  id: string;
  client_name: string;
  client_email?: string;
  job_title?: string;
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

export async function generateProfessionalContractPDF(contract: ProfessionalContractData): Promise<string> {
  const doc = new jsPDF();
  let yPos = 20;

  // Fetch business settings
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: businessSettings } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Header with logo
  if (businessSettings?.logo_url) {
    try {
      doc.addImage(businessSettings.logo_url, 'PNG', 20, yPos, 40, 20);
    } catch (e) {
      console.warn('Failed to load logo');
    }
  }

  // Company info (right side)
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  const companyName = businessSettings?.business_name || businessSettings?.trade_name || 'Empresa';
  doc.text(companyName, 200, yPos + 5, { align: 'right' });
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  if (businessSettings?.nif) {
    doc.text(`NIF: ${businessSettings.nif}`, 200, yPos + 10, { align: 'right' });
  }
  if (businessSettings?.email) {
    doc.text(businessSettings.email, 200, yPos + 14, { align: 'right' });
  }
  if (businessSettings?.phone) {
    doc.text(businessSettings.phone, 200, yPos + 18, { align: 'right' });
  }

  yPos = 50;

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 105, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const contractNumber = `CONT-${contract.id.substring(0, 8).toUpperCase()}`;
  doc.text(`Nº ${contractNumber}`, 105, yPos, { align: 'center' });
  
  yPos += 5;
  doc.text(`Emitido em: ${new Date(contract.issued_at).toLocaleDateString('pt-AO')}`, 105, yPos, { align: 'center' });
  
  if (contract.signed_at) {
    yPos += 5;
    doc.text(`Assinado em: ${new Date(contract.signed_at).toLocaleDateString('pt-AO')}`, 105, yPos, { align: 'center' });
  }

  yPos += 15;

  // Client and Job Info Box
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 20, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('CONTRATANTE:', 25, yPos + 6);
  doc.setFont(undefined, 'normal');
  doc.text(contract.client_name, 25, yPos + 11);
  if (contract.client_email) {
    doc.text(contract.client_email, 25, yPos + 16);
  }

  if (contract.job_title) {
    doc.setFont(undefined, 'bold');
    doc.text('SERVIÇO:', 120, yPos + 6);
    doc.setFont(undefined, 'normal');
    doc.text(contract.job_title, 120, yPos + 11);
  }

  yPos += 30;

  // Add all contract sections
  const addSection = (title: string, content: string) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 4 + 8;
  };

  // Main sections
  addSection('1. TERMOS E CONDIÇÕES', contract.terms_text);

  if (contract.usage_rights_text) {
    addSection('2. DIREITOS DE USO DE IMAGEM', contract.usage_rights_text);
  }

  if (contract.cancellation_policy_text) {
    addSection('3. POLÍTICA DE CANCELAMENTO', contract.cancellation_policy_text);
  }

  if (contract.reschedule_policy) {
    addSection('4. POLÍTICA DE REAGENDAMENTO', contract.reschedule_policy);
  }

  if (contract.revision_policy) {
    addSection('5. POLÍTICA DE REVISÕES', contract.revision_policy);
  }

  if (contract.copyright_notice) {
    addSection('6. DIREITOS AUTORAIS', contract.copyright_notice);
  }

  if (contract.late_delivery_clause) {
    addSection('7. CLÁUSULA DE ENTREGA', contract.late_delivery_clause);
  }

  if (contract.cancellation_fee && contract.cancellation_fee > 0) {
    addSection(
      '8. TAXA DE CANCELAMENTO',
      `Em caso de cancelamento, será aplicada uma taxa de ${contract.cancellation_fee.toFixed(2)} AOA conforme política de cancelamento.`
    );
  }

  // Signature section
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 15;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('ASSINATURAS', 105, yPos, { align: 'center' });
  yPos += 10;

  // Client signature
  doc.setFont(undefined, 'normal');
  if (contract.signature_url && contract.signed_at) {
    try {
      console.log('Loading client signature from:', contract.signature_url);
      const signatureBase64 = await loadImageWithCache(contract.signature_url);
      if (signatureBase64) {
        doc.addImage(signatureBase64, 'PNG', 20, yPos, 70, 25, undefined, 'FAST');
        console.log('Client signature loaded successfully');
      } else {
        console.warn('Client signature is empty');
      }
    } catch (e) {
      console.error('Failed to load client signature:', e);
    }
  } else {
    console.log('No signature URL or signed_at date:', { signature_url: contract.signature_url, signed_at: contract.signed_at });
  }
  
  doc.line(20, yPos + 30, 90, yPos + 30);
  doc.setFontSize(9);
  doc.text('Assinatura do Contratante', 55, yPos + 35, { align: 'center' });
  doc.text(contract.client_name, 55, yPos + 40, { align: 'center' });

  // Professional signature
  if (businessSettings?.signature_url) {
    try {
      console.log('Loading business signature from:', businessSettings.signature_url);
      const businessSigBase64 = await loadImageWithCache(businessSettings.signature_url);
      console.log('Business signature loaded, base64 length:', businessSigBase64?.length);
      if (businessSigBase64) {
        doc.addImage(businessSigBase64, 'PNG', 120, yPos, 70, 25, undefined, 'FAST');
        console.log('Business signature added to PDF successfully');
      } else {
        console.error('Business signature is empty after loading');
      }
    } catch (e) {
      console.error('Failed to load business signature:', e);
    }
  } else {
    console.warn('No business signature URL found in settings');
  }
  
  doc.line(120, yPos + 30, 190, yPos + 30);
  doc.text('Assinatura do Prestador', 155, yPos + 35, { align: 'center' });
  doc.text(companyName, 155, yPos + 40, { align: 'center' });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    const footerText = businessSettings?.terms_footer || 'Este documento é regido pelas leis de Angola.';
    doc.text(footerText, 105, 285, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 200, 285, { align: 'right' });
  }

  // Upload to contracts bucket
  const pdfBlob = doc.output('blob');
  const fileName = `contract_${contract.id}_${Date.now()}.pdf`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('contracts')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('contracts')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Professional Quote PDF with full business branding and all details
export interface ProfessionalQuoteData {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  job_title?: string;
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

// Image cache for faster loading
const imageCache = new Map<string, string>();

async function loadImageWithCache(url: string): Promise<string> {
  if (!url || url.trim() === '') {
    console.error('Invalid image URL provided:', url);
    return '';
  }

  if (imageCache.has(url)) {
    console.log('Loading image from cache:', url);
    return imageCache.get(url)!;
  }

  try {
    console.log('Fetching image from URL:', url);
    const response = await fetch(url, { 
      cache: 'force-cache',
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Image blob loaded, size:', blob.size, 'type:', blob.type);
    
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read blob as base64'));
      reader.readAsDataURL(blob);
    });
    
    if (!base64 || base64.length < 100) {
      throw new Error('Invalid base64 result');
    }
    
    console.log('Image successfully converted to base64, length:', base64.length);
    imageCache.set(url, base64);
    return base64;
  } catch (error) {
    console.error('Error loading image from', url, ':', error);
    return '';
  }
}

export async function generateProfessionalQuotePDF(quote: ProfessionalQuoteData): Promise<string> {
  const doc = new jsPDF();
  
  // Fetch business settings
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: businessSettings } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const primaryColor = businessSettings?.primary_color || '#3B82F6';
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [59, 130, 246];
  };
  const [r, g, b] = hexToRgb(primaryColor);

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top colored bar
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 8, 'F');

  let yPos = 18;

  // Logo and company info with modern layout
  if (businessSettings?.logo_url) {
    try {
      const logoBase64 = await loadImageWithCache(businessSettings.logo_url);
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 20, yPos, 35, 35, undefined, 'FAST');
        
        // Company info next to logo
        const companyName = businessSettings.business_name || businessSettings.trade_name || 'Empresa';
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        doc.text(companyName, 60, yPos + 8);
        
        yPos += 12;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        
        if (businessSettings.nif) {
          doc.text(`NIF: ${businessSettings.nif}`, 60, yPos);
          yPos += 4;
        }
        doc.text(`✉ ${businessSettings.email || ''}`, 60, yPos);
        yPos += 4;
        if (businessSettings.phone) {
          doc.text(`☎ ${businessSettings.phone}`, 60, yPos);
        }
        
        yPos = 60;
      }
    } catch (e) {
      console.warn('Failed to load logo, using fallback');
      yPos = 25;
    }
  } else {
    yPos = 25;
  }

  // Quote title box - modern design
  const titleBoxWidth = 110;
  const titleBoxX = (pageWidth - titleBoxWidth) / 2;
  
  doc.setFillColor(r, g, b);
  doc.roundedRect(titleBoxX, yPos, titleBoxWidth, 18, 2, 2, 'F');
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ORÇAMENTO', pageWidth / 2, yPos + 7, { align: 'center' });
  
  yPos += 11;
  const quoteNumber = `ORC-${quote.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(9);
  doc.text(`Nº ${quoteNumber}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 13;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`Emitido: ${new Date(quote.created_at).toLocaleDateString('pt-PT')}`, pageWidth / 2, yPos, { align: 'center' });
  
  if (quote.validity_date) {
    yPos += 4;
    doc.setTextColor(220, 38, 38);
    doc.text(`⏰ Válido até: ${new Date(quote.validity_date).toLocaleDateString('pt-PT')}`, pageWidth / 2, yPos, { align: 'center' });
  }

  yPos += 10;


  // Client Info Box - modern design
  const boxHeight = quote.job_title ? 35 : 28;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPos, pageWidth - 40, boxHeight, 2, 2, 'FD');
  
  // Header bar
  doc.setFillColor(r, g, b);
  doc.rect(20, yPos, pageWidth - 40, 7, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('👤 CLIENTE', 23, yPos + 5);
  
  yPos += 13;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(quote.client_name, 23, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  if (quote.client_email) {
    doc.text(`✉ ${quote.client_email}`, 23, yPos);
    yPos += 4;
  }
  if (quote.client_phone) {
    doc.text(`☎ ${quote.client_phone}`, 23, yPos);
  }

  if (quote.job_title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SERVIÇO:', pageWidth / 2 + 10, yPos - 9);
    doc.setFont('helvetica', 'normal');
    const jobLines = doc.splitTextToSize(quote.job_title, 65);
    doc.text(jobLines, pageWidth / 2 + 10, yPos - 4);
  }

  yPos += (quote.job_title ? 20 : 10);

  // Status Badge
  if (quote.status === 'accepted' && quote.accepted_at) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(20, yPos, 55, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`✓ ACEITE em ${new Date(quote.accepted_at).toLocaleDateString('pt-PT')}`, 47, yPos + 6, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 14;
  }

  // Items Table with modern styling
  const tableData = quote.items.map((item: any) => [
    item.description || item.name,
    (item.quantity || 1).toString(),
    `${Number(item.price || 0).toFixed(2)} ${quote.currency}`,
    `${((item.quantity || 1) * (item.price || 0)).toFixed(2)} ${quote.currency}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [r, g, b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });


  // Calculations with modern styling
  const finalY = (doc as any).lastAutoTable.finalY || yPos;
  const subtotal = quote.items.reduce((sum, item) => sum + ((item.quantity || 1) * (item.price || 0)), 0);
  const taxAmount = subtotal * (quote.tax / 100);
  const discountAmount = quote.discount || 0;

  let calcY = finalY + 12;
  
  const totalsBoxWidth = 80;
  const boxX = pageWidth - 20 - totalsBoxWidth;
  const totalsBoxHeight = 28 + (quote.tax > 0 ? 6 : 0) + (quote.discount > 0 ? 6 : 0);
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(boxX, calcY - 2, totalsBoxWidth, totalsBoxHeight, 1, 1, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  const labelX = boxX + 5;
  const valueX = pageWidth - 25;

  doc.text('Subtotal:', labelX, calcY);
  doc.text(`${subtotal.toFixed(2)} ${quote.currency}`, valueX, calcY, { align: 'right' });

  if (quote.tax > 0) {
    calcY += 6;
    doc.text(`IVA (${quote.tax}%):`, labelX, calcY);
    doc.text(`${taxAmount.toFixed(2)} ${quote.currency}`, valueX, calcY, { align: 'right' });
  }

  if (quote.discount > 0) {
    calcY += 6;
    doc.setTextColor(220, 38, 38);
    doc.text(`Desconto:`, labelX, calcY);
    doc.text(`-${discountAmount.toFixed(2)} ${quote.currency}`, valueX, calcY, { align: 'right' });
    doc.setTextColor(70, 70, 70);
  }

  calcY += 9;
  
  // Total with colored background
  doc.setFillColor(r, g, b);
  doc.roundedRect(boxX + 2, calcY - 4, totalsBoxWidth - 4, 10, 1, 1, 'F');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', labelX, calcY + 2);
  doc.text(`${Number(quote.total).toFixed(2)} ${quote.currency}`, valueX, calcY + 2, { align: 'right' });

  // Payment Terms
  if (businessSettings?.payment_terms) {
    calcY += 18;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text('💳 Condições de Pagamento:', 20, calcY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const termsLines = doc.splitTextToSize(businessSettings.payment_terms, 170);
    doc.text(termsLines, 20, calcY + 5);
  }

  // Bottom bar
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(r, g, b);
  doc.rect(0, footerY, pageWidth, 20, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'italic');
  const footerText = businessSettings?.terms_footer || 
    `Este orçamento é válido até ${quote.validity_date ? new Date(quote.validity_date).toLocaleDateString('pt-PT') : 'a data indicada'}. Sujeito a disponibilidade.`;
  doc.text(footerText, pageWidth / 2, footerY + 7, { align: 'center', maxWidth: 180 });
  doc.setFont('helvetica', 'bold');
  doc.text('✨ Obrigado pela sua confiança!', pageWidth / 2, footerY + 13, { align: 'center' });

  // Upload to pdfs bucket
  const pdfBlob = doc.output('blob');
  const fileName = `quote_${quote.id}_${Date.now()}.pdf`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('pdfs')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
