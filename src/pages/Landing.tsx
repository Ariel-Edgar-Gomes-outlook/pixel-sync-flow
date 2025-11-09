import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";
import dashboardImg from "@/assets/dashboard-screenshot.jpg";
import clientsImg from "@/assets/clients-screenshot.jpg";
import calendarImg from "@/assets/calendar-screenshot.jpg";
import galleryImg from "@/assets/gallery-screenshot.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      name: "João Silva",
      role: "Fotógrafo de Casamentos",
      content: "O ArgomFotos transformou completamente a gestão do meu estúdio. Agora consigo acompanhar tudo num único lugar!",
      rating: 5,
    },
    {
      name: "Maria Santos",
      role: "Estúdio Fotográfico",
      content: "As galerias privadas facilitaram muito a entrega das fotos aos clientes. Sistema intuitivo e profissional!",
      rating: 5,
    },
    {
      name: "Pedro Costa",
      role: "Fotógrafo Freelancer",
      content: "Consigo gerir todos os meus projetos e faturas de forma organizada. Valeu cada kwanza investido!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between px-4">
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
          <div className="md:hidden border-t bg-background">
            <div className="container px-4 py-4 flex flex-col gap-4">
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

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container relative px-4">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              🎉 Oferta de Lançamento - Poupa 47.5%
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Gestão Profissional para o Teu Estúdio Fotográfico
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Organiza clientes, jobs, contratos e faturas num único lugar. Concentra-te no que fazes de melhor: fotografar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-xl hover-lift"
                onClick={() => navigate("/auth?signup=true")}
              >
                Experimentar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Funcionalidades
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ✨ Sem cartão de crédito necessário • Configuração em 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Tudo o Que Precisas Num Só Lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades completas pensadas especificamente para fotógrafos profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover-lift">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4">
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
              <div className="space-y-4 order-2 md:order-1">
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
              <div className="order-1 md:order-2">
                <img 
                  src={dashboardImg} 
                  alt="Dashboard do ArgomFotos mostrando gráficos e métricas" 
                  className="rounded-lg shadow-2xl border-2 border-border hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Clients */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src={clientsImg} 
                  alt="Gestão de clientes no ArgomFotos" 
                  className="rounded-lg shadow-2xl border-2 border-border hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-4">
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
              <div className="space-y-4 order-2 md:order-1">
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
              <div className="order-1 md:order-2">
                <img 
                  src={calendarImg} 
                  alt="Calendário de jobs fotográficos" 
                  className="rounded-lg shadow-2xl border-2 border-border hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src={galleryImg} 
                  alt="Galeria privada para entrega de fotos" 
                  className="rounded-lg shadow-2xl border-2 border-border hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-4">
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
      <section id="precos" className="py-20">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Preço Especial de Lançamento
            </h2>
            <p className="text-lg text-muted-foreground">
              Aproveita o desconto especial de lançamento e organiza o teu estúdio profissionalmente!
            </p>
          </div>

          <Card className="max-w-2xl mx-auto border-4 border-primary shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-6 py-2 text-sm font-bold transform rotate-12 translate-x-8 translate-y-4">
              POUPA 47.5%
            </div>
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Plano Profissional</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground line-through text-2xl">12.000 Kz/mês</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl md:text-6xl font-bold text-primary">6.300</span>
                    <span className="text-2xl text-muted-foreground">Kz/mês</span>
                  </div>
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    Oferta por Tempo Limitado
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
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
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full text-lg py-6 shadow-xl"
                onClick={() => navigate("/auth?signup=true")}
              >
                Começar Agora
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Sem compromisso • Cancela quando quiseres
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              O Que Dizem os Nossos Clientes
            </h2>
            <p className="text-lg text-muted-foreground">
              Fotógrafos profissionais que já transformaram os seus negócios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground italic">"{testimonial.content}"</p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Pronto Para Profissionalizar o Teu Estúdio?
            </h2>
            <p className="text-xl text-muted-foreground">
              Junta-te a centenas de fotógrafos que já estão a crescer com o ArgomFotos
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl hover-lift"
              onClick={() => navigate("/auth?signup=true")}
            >
              Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container px-4">
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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
