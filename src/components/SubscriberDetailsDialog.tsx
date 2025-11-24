import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { 
  Users, Briefcase, Calendar, UserPlus, FileText, Receipt, 
  FileCheck, CreditCard, BarChart3, Layers, Wrench, UsersRound,
  Loader2
} from "lucide-react";

interface SubscriberDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
}

interface UserStats {
  clients: number;
  jobs: number;
  leads: number;
  quotes: number;
  invoices: number;
  contracts: number;
  payments: number;
  resources: number;
  teamMembers: number;
  templates: number;
}

const statsConfig = [
  { key: 'clients' as keyof UserStats, label: 'Clientes', icon: Users, color: 'text-blue-600' },
  { key: 'jobs' as keyof UserStats, label: 'Trabalhos', icon: Briefcase, color: 'text-purple-600' },
  { key: 'leads' as keyof UserStats, label: 'Potenciais Clientes', icon: UserPlus, color: 'text-orange-600' },
  { key: 'quotes' as keyof UserStats, label: 'Orçamentos', icon: FileText, color: 'text-cyan-600' },
  { key: 'invoices' as keyof UserStats, label: 'Faturas', icon: Receipt, color: 'text-green-600' },
  { key: 'contracts' as keyof UserStats, label: 'Contratos', icon: FileCheck, color: 'text-indigo-600' },
  { key: 'payments' as keyof UserStats, label: 'Financeiro', icon: CreditCard, color: 'text-emerald-600' },
  { key: 'templates' as keyof UserStats, label: 'Modelos', icon: Layers, color: 'text-violet-600' },
  { key: 'resources' as keyof UserStats, label: 'Recursos', icon: Wrench, color: 'text-amber-600' },
  { key: 'teamMembers' as keyof UserStats, label: 'Equipe', icon: UsersRound, color: 'text-pink-600' },
];

export function SubscriberDetailsDialog({ 
  open, 
  onOpenChange, 
  userId, 
  userName,
  userEmail 
}: SubscriberDetailsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    clients: 0,
    jobs: 0,
    leads: 0,
    quotes: 0,
    invoices: 0,
    contracts: 0,
    payments: 0,
    resources: 0,
    teamMembers: 0,
    templates: 0,
  });

  useEffect(() => {
    if (open && userId) {
      fetchUserStats();
    }
  }, [open, userId]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        clientsResult,
        jobsResult,
        quotesResult,
        invoicesResult,
        paymentsResult,
        resourcesResult,
        teamMembersResult,
        checklistTemplatesResult,
        quoteTemplatesResult,
        contractTemplatesResult,
      ] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('checklist_templates').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('quote_templates').select('id', { count: 'exact', head: true }).eq('created_by', userId),
        supabase.from('contract_templates').select('id', { count: 'exact', head: true }).eq('created_by', userId),
      ]);

      // Fetch leads - need to get via clients created by user
      const { data: userClients } = await supabase
        .from('clients')
        .select('id')
        .eq('created_by', userId);
      
      const clientIds = userClients?.map(c => c.id) || [];
      const leadsResult = clientIds.length > 0 
        ? await supabase.from('leads').select('id', { count: 'exact', head: true }).in('client_id', clientIds)
        : { count: 0 };

      // Fetch contracts - need to get via clients created by user
      const contractsResult = clientIds.length > 0
        ? await supabase.from('contracts').select('id', { count: 'exact', head: true }).in('client_id', clientIds)
        : { count: 0 };

      // Calculate total templates
      const totalTemplates = 
        (checklistTemplatesResult.count || 0) + 
        (quoteTemplatesResult.count || 0) + 
        (contractTemplatesResult.count || 0);

      setStats({
        clients: clientsResult.count || 0,
        jobs: jobsResult.count || 0,
        leads: leadsResult.count || 0,
        quotes: quotesResult.count || 0,
        invoices: invoicesResult.count || 0,
        contracts: contractsResult.count || 0,
        payments: paymentsResult.count || 0,
        resources: resourcesResult.count || 0,
        teamMembers: teamMembersResult.count || 0,
        templates: totalTemplates,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Informações do Assinante</DialogTitle>
          <div className="space-y-1 pt-2">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Estatísticas de Uso</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statsConfig.map(({ key, label, icon: Icon, color }) => (
                <Card key={key} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-3xl font-bold">{stats[key]}</p>
                    </div>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </Card>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total de Registros</p>
                  <p className="text-2xl font-bold">
                    {Object.values(stats).reduce((acc, val) => acc + val, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Áreas com Atividade</p>
                  <p className="text-2xl font-bold">
                    {Object.values(stats).filter(val => val > 0).length} / {Object.keys(stats).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
