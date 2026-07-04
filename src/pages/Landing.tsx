import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate, Link } from "react-router-dom";
import {
  Camera,
  Users,
  Briefcase,
  DollarSign,
  Image as ImageIcon,
  UserCheck,
  Bell,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  CreditCard,
  Sparkles,
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
import sectionWorkspace from "@/assets/section-workspace.jpg";
import sectionCta from "@/assets/section-cta.jpg";

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
        description: "Faz login ou cria uma conta para continuar.",
      });
      navigate("/auth?signup=true");
      return;
    }
    setSelectedPaymentUrl(url);
    setPaymentModalOpen(true);
  };

  const features = [
    { icon: Users, title: "Clientes & Leads", description: "Centraliza contactos, histórico e oportunidades num único painel elegante." },
    { icon: Briefcase, title: "Jobs & Projetos", description: "Agenda sessões, casamentos e eventos com checklists e progresso visual." },
    { icon: DollarSign, title: "Financeiro Total", description: "Faturas, orçamentos e pagamentos com relatórios que fazem sentido." },
    { icon: ImageIcon, title: "Galerias Privadas", description: "Entrega fotografias com estilo, protegidas por senha e prontas para descarga." },
    { icon: UserCheck, title: "Equipa & Recursos", description: "Distribui tarefas, gere equipamento e monitoriza disponibilidade em tempo real." },
    { icon: Bell, title: "Notificações Inteligentes", description: "Alertas automáticos para pagamentos, prazos e tarefas críticas." },
  ];

  const showcases = [
    {
      badge: "Dashboard",
      title: "Uma visão que respira o teu negócio.",
      description: "Receitas, agenda e alertas — tudo desenhado para te dar clareza sem ruído.",
      image: dashboardImg,
      bullets: ["Gráficos de receita em tempo real", "Agenda de jobs próximos", "Alertas de pagamentos pendentes"],
    },
    {
      badge: "Clientes",
      title: "Cada cliente. Cada detalhe. Sempre à mão.",
      description: "Perfis ricos, histórico completo e ligações naturais com jobs, faturas e galerias.",
      image: clientsImg,
      bullets: ["Perfil detalhado por cliente", "Histórico de projetos e pagamentos", "Acompanhamento de leads"],
    },
    {
      badge: "Calendário",
      title: "A tua agenda, com o ritmo do estúdio.",
      description: "Vistas mensal, semanal e diária, sincronizadas com a tua equipa.",
      image: calendarImg,
      bullets: ["Vista mensal, semanal e diária", "Sincronização de equipa", "Lembretes automáticos"],
    },
    {
      badge: "Galerias",
      title: "Entrega que vale como a fotografia.",
      description: "Galerias privadas elegantes, com senha, download individual ou em lote.",
      image: galleryImg,
      bullets: ["Proteção por senha personalizada", "Download individual ou em lote", "Interface responsiva e refinada"],
    },
  ];

  const testimonials = [
    { name: "Tondel Fernandes", role: "Designer Gráfico", content: "O ArgomFotos transformou completamente a gestão do meu estúdio. Tudo num único lugar." },
    { name: "Josué Mendes", role: "Fotógrafo Freelancer", content: "As galerias privadas facilitaram muito a entrega. Sistema intuitivo e profissional." },
    { name: "Márcio Andrade", role: "Fotógrafo", content: "Consigo gerir todos os projetos e faturas de forma organizada. Valeu cada kwanza." },
  ];

  const plans: Array<{ key: keyof typeof paymentLinks; label: string; old: string; price: string; suffix: string; note: string | null; popular?: boolean }> = [
    { key: "mensal", label: "Mensal", old: "12.000", price: "6.300", suffix: "Kz/mês", note: null },
    { key: "trimestral", label: "Trimestral", old: "36.000", price: "18.900", suffix: "Kz", note: "6.300 Kz/mês" },
    { key: "semestral", label: "Semestral", old: "72.000", price: "37.800", suffix: "Kz", note: "6.300 Kz/mês" },
    { key: "anual", label: "Anual", old: "144.000", price: "75.600", suffix: "Kz", note: "6.300 Kz/mês", popular: true },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/70 backdrop-blur-xl">
        <nav className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight">ArgomFotos</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              ["#inicio", "Início"],
              ["#funcionalidades", "Funcionalidades"],
              ["#precos", "Preços"],
              ["#depoimentos", "Depoimentos"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </a>
            ))}
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/auth?signup=true")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-[#0a0a0f] hover:bg-white/90 transition-all"
              style={{ boxShadow: "0 10px 30px -10px rgba(255,255,255,0.35)" }}
            >
              Criar Conta
            </button>
          </div>

          <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0f] w-full">
            <div className="container px-4 py-6 flex flex-col gap-4 mx-auto max-w-7xl">
              {[
                ["#inicio", "Início"],
                ["#funcionalidades", "Funcionalidades"],
                ["#precos", "Preços"],
                ["#depoimentos", "Depoimentos"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="text-sm text-white/70" onClick={() => setMobileMenuOpen(false)}>
                  {label}
                </a>
              ))}
              <button onClick={() => navigate("/auth")} className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white">
                Entrar
              </button>
              <button onClick={() => navigate("/auth?signup=true")} className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-[#0a0a0f]">
                Criar Conta
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="inicio" className="relative min-h-[92vh] w-full overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0">
          <img
            src={heroStudio}
            alt="Estúdio fotográfico profissional com câmara Canon e iluminação cinematográfica"
            className="h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05060a] via-[#05060a]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.15),transparent_60%)]" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-2xl">
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
                onClick={() => document.getElementById("funcionalidades")?.scrollIntoView({ behavior: "smooth" })}
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
      </section>

      {/* Features */}
      <section id="funcionalidades" className="relative py-28 md:py-36 bg-[#0a0a0f] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_60%)]" />
        <div className="container relative px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">Funcionalidades</span>
            </div>
            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
              <span className="font-serif-display italic text-white/95">Tudo o que precisas — </span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                num só lugar.
              </span>
            </h2>
            <p className="mt-6 text-lg text-white/60 font-light max-w-xl">
              Pensado ao pormenor para fotógrafos profissionais que valorizam o detalhe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-[#0a0a0f] p-8 md:p-10 transition-all duration-500 hover:bg-white/[0.03]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_70%)]" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-300/30 transition-colors">
                    <f.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium tracking-tight text-white">{f.title}</h3>
                  <p className="mt-3 text-white/60 leading-relaxed font-light">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Screenshots */}
      <section className="relative py-28 md:py-36 bg-[#05060a] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src={sectionWorkspace} alt="" className="h-full w-full object-cover" loading="lazy" width={1920} height={1280} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05060a] via-[#05060a]/70 to-[#05060a]" />
        </div>

        <div className="container relative px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl mb-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">O produto</span>
            </div>
            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
              <span className="font-serif-display italic text-white/95">Interface pensada </span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                ao milímetro.
              </span>
            </h2>
          </div>

          <div className="space-y-32">
            {showcases.map((s, i) => {
              const reverse = i % 2 === 1;
              return (
                <div key={i} className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center`}>
                  <div className={reverse ? "md:order-2" : ""}>
                    <span className="inline-block text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-4">{s.badge}</span>
                    <h3 className="text-3xl md:text-4xl font-serif-display italic text-white/95 leading-tight tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-5 text-lg text-white/60 font-light leading-relaxed">{s.description}</p>
                    <ul className="mt-8 space-y-3">
                      {s.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-3 text-white/75">
                          <CheckCircle className="h-5 w-5 text-cyan-300 mt-0.5 flex-shrink-0" />
                          <span className="font-light">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={reverse ? "md:order-1" : ""}>
                    <div className="relative group">
                      <div className="absolute -inset-6 bg-gradient-to-tr from-cyan-500/10 via-sky-500/5 to-transparent rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-md">
                        <img
                          src={s.image}
                          alt={s.title}
                          loading="lazy"
                          className="rounded-xl w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="relative py-28 md:py-36 bg-[#0a0a0f] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.08),transparent_60%)]" />
        <div className="container relative px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">Oferta de lançamento — 47.5%</span>
            </div>
            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
              <span className="font-serif-display italic text-white/95">Um preço, </span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                todos os recursos.
              </span>
            </h2>
            <p className="mt-6 text-lg text-white/60 font-light">Escolhe o ritmo que faz sentido para o teu estúdio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div
                key={p.key}
                className={`relative rounded-2xl border p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 ${
                  p.popular
                    ? "border-cyan-300/40 bg-gradient-to-b from-cyan-500/10 to-white/[0.02]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0a0a0f]">
                      Mais popular
                    </span>
                  </div>
                )}
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">{p.label}</p>
                <p className="mt-6 text-sm text-white/40 line-through">{p.old} Kz</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-white">{p.price}</span>
                  <span className="text-sm text-white/50">{p.suffix}</span>
                </div>
                {p.note && <p className="mt-1 text-xs text-white/40">{p.note}</p>}

                <button
                  onClick={() => openPaymentModal(paymentLinks[p.key])}
                  className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all ${
                    p.popular
                      ? "bg-white text-[#0a0a0f] hover:bg-white/90"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Assinar
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-6">Todos os planos incluem</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-cyan-300 mt-1 flex-shrink-0" />
                  <span className="text-sm text-white/75 font-light">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="relative py-28 md:py-36 bg-[#05060a] overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={heroPhotographer} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05060a] via-[#05060a]/80 to-[#05060a]" />
        </div>
        <div className="container relative px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
              <Star className="h-3 w-3 text-cyan-300 fill-cyan-300" />
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">Depoimentos</span>
            </div>
            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
              <span className="font-serif-display italic text-white/95">Fotógrafos </span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                que confiam.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-cyan-300 text-cyan-300" />
                  ))}
                </div>
                <p className="font-serif-display italic text-xl text-white/90 leading-relaxed">"{t.content}"</p>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-sm text-white/50 font-light">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-28 md:py-36 bg-[#0a0a0f] overflow-hidden">
        <div className="container relative px-6 mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">Perguntas frequentes</span>
            </div>
            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
              <span className="font-serif-display italic text-white/95">Ainda com </span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">dúvidas?</span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              ["O que está incluído no plano profissional?", "Acesso total: clientes e leads ilimitados, jobs, faturas, galerias privadas, gestão de equipa, contratos com assinatura digital, notificações automáticas, relatórios financeiros e suporte por email."],
              ["Existe período de teste gratuito?", "Sim. Podes experimentar sem cartão de crédito, com acesso completo ao sistema."],
              ["Posso cancelar a qualquer momento?", "Sim. Sem fidelização e sem custos adicionais — cancelas quando quiseres."],
              ["Como funcionam as galerias privadas?", "Cada galeria tem link e senha personalizada. O cliente visualiza, seleciona e descarrega com uma experiência refinada."],
              ["Funciona em telemóveis e tablets?", "Totalmente responsivo — gere o teu estúdio de onde estiveres."],
              ["Quanto tempo demora a configurar?", "Cerca de 5 minutos para começares. O sistema guia-te nos primeiros passos."],
              ["Por quanto tempo é válida a oferta?", "A promoção de lançamento de 47,5% é por tempo limitado — voltará ao valor normal após o período."],
            ].map(([q, a], i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-white/10 rounded-2xl px-6 bg-white/[0.02] backdrop-blur-md data-[state=open]:border-white/20"
              >
                <AccordionTrigger className="text-left text-white hover:no-underline hover:text-cyan-200 py-5">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 font-light leading-relaxed pb-6">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 md:py-44 overflow-hidden bg-[#05060a]">
        <div className="absolute inset-0">
          <img src={sectionCta} alt="" className="h-full w-full object-cover" loading="lazy" width={1920} height={1088} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05060a] via-[#05060a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-[#05060a]/40" />
        </div>

        <div className="container relative px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              <span className="block font-serif-display italic text-white/95">Pronto para</span>
              <span className="block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                elevar o teu estúdio?
              </span>
            </h2>
            <p className="mt-8 text-lg md:text-xl text-white/70 font-light max-w-lg">
              Junta-te aos fotógrafos que já profissionalizaram a gestão do seu trabalho com o ArgomFotos.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/auth?signup=true")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-[#0a0a0f] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02]"
                style={{ boxShadow: "0 20px 60px -15px rgba(255,255,255,0.35), 0 0 0 1px rgba(255,255,255,0.1)" }}
              >
                Criar conta grátis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#precos"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Ver planos
              </a>
            </div>
            <p className="mt-6 text-sm text-white/50">Sem cartão de crédito · Configuração em 5 minutos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-[#05060a] py-16">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-medium tracking-tight text-white">ArgomFotos</span>
              </Link>
              <p className="text-sm text-white/50 font-light leading-relaxed">
                O sistema de gestão feito para fotógrafos que valorizam o detalhe.
              </p>
            </div>

            {[
              ["Produto", [["#funcionalidades", "Funcionalidades"], ["#precos", "Preços"], ["#depoimentos", "Depoimentos"]]],
              ["Empresa", [["#", "Sobre"], ["#", "Contacto"], ["#", "Blog"]]],
              ["Legal", [["#", "Termos"], ["#", "Privacidade"], ["#", "Cookies"]]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">{title as string}</p>
                <ul className="space-y-3 text-sm">
                  {(links as string[][]).map(([href, label]) => (
                    <li key={label}>
                      <a href={href} className="text-white/60 hover:text-white transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© 2026 ArgomFotos. Todos os direitos reservados.</p>
            <Link to="/admin/subscribers" className="text-white/25 hover:text-white/50 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setPaymentModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h2 className="text-lg font-medium text-white">Finalizar Pagamento</h2>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <iframe
                src={selectedPaymentUrl}
                className="w-full h-full border-0 min-h-[600px]"
                title="Pagamento Kuenha"
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
