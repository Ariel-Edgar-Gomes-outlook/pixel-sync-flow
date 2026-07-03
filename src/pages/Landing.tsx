import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Dialog imports removed - using fullscreen payment view instead
import { useNavigate, Link } from "react-router-dom";
import {
  Camera,
  Users,
  Briefcase,
  DollarSign,
  Image,
  UserCheck,
  Bell,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  Monitor,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import dashboardImg from "@/assets/dashboard-interface.png";
import clientsImg from "@/assets/reports-screenshot.jpg";
import calendarImg from "@/assets/calendar-screenshot.jpg";
import galleryImg from "@/assets/gallery-screenshot.jpg";
import heroStudio from "@/assets/hero-studio.jpg";
import heroPhotographer from "@/assets/hero-photographer.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentUrl, setSelectedPaymentUrl] = useState("");

  const paymentLinks = {
    mensal: "https://pay.kuenha.com/9e7ff119-5bba-49e3-b687-8611f7d5a071",
    trimestral: "https://pay.kuenha.com/f9d43b5b-c7b5-4c9b-805c-5cc2a1021e9a",
    semestral: "https://pay.kuenha.com/c91201b9-fca7-4129-aebb-fdae6a754fc7",
    anual: "https://pay.kuenha.com/3f8726f4-cca9-4e46-b321-49c1eadd821d",
  };

  const openPaymentModal = (url: string) => {
    if (!user) {
      toast.error("Autenticação necessária", {
        description: "Por favor, faça login ou crie uma conta para continuar com o pagamento.",
      });
      navigate("/auth?signup=true");
      return;
    }
    setSelectedPaymentUrl(url);
    setPaymentModalOpen(true);
  };

  const handleIframeError = () => {
    // Fallback: open in new tab if iframe fails
    window.open(selectedPaymentUrl, "_blank");
    setPaymentModalOpen(false);
  };

  const features = [
    {
      icon: Users,
      title: "Gestão de Clientes e Leads",
      description: "Centraliza todos os teus clientes e acompanha leads desde o primeiro contato até ao fecho do negócio.",
    },
    {
      icon: Briefcase,
      title: "Gestão de Jobs/Projetos",
      description: "Organiza todos os teus projetos fotográficos com calendário, checklists e acompanhamento de progresso.",
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro Total",
      description: "Emite faturas profissionais, regista pagamentos e acompanha toda a saúde financeira do teu estúdio.",
    },
    {
      icon: Image,
      title: "Galerias Privadas",
      description: "Entrega as tuas fotos de forma profissional através de galerias protegidas por senha para cada cliente.",
    },
    {
      icon: UserCheck,
      title: "Gestão de Equipa",
      description: "Gere a tua equipa e equipamentos, atribui tarefas e controla a disponibilidade de recursos.",
    },
    {
      icon: Bell,
      title: "Notificações Automáticas",
      description: "Recebe alertas inteligentes sobre pagamentos pendentes, jobs próximos e tarefas importantes.",
    },
  ];

  const testimonials = [
    {
      name: "Tondel Fernandes",
      role: "Designer Gráfico",
      content: "O ArgomFotos transformou completamente a gestão do meu estúdio. Agora consigo acompanhar tudo num único lugar!",
      rating: 5,
    },
    {
      name: "Josué Mendes",
      role: "Fotógrafo Freelancer",
      content: "As galerias privadas facilitaram muito a entrega das fotos aos clientes. Sistema intuitivo e profissional!",
      rating: 5,
    },
    {
      name: "Márcio Andrade",
      role: "Fotógrafo",
      content: "Consigo gerir todos os meus projetos e faturas de forma organizada. Valeu cada kwanza investido!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ArgomFotos</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Início
            </a>
            <a href="#funcionalidades" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#precos" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#depoimentos" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Depoimentos
            </a>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button onClick={() => navigate("/auth?signup=true")} className="shadow-lg">
              Criar Conta
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background w-full overflow-hidden">
            <div className="container px-4 py-4 flex flex-col gap-4 mx-auto max-w-7xl">
              <a href="#inicio" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Início
              </a>
              <a href="#funcionalidades" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Funcionalidades
              </a>
              <a href="#precos" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Preços
              </a>
              <a href="#depoimentos" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Depoimentos
              </a>
              <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">
                Entrar
              </Button>
              <Button onClick={() => navigate("/auth?signup=true")} className="w-full">
                Criar Conta
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Cinematic Split */}
      <section id="inicio" className="relative min-h-[92vh] w-full overflow-hidden bg-[#0a0a0f]">
        {/* Full-bleed background photo */}
        <div className="absolute inset-0">
          <img
            src={heroStudio}
            alt="Estúdio fotográfico profissional com câmara Canon e iluminação cinematográfica"
            className="h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          {/* Gradient overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#05060a] via-[#05060a]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.15),transparent_60%)]" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-2xl">
            {/* Refined pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">
                Lançamento — 47.5% desconto
              </span>
            </div>

            <h1 className="mt-8 text-white text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
              <span className="block font-serif-display italic text-white/95">A tua arte,</span>
              <span className="block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-cyan-200">
                gerida com precisão.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg md:text-xl text-white/70 leading-relaxed font-light">
              O sistema completo para fotógrafos profissionais. Clientes, jobs, contratos,
              galerias e finanças — num único lugar, com o requinte que o teu estúdio merece.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/auth?signup=true")}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-[#0a0a0f] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02]"
                style={{ boxShadow: "0 20px 60px -15px rgba(255,255,255,0.35), 0 0 0 1px rgba(255,255,255,0.1)" }}
              >
                Experimentar Agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/30"
              >
                Descobrir Funcionalidades
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Configuração em 5 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>


      {/* Features Section */}
      <section id="funcionalidades" className="py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container px-4 mx-auto max-w-7xl relative">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-sm px-4 py-2 mb-4">
              💎 Funcionalidades Premium
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Tudo o Que Precisas <span className="text-gradient">Num Só Lugar</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades completas pensadas especificamente para fotógrafos profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="stagger-fade-in border-2 hover:border-primary/50 transition-all duration-500 hover-lift hover-scale gradient-border group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Monitor className="h-4 w-4 mr-2 inline" />
              Vê o Sistema em Ação
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Interface Moderna e Intuitiva
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sistema completo pensado para facilitar o dia-a-dia dos fotógrafos profissionais
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Dashboard */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 order-2 md:order-1 stagger-fade-in">
                <Badge variant="outline" className="text-sm">Dashboard</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Visão Geral do Teu Negócio
                </h3>
                <p className="text-muted-foreground text-lg">
                  Acompanha receitas, jobs agendados e métricas importantes num dashboard completo e visual.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Gráficos de receita em tempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Calendário de jobs próximos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Alertas de pagamentos pendentes</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 stagger-fade-in">
                {/* Laptop Mockup */}
                <div className="relative">
                  {/* Laptop Frame */}
                  <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-xl p-2 shadow-2xl">
                    {/* Top bar with camera */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-slate-950 rounded-b-lg"></div>
                    
                    {/* Screen */}
                    <div className="bg-background rounded-lg overflow-hidden border border-border/50">
                      <img 
                        src={dashboardImg} 
                        alt="Dashboard do ArgomFotos mostrando gráficos e métricas" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  {/* Laptop Base */}
                  <div className="relative h-2 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl shadow-lg">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                  </div>
                  
                  {/* Keyboard base */}
                  <div className="relative -mt-1 mx-auto w-[95%] h-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-b-2xl shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-b-2xl"></div>
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl opacity-50 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Clients */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="stagger-fade-in">
                <img 
                  src={clientsImg} 
                  alt="Gestão de clientes no ArgomFotos" 
                  className="rounded-lg shadow-2xl border-2 border-border hover-scale"
                />
              </div>
              <div className="space-y-4 stagger-fade-in">
                <Badge variant="outline" className="text-sm">Clientes</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Gestão Completa de Clientes
                </h3>
                <p className="text-muted-foreground text-lg">
                  Organiza todos os teus clientes e leads com histórico completo de interações e projetos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Perfil detalhado de cada cliente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Histórico de projetos e pagamentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Acompanhamento de leads</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Calendar */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 order-2 md:order-1 stagger-fade-in">
                <Badge variant="outline" className="text-sm">Calendário</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Agenda Todos os Teus Jobs
                </h3>
                <p className="text-muted-foreground text-lg">
                  Calendário visual para agendar sessões fotográficas, casamentos e eventos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Vista mensal, semanal e diária</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Sincronização com equipa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Lembretes automáticos</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 stagger-fade-in">
                <img 
                  src={calendarImg} 
                  alt="Calendário de jobs fotográficos" 
                  className="rounded-lg shadow-2xl border-2 border-border hover-scale"
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="stagger-fade-in">
                <img 
                  src={galleryImg} 
                  alt="Galeria privada para entrega de fotos" 
                  className="rounded-lg shadow-2xl border-2 border-border hover-scale"
                />
              </div>
              <div className="space-y-4 stagger-fade-in">
                <Badge variant="outline" className="text-sm">Galerias</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Entrega Profissional de Fotos
                </h3>
                <p className="text-muted-foreground text-lg">
                  Cria galerias privadas protegidas por senha para cada cliente descarregar as suas fotos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Proteção por senha personalizada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Download individual ou em lote</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Interface elegante e responsiva</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-5" />
        
        <div className="container px-4 mx-auto max-w-7xl relative">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-sm px-4 py-2 mb-4 shimmer">
              💰 Oferta Limitada
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Preço <span className="text-gradient">Especial de Lançamento</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Aproveita o desconto especial de lançamento e organiza o teu estúdio profissionalmente!
            </p>
          </div>

          <Card className="max-w-4xl mx-auto border-4 border-primary shadow-2xl relative overflow-hidden pulse-glow hover-scale">
            <div className="absolute inset-0 gradient-animate opacity-5" />
            <div className="absolute top-0 right-0 bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground px-6 py-2 text-sm font-bold transform rotate-12 translate-x-8 translate-y-4 shimmer z-10">
              POUPA 47.5%
            </div>
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Plano Profissional</h3>
              </div>

              {/* Pricing Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Mensal */}
                <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all bg-card/50">
                  <div className="text-center space-y-3">
                    <Badge variant="secondary" className="mb-2">Mensal</Badge>
                    <p className="text-muted-foreground line-through text-lg">12.000 Kz/mês</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">6.300</span>
                      <span className="text-lg text-muted-foreground">Kz/mês</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full relative z-20 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPaymentModal(paymentLinks.mensal);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar Agora
                    </Button>
                  </div>
                </div>

                {/* Trimestral */}
                <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all bg-card/50">
                  <div className="text-center space-y-3">
                    <Badge variant="secondary" className="mb-2">Trimestral</Badge>
                    <p className="text-muted-foreground line-through text-lg">36.000 Kz</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">18.900</span>
                      <span className="text-lg text-muted-foreground">Kz</span>
                    </div>
                    <p className="text-xs text-muted-foreground">6.300 Kz/mês</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full relative z-20 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPaymentModal(paymentLinks.trimestral);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar Agora
                    </Button>
                  </div>
                </div>

                {/* Semestral */}
                <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all bg-card/50">
                  <div className="text-center space-y-3">
                    <Badge variant="secondary" className="mb-2">Semestral</Badge>
                    <p className="text-muted-foreground line-through text-lg">72.000 Kz</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">37.800</span>
                      <span className="text-lg text-muted-foreground">Kz</span>
                    </div>
                    <p className="text-xs text-muted-foreground">6.300 Kz/mês</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full relative z-20 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPaymentModal(paymentLinks.semestral);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar Agora
                    </Button>
                  </div>
                </div>

                {/* Anual */}
                <div className="border-2 border-primary rounded-lg p-6 shadow-lg bg-primary/5 relative pt-10">
                  <Badge className="absolute top-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap" variant="default">
                    Mais Popular
                  </Badge>
                  <div className="text-center space-y-3">
                    <Badge variant="secondary" className="mb-2">Anual</Badge>
                    <p className="text-muted-foreground line-through text-lg">144.000 Kz</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">75.600</span>
                      <span className="text-lg text-muted-foreground">Kz</span>
                    </div>
                    <p className="text-xs text-muted-foreground">6.300 Kz/mês</p>
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-4 w-full relative z-20 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPaymentModal(paymentLinks.anual);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar Agora
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-center text-sm text-muted-foreground mb-4 font-semibold">
                  Todos os planos incluem:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Clientes e leads ilimitados",
                    "Jobs e projetos sem limites",
                    "Faturas e orçamentos profissionais",
                    "Galerias privadas para clientes",
                    "Gestão de equipa e equipamentos",
                    "Contratos com assinatura digital",
                    "Notificações automáticas",
                    "Relatórios financeiros completos",
                    "Suporte por email",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-lg py-6 shadow-xl pulse-glow gradient-primary border-0 hover-scale"
                onClick={() => navigate("/auth?signup=true")}
              >
                Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Sem compromisso • Cancela quando quiseres
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
        
        <div className="container px-4 mx-auto max-w-7xl relative">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-sm px-4 py-2 mb-4">
              ⭐ Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              O Que Dizem os <span className="text-gradient">Nossos Clientes</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Fotógrafos profissionais que já transformaram os seus negócios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="stagger-fade-in border-2 hover:border-primary/50 transition-all duration-500 hover-lift hover-scale group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="text-foreground italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-sm px-4 py-2 mb-4">
              ❓ Perguntas Frequentes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Dúvidas <span className="text-gradient">Sobre o ArgomFotos?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontra respostas para as questões mais comuns dos nossos utilizadores
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  O que está incluído no plano profissional?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  O plano profissional inclui acesso ilimitado a todas as funcionalidades: gestão de clientes e leads sem limites, 
                  agendamento de jobs e projetos, emissão de faturas e orçamentos profissionais, galerias privadas para entrega 
                  de fotos, gestão de equipa e equipamentos, contratos com assinatura digital, notificações automáticas, 
                  relatórios financeiros completos e suporte por email.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Existe período de teste gratuito?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Podes experimentar o ArgomFotos gratuitamente sem necessidade de cartão de crédito. 
                  Terás acesso completo a todas as funcionalidades para testares e veres como o sistema pode transformar 
                  a gestão do teu estúdio fotográfico.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Posso cancelar a qualquer momento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim, podes cancelar a tua subscrição a qualquer momento sem custos adicionais ou períodos de fidelização. 
                  O ArgomFotos funciona com pagamento mensal flexível e sem compromissos de longo prazo.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Como funcionam as galerias privadas?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Crias uma galeria para cada cliente/projeto e defines uma senha personalizada. O cliente acede através 
                  de um link único e pode visualizar, selecionar e descarregar as suas fotos de forma segura. 
                  A interface é elegante, responsiva e profissional, oferecendo uma excelente experiência de entrega.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  O sistema funciona em dispositivos móveis?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! O ArgomFotos é totalmente responsivo e funciona perfeitamente em smartphones, tablets e computadores. 
                  Podes gerir o teu estúdio de qualquer lugar, seja no escritório, em sessões fotográficas ou em movimento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Quanto tempo demora para configurar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  A configuração inicial é super rápida! Em cerca de 5 minutos consegues criar a tua conta, 
                  adicionar as informações básicas do teu estúdio e começar a usar o sistema. O interface intuitivo 
                  e o sistema de onboarding guiam-te pelos primeiros passos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Por quanto tempo é válida a oferta de lançamento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  A oferta especial de lançamento com 47,5% de desconto (6.300 Kz/mês ao invés de 12.000 Kz/mês) 
                  é por tempo limitado. Recomendamos que aproveites o preço promocional o quanto antes, 
                  pois voltará ao valor normal após o período de lançamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-10" />
        <div className="absolute top-10 left-10 w-64 h-64 md:w-80 md:h-80 bg-primary/20 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-10 right-10 w-64 h-64 md:w-80 md:h-80 bg-accent/20 rounded-full blur-3xl float-animation" style={{ animationDelay: "2s" }} />
        
        <div className="container px-4 mx-auto max-w-7xl relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2 shimmer pulse-glow mb-4">
              🚀 Começa Hoje
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Pronto Para <span className="text-gradient">Profissionalizar</span> o Teu Estúdio?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Junta-te a centenas de fotógrafos que já estão a crescer com o ArgomFotos
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl hover-lift pulse-glow gradient-primary border-0 hover-scale"
              onClick={() => navigate("/auth?signup=true")}
            >
              Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              ✨ Sem cartão de crédito • Sem compromissos • Começa em 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12 overflow-hidden">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Camera className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">ArgomFotos</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema completo de gestão para fotógrafos profissionais
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#precos" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 ArgomFotos. Todos os direitos reservados.</p>
            <Link to="/admin/subscribers" className="inline-block mt-2 text-xs text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Fullscreen Payment View */}
      {paymentModalOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setPaymentModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[85vh] bg-background rounded-lg shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold">Finalizar Pagamento</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPaymentModalOpen(false)}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Iframe Container */}
            <div className="flex-1 overflow-auto">
              <iframe
                src={selectedPaymentUrl}
                className="w-full h-full border-0 min-h-[600px]"
                title="Pagamento Kuenha"
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Landing;
