import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, AlertCircle, Sparkles, Headphones, Clock, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Support() {
  const handleEmailClick = () => {
    window.location.href = "mailto:geral@argomteck.com";
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+244951720655";
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

      {/* Footer Note */}
      <div className="text-center py-8 space-y-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <p className="text-sm font-medium">Tempo médio de resposta: 24-48 horas úteis</p>
        </div>
        <p className="text-xs text-muted-foreground/80">Nosso time está sempre pronto para ajudar você</p>
      </div>
    </div>
  );
}
