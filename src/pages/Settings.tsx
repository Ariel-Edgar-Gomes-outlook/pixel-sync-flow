import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { Settings as SettingsIcon, User, Bell, Shield, Activity, Moon, Sun, Building2, Globe } from "lucide-react";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { GoogleCalendarIntegration } from "@/components/GoogleCalendarIntegration";
import { NotificationSettings } from "@/components/NotificationSettings";
import { BusinessSettingsForm } from "@/components/BusinessSettingsForm";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const { data: preferences } = useUserPreferences(user?.id);
  const updatePreferences = useUpdateUserPreferences();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [preferencesData, setPreferencesData] = useState({
    currency: "AOA",
    timezone: "Africa/Luanda",
    language: "pt-PT",
  });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  // Update preferences when loaded
  useEffect(() => {
    if (preferences) {
      setPreferencesData({
        currency: preferences.currency || "AOA",
        timezone: preferences.timezone || "Africa/Luanda",
        language: preferences.language || "pt-PT",
      });
    }
  }, [preferences]);

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        name: formData.name,
        phone: formData.phone,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
      console.error(error);
    }
  };

  const handlePreferenceUpdate = async (key: keyof typeof preferencesData, value: string) => {
    if (!user?.id) return;

    setPreferencesData(prev => ({ ...prev, [key]: value }));
    
    try {
      await updatePreferences.mutateAsync({
        userId: user.id,
        [key]: value,
      });
      toast.success("Preferência atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar preferências");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Gerir preferências e conta</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-7 gap-1">
            <TabsTrigger value="profile" className="whitespace-nowrap">Perfil</TabsTrigger>
            <TabsTrigger value="business" className="whitespace-nowrap">Empresa</TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-nowrap">Notificações</TabsTrigger>
            <TabsTrigger value="security" className="whitespace-nowrap">Segurança</TabsTrigger>
            <TabsTrigger value="preferences" className="whitespace-nowrap">Preferências</TabsTrigger>
            <TabsTrigger value="integrations" className="whitespace-nowrap">Integrações</TabsTrigger>
            <TabsTrigger value="audit" className="whitespace-nowrap">Auditoria</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="mt-4 sm:mt-6">
          <div className="grid gap-4 sm:gap-6">
            {/* Perfil */}
            <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <User className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || user?.email || ''}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+244 900 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Button onClick={handleProfileUpdate} disabled={updateProfile.isPending} className="w-full sm:w-auto">
              Guardar Alterações
            </Button>
          </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="mt-4 sm:mt-6">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Configurações Empresariais</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              Configure os dados da sua empresa para emitir faturas e contratos profissionais
            </p>
            <BusinessSettingsForm />
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 sm:mt-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security" className="mt-4 sm:mt-6">
          <div className="grid gap-4 sm:gap-6">
            {/* Segurança */}
            <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Segurança</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">Alterar Password</p>
                <p className="text-sm text-muted-foreground">Atualizar a sua senha de acesso</p>
              </div>
              <Button variant="outline" onClick={() => setPasswordDialogOpen(true)} className="w-full sm:w-auto">Alterar</Button>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Adicionar camada extra de segurança (em breve)</p>
              </div>
              <Button variant="outline" disabled className="w-full sm:w-auto">Configurar</Button>
            </div>
          </div>
            </Card>
          </div>

          <PasswordChangeDialog 
            open={passwordDialogOpen} 
            onOpenChange={setPasswordDialogOpen}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 sm:mt-6">
          <div className="grid gap-4 sm:gap-6">
            {/* Preferências */}
            <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <SettingsIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Preferências</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Modo Escuro</p>
                <p className="text-sm text-muted-foreground">Ativar tema escuro</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? 'dark' : 'light');
                    toast.success(`Tema ${checked ? 'escuro' : 'claro'} ativado`);
                  }}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="currency">Moeda Padrão</Label>
              <Select
                value={preferencesData.currency}
                onValueChange={(value) => handlePreferenceUpdate('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="AOA">AOA - Kwanza Angolano (Kz)</SelectItem>
                  <SelectItem value="USD">USD - Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP - Libra Esterlina (£)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Moeda utilizada em faturas e relatórios</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={preferencesData.timezone}
                onValueChange={(value) => handlePreferenceUpdate('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Africa/Luanda">Africa/Luanda (WAT +01:00)</SelectItem>
                  <SelectItem value="Europe/Lisbon">Europe/Lisbon (WET +00:00)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT +00:00)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST -05:00)</SelectItem>
                  <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (BRT -03:00)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Fuso horário para agendamentos e notificações</p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="language">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Idioma
                </div>
              </Label>
              <Select
                value={preferencesData.language}
                onValueChange={(value) => handlePreferenceUpdate('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Idioma da interface (em breve)</p>
            </div>
          </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 sm:mt-6">
          {user && <GoogleCalendarIntegration userId={user.id} />}
        </TabsContent>

        <TabsContent value="audit" className="mt-4 sm:mt-6">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
