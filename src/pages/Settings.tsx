import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, User, Bell, Shield, Mail } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerir preferências e conta</p>
      </div>

      <div className="grid gap-6">
        {/* Perfil */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                defaultValue={user?.user_metadata?.name || ''}
              />
            </div>

            <Button>Guardar Alterações</Button>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notificações</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificações por Email</p>
                <p className="text-sm text-muted-foreground">Receber alertas importantes por email</p>
              </div>
              <Button variant="outline">Ativar</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Lembretes de Jobs</p>
                <p className="text-sm text-muted-foreground">Alertas antes dos trabalhos agendados</p>
              </div>
              <Button variant="outline">Ativar</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Novos Leads</p>
                <p className="text-sm text-muted-foreground">Notificação quando receber novos leads</p>
              </div>
              <Button variant="outline">Ativar</Button>
            </div>
          </div>
        </Card>

        {/* Segurança */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Segurança</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alterar Password</p>
                <p className="text-sm text-muted-foreground">Atualizar a sua senha de acesso</p>
              </div>
              <Button variant="outline">Alterar</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Adicionar camada extra de segurança</p>
              </div>
              <Button variant="outline">Configurar</Button>
            </div>
          </div>
        </Card>

        {/* Preferências */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Preferências</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Moeda Padrão</Label>
              <Input
                id="currency"
                type="text"
                value="EUR (€)"
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Input
                id="timezone"
                type="text"
                value="Europe/Lisbon"
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
