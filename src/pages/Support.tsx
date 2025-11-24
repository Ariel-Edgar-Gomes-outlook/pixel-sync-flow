import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Support() {
  const handleEmailClick = () => {
    window.location.href = "mailto:geral@argomteck.com";
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+244951720655";
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Suporte Técnico
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Estamos aqui para ajudar! Entre em contato conosco para dúvidas, problemas de pagamento ou sugestões de melhorias.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-sm text-muted-foreground">Envie-nos um email</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-foreground font-medium mb-3">geral@argomteck.com</p>
              <Button 
                onClick={handleEmailClick}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Enviar Email
              </Button>
            </div>
          </div>
        </Card>

        {/* Phone Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Telefone</h3>
                <p className="text-sm text-muted-foreground">Ligue para nós</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-foreground font-medium mb-3">+244 951 720 655</p>
              <Button 
                onClick={handlePhoneClick}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Ligar Agora
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Company Info Card */}
      <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-xl">Argom Teck</h3>
              <p className="text-muted-foreground">Suporte Técnico em Angola</p>
            </div>
          </div>
          
          <div className="grid gap-3 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">geral@argomteck.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">+244 951 720 655</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-medium">Angola</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Help Topics */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-xl">Como Podemos Ajudar?</h3>
          </div>
          
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Problemas de Pagamento</p>
                <p className="text-sm text-muted-foreground">Pagamentos não processados ou erros na cobrança</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Dúvidas Técnicas</p>
                <p className="text-sm text-muted-foreground">Questões sobre funcionalidades e uso do sistema</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sugestões de Melhorias</p>
                <p className="text-sm text-muted-foreground">Ideias para aprimorar o sistema</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Reportar Falhas</p>
                <p className="text-sm text-muted-foreground">Problemas técnicos e bugs do sistema</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>Tempo médio de resposta: 24-48 horas úteis</p>
      </div>
    </div>
  );
}
