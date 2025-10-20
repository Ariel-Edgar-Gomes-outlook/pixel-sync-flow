import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportMultipleSheets(sheets: { name: string; data: any[] }[], filename: string) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Format data for export
export function formatClientsForExport(clients: any[]) {
  return clients.map(client => ({
    'Nome': client.name,
    'Email': client.email || '',
    'Telefone': client.phone || '',
    'Tipo': client.type || '',
    'Endereço': client.address || '',
    'Notas': client.notes || '',
    'Data de Criação': new Date(client.created_at).toLocaleDateString('pt-AO'),
  }));
}

export function formatJobsForExport(jobs: any[]) {
  return jobs.map(job => ({
    'Título': job.title,
    'Tipo': job.type,
    'Cliente': job.clients?.name || '',
    'Status': job.status,
    'Data Início': new Date(job.start_datetime).toLocaleDateString('pt-AO'),
    'Local': job.location || '',
    'Receita Estimada': job.estimated_revenue || 0,
    'Custo Estimado': job.estimated_cost || 0,
    'Horas Estimadas': job.estimated_hours || 0,
    'Tempo Gasto': job.time_spent || 0,
  }));
}

export function formatPaymentsForExport(payments: any[]) {
  return payments.map(payment => ({
    'Cliente': payment.clients?.name || '',
    'Valor': payment.amount,
    'Moeda': payment.currency,
    'Tipo': payment.type,
    'Status': payment.status,
    'Método': payment.method || '',
    'Data Pagamento': payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('pt-AO') : '',
    'Data Criação': new Date(payment.created_at).toLocaleDateString('pt-AO'),
    'Notas': payment.notes || '',
  }));
}

export function formatLeadsForExport(leads: any[]) {
  return leads.map(lead => ({
    'Cliente': lead.clients?.name || '',
    'Status': lead.status,
    'Probabilidade': `${lead.probability}%`,
    'Fonte': lead.source || '',
    'Responsável': lead.responsible_id || '',
    'Notas': lead.notes || '',
    'Data Criação': new Date(lead.created_at).toLocaleDateString('pt-AO'),
  }));
}

export function formatQuotesForExport(quotes: any[]) {
  return quotes.map(quote => ({
    'Cliente': quote.clients?.name || '',
    'Status': quote.status,
    'Total': quote.total,
    'Moeda': quote.currency,
    'IVA': `${quote.tax}%`,
    'Desconto': `${quote.discount}%`,
    'Validade': quote.validity_date ? new Date(quote.validity_date).toLocaleDateString('pt-AO') : '',
    'Data Criação': new Date(quote.created_at).toLocaleDateString('pt-AO'),
    'Data Aceitação': quote.accepted_at ? new Date(quote.accepted_at).toLocaleDateString('pt-AO') : '',
  }));
}
