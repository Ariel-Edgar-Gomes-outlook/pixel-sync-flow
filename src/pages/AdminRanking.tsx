import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, DollarSign, Briefcase, Users, Crown, Medal, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrency } from "@/hooks/useCurrency";

interface RankingData {
  user_id: string;
  name: string;
  email: string;
  clients_count: number;
  jobs_count: number;
  total_revenue: number;
}

export default function AdminRanking() {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os perfis
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email');

      if (!profiles) {
        setIsLoading(false);
        return;
      }

      // Para cada perfil, buscar estatísticas
      const rankingPromises = profiles.map(async (profile) => {
        // Contar clientes
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', profile.user_id);

        // Contar trabalhos
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', profile.user_id);

        // Calcular receita total (pagamentos pagos)
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('created_by', profile.user_id)
          .eq('status', 'paid');

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        return {
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          clients_count: clientsCount || 0,
          jobs_count: jobsCount || 0,
          total_revenue: totalRevenue,
        };
      });

      const rankingsData = await Promise.all(rankingPromises);
      setRankings(rankingsData);
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
  };

  const getRankBadgeVariant = (position: number) => {
    if (position === 1) return "default";
    if (position === 2) return "secondary";
    if (position === 3) return "outline";
    return "outline";
  };

  // Ordenar por clientes
  const clientsRanking = [...rankings].sort((a, b) => b.clients_count - a.clients_count);

  // Ordenar por trabalhos
  const jobsRanking = [...rankings].sort((a, b) => b.jobs_count - a.jobs_count);

  // Ordenar por receita
  const revenueRanking = [...rankings].sort((a, b) => b.total_revenue - a.total_revenue);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ranking de Assinantes
            </h1>
            <p className="text-white/90 mt-1">
              Os usuários mais ativos por clientes, trabalhos e receita
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ranking por Clientes */}
        <Card className="glass hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Mais Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientsRanking.slice(0, 10).map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-card to-card/50 border border-border/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant={getRankBadgeVariant(index + 1)} className="shrink-0">
                    {user.clients_count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking por Trabalhos */}
        <Card className="glass hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Mais Trabalhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobsRanking.slice(0, 10).map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-card to-card/50 border border-border/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant={getRankBadgeVariant(index + 1)} className="shrink-0">
                    {user.jobs_count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking por Receita */}
        <Card className="glass hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Maior Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueRanking.slice(0, 10).map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-card to-card/50 border border-border/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant={getRankBadgeVariant(index + 1)} className="shrink-0">
                    {formatCurrency(user.total_revenue)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Destaques Gerais */}
      <Card className="glass hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Destaques Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Cliente */}
            {clientsRanking[0] && (
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-2 border-yellow-500/20">
                <Crown className="h-12 w-12 text-yellow-500 mb-3" />
                <h3 className="text-lg font-bold text-center mb-1">Rei dos Clientes</h3>
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="text-lg">
                    {clientsRanking[0].name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-center">{clientsRanking[0].name}</p>
                <p className="text-2xl font-bold text-primary mt-2">{clientsRanking[0].clients_count} clientes</p>
              </div>
            )}

            {/* Top Trabalhos */}
            {jobsRanking[0] && (
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20">
                <Briefcase className="h-12 w-12 text-blue-500 mb-3" />
                <h3 className="text-lg font-bold text-center mb-1">Mais Produtivo</h3>
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="text-lg">
                    {jobsRanking[0].name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-center">{jobsRanking[0].name}</p>
                <p className="text-2xl font-bold text-primary mt-2">{jobsRanking[0].jobs_count} trabalhos</p>
              </div>
            )}

            {/* Top Receita */}
            {revenueRanking[0] && (
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20">
                <DollarSign className="h-12 w-12 text-green-500 mb-3" />
                <h3 className="text-lg font-bold text-center mb-1">Maior Faturamento</h3>
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="text-lg">
                    {revenueRanking[0].name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-center">{revenueRanking[0].name}</p>
                <p className="text-2xl font-bold text-primary mt-2">{formatCurrency(revenueRanking[0].total_revenue)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
