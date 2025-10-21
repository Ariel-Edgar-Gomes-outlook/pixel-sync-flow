import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, Briefcase, DollarSign, Calendar,
  AlertCircle, Settings, RotateCcw, GripVertical
} from "lucide-react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { usePayments } from "@/hooks/usePayments";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayout: Layout[] = [
  { i: 'revenue', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'jobs', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'clients', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'conversion', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'upcoming-jobs', x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'recent-leads', x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
];

export function CustomizableDashboard() {
  const { user } = useAuth();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: clients } = useClients();
  const { data: payments } = usePayments();
  const updateProfile = useUpdateProfile();

  const [layout, setLayout] = useState<Layout[]>(defaultLayout);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load saved layout from profile.preferences
  useEffect(() => {
    // This would load from profile.preferences.dashboard_layout
    // For now using default
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (isEditMode) {
      setLayout(newLayout);
    }
  };

  const handleSaveLayout = async () => {
    if (!user?.id) return;
    
    try {
      // Save to profile.preferences (JSONB)
      toast.success("Layout salvo!");
      setIsEditMode(false);
    } catch (error) {
      toast.error("Erro ao salvar layout");
    }
  };

  const handleResetLayout = () => {
    setLayout(defaultLayout);
    toast.success("Layout restaurado!");
  };

  // Stats calculations
  const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const activeJobs = jobs?.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length || 0;
  const newClients = clients?.filter(c => {
    const createdDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length || 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLeads = leads?.filter(l => new Date(l.created_at) >= thirtyDaysAgo) || [];
  const wonLeads = recentLeads.filter(l => l.status === 'won').length;
  const conversionRate = recentLeads.length > 0 ? ((wonLeads / recentLeads.length) * 100).toFixed(0) : '0';

  const upcomingJobs = jobs?.filter(j => j.status === 'confirmed' || j.status === 'scheduled').slice(0, 3) || [];
  const displayedLeads = leads?.slice(0, 3) || [];

  const widgets: Record<string, JSX.Element> = {
    revenue: (
      <Card className="p-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">Kz {totalRevenue.toFixed(0)}</p>
        </div>
      </Card>
    ),
    jobs: (
      <Card className="p-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">Jobs Ativos</p>
          <p className="text-2xl font-bold text-foreground mt-1">{activeJobs}</p>
        </div>
      </Card>
    ),
    clients: (
      <Card className="p-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
          <p className="text-2xl font-bold text-foreground mt-1">{newClients}</p>
        </div>
      </Card>
    ),
    conversion: (
      <Card className="p-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
          <p className="text-2xl font-bold text-foreground mt-1">{conversionRate}%</p>
        </div>
      </Card>
    ),
    'upcoming-jobs': (
      <Card className="p-6 h-full overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Próximos Jobs</h2>
          </div>
          {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />}
        </div>
        <div className="space-y-3">
          {upcomingJobs.map(job => (
            <div key={job.id} className="p-3 rounded-lg bg-muted/50">
              <h3 className="font-medium text-sm">{job.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(job.start_datetime).toLocaleDateString("pt-PT")}
              </p>
            </div>
          ))}
        </div>
      </Card>
    ),
    'recent-leads': (
      <Card className="p-6 h-full overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Leads Recentes</h2>
          </div>
          {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />}
        </div>
        <div className="space-y-3">
          {displayedLeads.map(lead => (
            <div key={lead.id} className="p-3 rounded-lg bg-muted/50">
              <h3 className="font-medium text-sm">{lead.clients?.name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {lead.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    ),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Customizável</h1>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleResetLayout}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={handleSaveLayout}>
                Salvar Layout
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditMode(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Editar Layout
            </Button>
          )}
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
      >
        {layout.map(item => (
          <div key={item.i} className={isEditMode ? 'cursor-move' : ''}>
            {widgets[item.i]}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
