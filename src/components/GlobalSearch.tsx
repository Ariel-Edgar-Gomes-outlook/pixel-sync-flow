import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Users, Briefcase, FileText, CreditCard, UserPlus, Receipt, FileCheck } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useJobs } from '@/hooks/useJobs';
import { useLeads } from '@/hooks/useLeads';
import { useQuotes } from '@/hooks/useQuotes';
import { usePayments } from '@/hooks/usePayments';
import { useInvoices } from '@/hooks/useInvoices';
import { useContracts } from '@/hooks/useContracts';
import { useCurrency } from '@/hooks/useCurrency';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const { data: clients } = useClients();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: quotes } = useQuotes();
  const { data: payments } = usePayments();
  const { data: invoices } = useInvoices();
  const { data: contracts } = useContracts();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredJobs = jobs?.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredLeads = leads?.filter((lead) =>
    lead.clients?.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredQuotes = quotes?.filter((quote) =>
    quote.clients?.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredPayments = payments?.filter((payment) =>
    payment.clients?.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredInvoices = invoices?.filter((invoice) =>
    invoice.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    invoice.clients?.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredContracts = contracts?.filter((contract) =>
    contract.clients?.name.toLowerCase().includes(search.toLowerCase()) ||
    contract.jobs?.title?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Pesquisar...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Pesquisar clientes, jobs, leads..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          {filteredClients.length > 0 && (
            <CommandGroup heading="Clientes">
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  onSelect={() => handleSelect('/dashboard/clients')}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  <div className="flex-1">
                    <span>{client.name}</span>
                    {client.type && (
                      <span className="text-xs text-muted-foreground ml-2">• {client.type}</span>
                    )}
                  </div>
                  {client.email && (
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredJobs.length > 0 && (
            <CommandGroup heading="Jobs">
              {filteredJobs.map((job) => (
                <CommandItem
                  key={job.id}
                  onSelect={() => handleSelect('/dashboard/jobs')}
                  className="gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <div className="flex-1">
                    <span>{job.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      • {job.clients?.name || 'Cliente'} • {job.type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.start_datetime).toLocaleDateString('pt-PT')}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredLeads.length > 0 && (
            <CommandGroup heading="Leads">
              {filteredLeads.map((lead) => (
                <CommandItem
                  key={lead.id}
                  onSelect={() => handleSelect('/dashboard/leads')}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{lead.clients?.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{lead.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredQuotes.length > 0 && (
            <CommandGroup heading="Orçamentos">
              {filteredQuotes.map((quote) => (
                <CommandItem
                  key={quote.id}
                  onSelect={() => handleSelect('/dashboard/quotes')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <div className="flex-1">
                    <span>Orçamento - {quote.clients?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">• {quote.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(Number(quote.total))}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredPayments.length > 0 && (
            <CommandGroup heading="Pagamentos">
              {filteredPayments.map((payment) => (
                <CommandItem
                  key={payment.id}
                  onSelect={() => handleSelect('/dashboard/payments')}
                  className="gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  <div className="flex-1">
                    <span>Pagamento - {payment.clients?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">• {payment.type} • {payment.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredInvoices.length > 0 && (
            <CommandGroup heading="Faturas">
              {filteredInvoices.map((invoice) => (
                <CommandItem
                  key={invoice.id}
                  onSelect={() => handleSelect('/dashboard/invoices')}
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <div className="flex-1">
                    <span>{invoice.invoice_number}</span>
                    <span className="text-xs text-muted-foreground ml-2">• {invoice.clients?.name} • {invoice.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(Number(invoice.total))}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredContracts.length > 0 && (
            <CommandGroup heading="Contratos">
              {filteredContracts.map((contract) => (
                <CommandItem
                  key={contract.id}
                  onSelect={() => handleSelect('/dashboard/contracts')}
                  className="gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  <div className="flex-1">
                    <span>Contrato - {contract.clients?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">• {contract.jobs?.title || 'Job'} • {contract.status}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
