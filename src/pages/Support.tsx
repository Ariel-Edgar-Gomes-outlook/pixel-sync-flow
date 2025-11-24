import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, AlertCircle, Sparkles, Headphones, Clock, Shield, CreditCard, HelpCircle, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useImprovementSuggestions } from "@/hooks/useImprovementSuggestions";

const systemAreas = [
  { value: "dashboard", label: "Dashboard / Página Inicial" },
  { value: "clients", label: "Gestão de Clientes" },
  { value: "jobs", label: "Gestão de Trabalhos" },
  { value: "calendar", label: "Agenda / Calendário" },
  { value: "leads", label: "Potenciais Clientes" },
  { value: "quotes", label: "Orçamentos" },
  { value: "invoices", label: "Faturas" },
  { value: "contracts", label: "Contratos" },
  { value: "payments", label: "Financeiro / Pagamentos" },
  { value: "galleries", label: "Galerias de Clientes" },
  { value: "reports", label: "Relatórios" },
  { value: "resources", label: "Recursos / Equipamentos" },
  { value: "team", label: "Gestão de Equipe" },
  { value: "notifications", label: "Notificações" },
  { value: "settings", label: "Configurações" },
  { value: "other", label: "Outra Área" },
];

export default function Support() {
  const { createSuggestion, isCreating } = useImprovementSuggestions();
  const [suggestionForm, setSuggestionForm] = useState({
    system_area: "",
    title: "",
    description: "",
    priority: "medium",
  });

  const handleEmailClick = () => {
    window.location.href = "mailto:geral@argomteck.com";
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+244951720655";
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestionForm.system_area || !suggestionForm.title || !suggestionForm.description) {
      return;
    }

    createSuggestion(suggestionForm);
    
    // Reset form
    setSuggestionForm({
      system_area: "",
      title: "",
      description: "",
      priority: "medium",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-6xl">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <div className="text-center space-y-6 py-12 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
            <div className="relative p-6 bg-gradient-to-br from-primary/90 to-accent/90 rounded-full shadow-2xl">
              <Headphones className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
            Disponível 24/7
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent animate-scale-in">
            Suporte Técnico
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para ajudar! Entre em contato conosco para dúvidas, problemas de pagamento ou sugestões de melhorias.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {/* Email Card */}
        <Card className="group relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl">Email</h3>
                <p className="text-sm text-muted-foreground">Envie-nos um email</p>
              </div>
            </div>
            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-foreground font-mono text-sm break-all">geral@argomteck.com</p>
              </div>
              <Button 
                onClick={handleEmailClick}
                className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Mail className="mr-2 h-5 w-5" />
                Enviar Email
              </Button>
            </div>
          </div>
        </Card>

        {/* Phone Card */}
        <Card className="group relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl">Telefone</h3>
                <p className="text-sm text-muted-foreground">Ligue para nós</p>
              </div>
            </div>
            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-foreground font-mono text-sm">+244 951 720 655</p>
              </div>
              <Button 
                onClick={handlePhoneClick}
                className="w-full bg-gradient-to-r from-accent via-accent/90 to-accent/80 hover:from-accent/90 hover:via-accent/80 hover:to-accent/70 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                Ligar Agora
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Company Info Card */}
      <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-2 border-primary/20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pb-6 border-b border-border/50">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-lg" />
              <div className="relative p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">Argom Teck</h3>
              <p className="text-muted-foreground text-lg">Suporte Técnico em Angola</p>
            </div>
            <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Empresa Verificada
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 border border-border/50 hover:border-primary/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-mono text-sm font-medium truncate">geral@argomteck.com</p>
                </div>
              </div>
            </div>
            <div className="group p-4 rounded-xl bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-all duration-300 border border-border/50 hover:border-accent/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                  <p className="font-mono text-sm font-medium">+244 951 720 655</p>
                </div>
              </div>
            </div>
            <div className="group p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 border border-border/50 hover:border-primary/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Localização</p>
                  <p className="font-medium">Angola</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Help Topics */}
      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="text-center space-y-2">
          <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 mb-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Áreas de Suporte
          </Badge>
          <h3 className="font-bold text-3xl">Como Podemos Ajudar?</h3>
          <p className="text-muted-foreground">Selecione o tipo de assistência que você precisa</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card to-primary/5 hover:from-primary/10 hover:to-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Problemas de Pagamento</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Pagamentos não processados ou erros na cobrança</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card to-accent/5 hover:from-accent/10 hover:to-accent/5 border-2 border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">Dúvidas Técnicas</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Questões sobre funcionalidades e uso do sistema</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card to-primary/5 hover:from-primary/10 hover:to-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Sugestões de Melhorias</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Ideias para aprimorar o sistema</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card to-accent/5 hover:from-accent/10 hover:to-accent/5 border-2 border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">Reportar Falhas</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Problemas técnicos e bugs do sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="text-center space-y-2">
          <Badge className="bg-gradient-to-r from-accent/10 to-primary/10 text-accent border-accent/20 mb-2">
            <HelpCircle className="w-3 h-3 mr-1" />
            Perguntas Frequentes
          </Badge>
          <h3 className="font-bold text-3xl">FAQ</h3>
          <p className="text-muted-foreground">Respostas para as dúvidas mais comuns</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pagamentos e Assinatura */}
          <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-bold text-lg">Pagamentos e Assinatura</h4>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-1" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Como faço para renovar minha assinatura?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Acesse a página de Assinatura no menu lateral e escolha o plano desejado. O pagamento pode ser feito através dos métodos disponíveis na plataforma.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Quais métodos de pagamento são aceitos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Aceitamos transferência bancária, pagamento via referência MB e outros métodos locais. Entre em contato para mais opções específicas para Angola.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  O que acontece se meu pagamento não for processado?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Entre em contato imediatamente através do email ou telefone listados acima. Nossa equipe verificará o status do pagamento e ajudará a resolver qualquer problema.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Funcionalidades do Sistema */}
          <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-bold text-lg">Funcionalidades</h4>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-4" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Como adicionar um novo cliente?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Navegue até a página "Clientes" e clique no botão "Novo Cliente". Preencha as informações necessárias e salve. O cliente estará disponível para associar a trabalhos e orçamentos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Como criar e enviar orçamentos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Acesse "Orçamentos", crie um novo orçamento, adicione os itens e valores. Após finalizar, você pode enviar diretamente para o email do cliente através do sistema.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Posso compartilhar galerias com meus clientes?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Na página de trabalhos, você pode criar galerias protegidas por senha e compartilhar o link com seus clientes. Eles poderão visualizar e selecionar fotos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Conta e Segurança */}
          <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-bold text-lg">Conta e Segurança</h4>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-7" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Como alterar minha senha?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Vá em "Configurações" → "Segurança" e clique em "Alterar Senha". Digite sua senha atual e a nova senha duas vezes para confirmar.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Meus dados estão seguros?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados e os dados de seus clientes estão protegidos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-9" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Posso exportar meus dados?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Na maioria das páginas você encontrará opções de exportação em Excel ou PDF. Entre em contato caso precise de uma exportação completa de todos os dados.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Suporte Técnico */}
          <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <Headphones className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-bold text-lg">Suporte Técnico</h4>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-10" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Qual o horário de atendimento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nosso suporte funciona 24/7. Você pode entrar em contato a qualquer momento por email ou telefone. O tempo médio de resposta é de 24-48 horas úteis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-11" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Como reportar um bug ou problema?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Envie um email para geral@argomteck.com descrevendo o problema em detalhes, incluindo capturas de tela se possível. Nossa equipe investigará e responderá rapidamente.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-12" className="border rounded-lg px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline text-left">
                  Posso sugerir novas funcionalidades?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutamente! Adoramos feedback dos nossos usuários. Entre em contato conosco com suas ideias e sugestões. Muitas funcionalidades foram implementadas baseadas em feedback de clientes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </div>

      {/* Improvement Suggestions Form */}
      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="text-center space-y-2">
          <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 mb-2">
            <Lightbulb className="w-3 h-3 mr-1" />
            Sugestões de Melhorias
          </Badge>
          <h3 className="font-bold text-3xl">Contribua com Ideias</h3>
          <p className="text-muted-foreground">Ajude-nos a melhorar o sistema com suas sugestões</p>
        </div>

        <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-card via-primary/5 to-accent/5 border-2 border-primary/20 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleSuggestionSubmit} className="relative space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* System Area Select */}
              <div className="space-y-2">
                <Label htmlFor="system_area" className="text-base font-semibold">
                  Área do Sistema *
                </Label>
                <Select
                  value={suggestionForm.system_area}
                  onValueChange={(value) =>
                    setSuggestionForm({ ...suggestionForm, system_area: value })
                  }
                  required
                >
                  <SelectTrigger className="h-12 bg-background/50 border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemAreas.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha em qual parte do sistema você sugere melhorias
                </p>
              </div>

              {/* Priority Select */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-base font-semibold">
                  Prioridade
                </Label>
                <Select
                  value={suggestionForm.priority}
                  onValueChange={(value) =>
                    setSuggestionForm({ ...suggestionForm, priority: value })
                  }
                >
                  <SelectTrigger className="h-12 bg-background/50 border-2 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Baixa
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Média
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        Alta
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Crítica
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Quão importante é esta melhoria para você?
                </p>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Título da Sugestão *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Ex: Adicionar filtro avançado de clientes"
                value={suggestionForm.title}
                onChange={(e) =>
                  setSuggestionForm({ ...suggestionForm, title: e.target.value })
                }
                required
                maxLength={200}
                className="h-12 bg-background/50 border-2 hover:border-primary/50 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Resuma sua sugestão em poucas palavras ({suggestionForm.title.length}/200)
              </p>
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Descrição Detalhada *
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva em detalhes qual melhoria você gostaria de ver no sistema e por quê seria útil..."
                value={suggestionForm.description}
                onChange={(e) =>
                  setSuggestionForm({ ...suggestionForm, description: e.target.value })
                }
                required
                rows={6}
                className="bg-background/50 border-2 hover:border-primary/50 focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Explique o problema atual e como sua sugestão pode melhorar o sistema
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSuggestionForm({
                    system_area: "",
                    title: "",
                    description: "",
                    priority: "medium",
                  })
                }
                disabled={isCreating}
                className="min-w-[120px]"
              >
                Limpar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="min-w-[180px] bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Sugestão
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="text-center py-8 space-y-4 animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <p className="text-sm font-medium">Tempo médio de resposta: 24-48 horas úteis</p>
        </div>
        <p className="text-xs text-muted-foreground/80">Nosso time está sempre pronto para ajudar você</p>
      </div>
    </div>
  );
}
