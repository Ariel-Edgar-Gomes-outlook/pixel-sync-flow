import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Sparkles, 
  Play, 
  TrendingUp, 
  AlertCircle,
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  TrendingUpIcon,
  FileText,
  Receipt,
  FileSignature,
  Wallet,
  ImageIcon,
  BarChart3,
  Wrench,
  UsersRound,
  Layout,
  Bell,
  Settings,
  CreditCard,
  HelpCircle
} from "lucide-react";

const Documentation = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Documentação ArgomFotos</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Guia completo para utilização do sistema de gestão para fotógrafos profissionais
        </p>
      </div>

      <Tabs defaultValue="intro" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-muted/50 p-2">
          <TabsTrigger value="intro" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Introdução</span>
          </TabsTrigger>
          <TabsTrigger value="purpose" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Objetivo</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Funcionalidades</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Como Usar</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Fluxo</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Benefícios</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Observações</span>
          </TabsTrigger>
        </TabsList>

        {/* Introdução */}
        <TabsContent value="intro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Introdução ao Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-lg">
                <strong>ArgomFotos</strong> é uma plataforma de gestão empresarial completa desenvolvida especialmente para 
                fotógrafos profissionais e estúdios fotográficos em Angola e países lusófonos. O sistema centraliza todas 
                as operações de um negócio fotográfico numa única interface moderna, intuitiva e profissional.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 not-prose">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Desenvolvido por</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">Argom Teck</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Moeda Padrão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">Kwanza Angolano (AOA)</p>
                    <p className="text-xs text-muted-foreground mt-1">+ 20 moedas internacionais</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Idioma Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">Português</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Para Que Serve */}
        <TabsContent value="purpose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Para Que Serve
              </CardTitle>
              <CardDescription>
                O ArgomFotos foi criado para resolver os principais desafios enfrentados por fotógrafos profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Centralização de informações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Todos os dados de clientes, projetos e finanças num só lugar
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Profissionalização de processos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Orçamentos, contratos e faturas com aparência profissional
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Controle financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acompanhamento de receitas, pagamentos e relatórios detalhados
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Gestão de tempo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Agenda integrada com deteção de conflitos de recursos e equipa
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Relacionamento com clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Galerias privadas para entrega de fotos profissional
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Proteção legal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Contratos com assinatura digital
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Principais Funcionalidades */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Principais Funcionalidades
              </CardTitle>
              <CardDescription>
                Explore todos os módulos disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dashboard">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Dashboard (Painel Principal)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Visão geral do negócio em tempo real</li>
                      <li>✓ Estatísticas: Receita Total, Jobs Ativos, Novos Clientes, Taxa de Conversão</li>
                      <li>✓ Gráficos de receita e status de projetos</li>
                      <li>✓ Alertas inteligentes de pagamentos pendentes e ações necessárias</li>
                      <li>✓ Widget de galerias ativas</li>
                      <li>✓ Painel de notificações inteligentes</li>
                      <li>✓ Dashboard personalizável com widgets reorganizáveis</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="clients">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Gestão de Clientes</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Cadastro de clientes individuais e empresas</li>
                      <li>✓ Informações de contacto: email, telefone, endereço</li>
                      <li>✓ Sistema de tags (VIP, Casamento, Corporativo, etc.)</li>
                      <li>✓ Histórico completo de projetos e pagamentos</li>
                      <li>✓ Links externos para pastas de arquivos</li>
                      <li>✓ Pesquisa e filtros avançados</li>
                      <li>✓ Exportação para Excel</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="jobs">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Gestão de Trabalhos (Jobs)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Criação de projetos fotográficos (casamentos, eventos, ensaios, produtos)</li>
                      <li>✓ Status: Agendado, Confirmado, Em Produção, Entrega Pendente, Concluído, Cancelado</li>
                      <li>✓ Vinculação a clientes</li>
                      <li>✓ Estimativa de receita e custos</li>
                      <li>✓ Localização e descrição detalhada</li>
                      <li>✓ Assistente Rápido para criação guiada</li>
                      <li>✓ Atribuição de equipa e recursos</li>
                      <li>✓ Checklists de tarefas</li>
                      <li>✓ Galeria de entregas integrada</li>
                      <li>✓ Planos de pagamento</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="calendar">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Agenda (Calendário)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Visualização mensal, semanal e diária</li>
                      <li>✓ Filtros por status e tipo de trabalho</li>
                      <li>✓ Deteção automática de conflitos de recursos</li>
                      <li>✓ Deteção de conflitos de membros da equipa</li>
                      <li>✓ Criação rápida de jobs ao clicar na data</li>
                      <li>✓ Detalhes do evento em modal compacto</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="leads">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <TrendingUpIcon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Potenciais Clientes (Leads)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Pipeline visual estilo Kanban</li>
                      <li>✓ Status: Novo → Contactado → Proposta Enviada → Ganho/Perdido</li>
                      <li>✓ Registo de fonte (Instagram, WhatsApp, Indicação, Site)</li>
                      <li>✓ Probabilidade de conversão (0-100%)</li>
                      <li>✓ Conversão automática para cliente/job</li>
                      <li>✓ Taxa de conversão calculada automaticamente</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="quotes">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Orçamentos (Quotes)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Criação de propostas detalhadas com itens</li>
                      <li>✓ Cálculo automático de subtotal, IVA e descontos</li>
                      <li>✓ Status: Rascunho, Enviado, Aceite, Rejeitado</li>
                      <li>✓ Geração de PDF profissional</li>
                      <li>✓ Link público para revisão pelo cliente</li>
                      <li>✓ Conversão automática em Job quando aceite</li>
                      <li>✓ Geração automática de fatura</li>
                      <li>✓ Planos de pagamento parcelados</li>
                      <li>✓ Sugestão inteligente de moeda por cliente</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="invoices">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Faturas (Invoices)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Numeração automática configurável (prefixo + número)</li>
                      <li>✓ Vinculação a clientes e jobs</li>
                      <li>✓ Status: Emitida, Paga, Vencida, Parcial, Cancelada</li>
                      <li>✓ Cálculo de IVA e descontos</li>
                      <li>✓ Geração de PDF profissional</li>
                      <li>✓ Estatísticas: Total Faturado, Pendente, Vencido, Pago</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contracts">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <FileSignature className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Contratos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Templates profissionais pré-configurados</li>
                      <li>✓ Assinatura Digital com canvas</li>
                      <li>✓ Link único e seguro (token de 64 caracteres)</li>
                      <li>✓ Registo automático de data/hora da assinatura</li>
                      <li>✓ Cláusulas incluídas: Direitos de Uso, Cancelamento, Remarcação, Entrega, etc.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payments">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Financeiro (Pagamentos)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Registo de pagamentos recebidos</li>
                      <li>✓ Status: Pendente, Pago, Parcial, Reembolsado</li>
                      <li>✓ Múltiplos métodos: Dinheiro, Transferência, Cartão, Multicaixa, etc.</li>
                      <li>✓ Vinculação a faturas e orçamentos</li>
                      <li>✓ Alertas de pagamentos vencidos</li>
                      <li>✓ Geração de recibos em PDF</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="galleries">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Galerias de Cliente</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Galerias privadas por job</li>
                      <li>✓ Proteção por senha (opcional)</li>
                      <li>✓ Data de expiração configurável</li>
                      <li>✓ Limite de downloads por foto</li>
                      <li>✓ Seleção de favoritas pelo cliente</li>
                      <li>✓ Token único de 64 caracteres para acesso seguro</li>
                      <li>✓ Portal público bonito e profissional</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="reports">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Relatórios</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Receita Total, Pendente e Ticket Médio</li>
                      <li>✓ Clientes Ativos e Taxa de Conversão</li>
                      <li>✓ Gráfico de Evolução da Receita (mensal)</li>
                      <li>✓ Gráfico de Receita por Tipo de Job</li>
                      <li>✓ Funil de Conversão</li>
                      <li>✓ Top 10 Clientes por receita</li>
                      <li>✓ Exportação completa para Excel</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="resources">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Recursos & Equipamentos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Inventário de câmeras, lentes, iluminação</li>
                      <li>✓ Status: Disponível, Em Uso, Manutenção, Indisponível</li>
                      <li>✓ Localização física dos equipamentos</li>
                      <li>✓ Calendário de reservas</li>
                      <li>✓ Programação de manutenções</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="team">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <UsersRound className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Gestão de Equipa</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Cadastro de fotógrafos, assistentes, editores</li>
                      <li>✓ Tipos variados: Cinegrafista, Maquiador(a), Operador de Drone</li>
                      <li>✓ Estatísticas individuais de projetos e horas</li>
                      <li>✓ Arquivamento de membros inativos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="templates">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Layout className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Modelos (Templates)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Templates de Orçamentos com itens pré-definidos</li>
                      <li>✓ Templates de Checklists para tipos de trabalho</li>
                      <li>✓ Templates de Contratos com cláusulas padrão</li>
                      <li>✓ Reutilização para agilizar processos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="notifications">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Notificações</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Notificações em tempo real no sistema</li>
                      <li>✓ Alertas de pagamentos pendentes e vencidos</li>
                      <li>✓ Lembretes de jobs próximos</li>
                      <li>✓ Contratos aguardando assinatura</li>
                      <li>✓ Notificações push no navegador (configurável)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="settings">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Configurações</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Perfil: Nome, telefone</li>
                      <li>✓ Empresa: Dados empresariais para faturas</li>
                      <li>✓ Notificações: Preferências de alertas</li>
                      <li>✓ Segurança: Alteração de password</li>
                      <li>✓ Preferências: Moeda, fuso horário, idioma, tema</li>
                      <li>✓ Suporte a 23 moedas + moedas personalizadas</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="subscription">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Assinatura</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Planos: Mensal, Trimestral, Semestral, Anual</li>
                      <li>✓ Integração de pagamento</li>
                      <li>✓ Banner informativo de subscrição</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="support">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Suporte</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-8">
                    <ul className="space-y-2 text-sm">
                      <li>✓ Contacto direto: Email e Telefone</li>
                      <li>✓ FAQ com perguntas frequentes</li>
                      <li>✓ Formulário de sugestões de melhorias</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Como Usar */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Como Usar Cada Parte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fluxo Básico de Trabalho</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { step: 1, title: "Cadastrar Lead", desc: "Registe potenciais clientes com fonte e notas" },
                    { step: 2, title: "Enviar Orçamento", desc: "Crie proposta detalhada e envie link para cliente" },
                    { step: 3, title: "Cliente Aceita", desc: "Converta automaticamente em Job" },
                    { step: 4, title: "Criar Contrato", desc: "Aplique template e envie para assinatura digital" },
                    { step: 5, title: "Realizar Trabalho", desc: "Acompanhe status e atualize progresso" },
                    { step: 6, title: "Criar Galeria", desc: "Faça upload das fotos e partilhe link com cliente" },
                    { step: 7, title: "Gerar Fatura", desc: "Emita fatura profissional" },
                    { step: 8, title: "Registar Pagamento", desc: "Marque como pago e gere recibo" },
                    { step: 9, title: "Analisar Resultados", desc: "Consulte relatórios financeiros" }
                  ].map((item) => (
                    <Card key={item.step} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="default" className="shrink-0">{item.step}</Badge>
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Para Criar um Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Aceda a <strong>Clientes</strong> no menu</li>
                      <li>Clique em <strong>"Novo Cliente"</strong></li>
                      <li>Preencha nome, email, telefone</li>
                      <li>Selecione tipo (Individual ou Empresa)</li>
                      <li>Adicione tags e clique em <strong>"Criar"</strong></li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Para Criar um Trabalho</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Aceda a <strong>Trabalhos</strong> no menu</li>
                      <li>Use o <strong>"Assistente Rápido"</strong> ou <strong>"Manual"</strong></li>
                      <li>Selecione cliente, defina título e tipo</li>
                      <li>Configure data, hora e local</li>
                      <li>Adicione estimativas de receita</li>
                      <li>Clique em <strong>"Criar Trabalho"</strong></li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Para Enviar Orçamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Aceda a <strong>Orçamentos</strong> no menu</li>
                      <li>Clique em <strong>"Novo Orçamento"</strong></li>
                      <li>Selecione cliente e adicione itens</li>
                      <li>Configure impostos e descontos</li>
                      <li>Salve e copie o link de revisão</li>
                      <li>Envie ao cliente por email/WhatsApp</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Para Criar Galeria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Abra um Job existente</li>
                      <li>Vá à aba <strong>"Galeria"</strong></li>
                      <li>Clique em <strong>"Nova Galeria"</strong></li>
                      <li>Configure nome, senha (opcional), limites</li>
                      <li>Faça upload das fotos</li>
                      <li>Copie e envie o link ao cliente</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluxo */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Fluxo Geral de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <p className="text-center text-lg font-mono">
                  Lead → Orçamento → Job → Contrato → Produção → Galeria → Fatura → Pagamento → Relatório
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { icon: TrendingUpIcon, label: "Lead", color: "text-purple-500" },
                  { icon: FileText, label: "Orçamento", color: "text-blue-500" },
                  { icon: Briefcase, label: "Job", color: "text-green-500" },
                  { icon: FileSignature, label: "Contrato", color: "text-orange-500" },
                  { icon: ImageIcon, label: "Galeria", color: "text-pink-500" },
                  { icon: Receipt, label: "Fatura", color: "text-yellow-500" },
                  { icon: Wallet, label: "Pagamento", color: "text-emerald-500" },
                  { icon: BarChart3, label: "Relatório", color: "text-indigo-500" }
                ].map((item, idx) => (
                  <Card key={idx} className="text-center">
                    <CardContent className="p-4">
                      <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                      <p className="text-sm font-semibold">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefícios */}
        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Benefícios para o Utilizador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Centralização Total", desc: "Tudo num só lugar, sem planilhas espalhadas" },
                  { title: "Profissionalismo", desc: "Documentos com aparência premium" },
                  { title: "Automação", desc: "Conversões automáticas e sugestões inteligentes" },
                  { title: "Proteção Legal", desc: "Contratos com assinatura digital válida" },
                  { title: "Entrega Profissional", desc: "Galerias seguras e bonitas para clientes" },
                  { title: "Controle Financeiro", desc: "Visão clara de receitas e pendências" },
                  { title: "Economia de Tempo", desc: "Templates e fluxos automatizados" },
                  { title: "Análise de Desempenho", desc: "Relatórios detalhados do negócio" },
                  { title: "Mobilidade", desc: "Interface responsiva para qualquer dispositivo" },
                  { title: "Suporte Local", desc: "Empresa angolana com suporte em português" }
                ].map((benefit, idx) => (
                  <Card key={idx} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {benefit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observações */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Observações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-amber-500 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Moeda Padrão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    O sistema usa <strong>Kwanza (AOA)</strong> por padrão, mas suporta 23 moedas internacionais e moedas personalizadas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-500 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Assinaturas Digitais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    As assinaturas de contratos são registadas digitalmente com timestamp, mas para validade legal 
                    completa em Angola, consulte um advogado.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-500 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Backups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Recomenda-se exportar regularmente os dados via funcionalidade de exportação Excel.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-500 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Senhas de Galeria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    As galerias protegidas por senha usam comparação simples. Para alta segurança, use tokens únicos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-500 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" />
                    Suporte Técnico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Em caso de problemas, contacte <strong>Argom Teck</strong>:</p>
                  <ul className="text-sm space-y-1">
                    <li>📧 Email: <strong>geral@argomteck.com</strong></li>
                    <li>📞 Telefone: <strong>+244 951 720 655</strong></li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-500 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Planos de Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Funcionalidades podem variar conforme o plano contratado.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 border-primary">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">
            ArgomFotos - Gestão Profissional para o Teu Estúdio Fotográfico 📸
          </p>
          <p className="text-sm text-muted-foreground">
            Desenvolvido com ❤️ por Argom Teck
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documentation;
