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
      doc.addImage(contract.signature_url, 'PNG', 20, yPos, 70, 25);
    } catch (e) {
      console.warn('Failed to load signature');
    }
  }
  
  doc.line(20, yPos + 30, 90, yPos + 30);
  doc.setFontSize(9);
  doc.text('Assinatura do Contratante', 55, yPos + 35, { align: 'center' });
  doc.text(contract.client_name, 55, yPos + 40, { align: 'center' });

  // Professional signature
  if (businessSettings?.signature_url) {
    try {
      doc.addImage(businessSettings.signature_url, 'PNG', 120, yPos, 70, 25);
    } catch (e) {
      console.warn('Failed to load business signature');
    }
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
