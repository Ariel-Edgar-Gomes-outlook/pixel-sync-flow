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
import { Search, Users, Briefcase, FileText, CreditCard, UserPlus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useJobs } from '@/hooks/useJobs';
import { useLeads } from '@/hooks/useLeads';
import { useQuotes } from '@/hooks/useQuotes';
import { usePayments } from '@/hooks/usePayments';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: clients } = useClients();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: quotes } = useQuotes();
  const { data: payments } = usePayments();

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
                  onSelect={() => handleSelect('/clients')}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>{client.name}</span>
                  {client.email && (
                    <span className="text-xs text-muted-foreground ml-auto">{client.email}</span>
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
                  onSelect={() => handleSelect('/jobs')}
                  className="gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{job.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{job.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredLeads.length > 0 && (
            <CommandGroup heading="Leads">
              {filteredLeads.map((lead) => (
                <CommandItem
                  key={lead.id}
                  onSelect={() => handleSelect('/leads')}
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
                  onSelect={() => handleSelect('/quotes')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>{quote.clients?.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {quote.currency} {quote.total}
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
                  onSelect={() => handleSelect('/payments')}
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{payment.clients?.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {payment.currency} {payment.amount}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
