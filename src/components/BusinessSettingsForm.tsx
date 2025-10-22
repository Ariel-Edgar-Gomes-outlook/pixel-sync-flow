import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import {
  useBusinessSettings,
  useCreateBusinessSettings,
  useUpdateBusinessSettings,
  useUploadBusinessFile,
} from '@/hooks/useBusinessSettings';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, Building2, Mail, Phone, MapPin, CreditCard, Palette, FileSignature, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const businessSettingsSchema = z.object({
  business_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  trade_name: z.string().optional(),
  nif: z.string().regex(/^\d{10}$/, 'NIF deve ter 10 dígitos').optional().or(z.literal('')),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+244\s?\d{9}$/, 'Formato: +244 923456789').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  bank_name: z.string().optional(),
  iban: z.string().regex(/^AO\d{2}\.?\d{4}\.?\d{4}\.?\d{11}\.?\d$/, 'IBAN angolano inválido (ex: AO06.0006.0000.1234.5678.9012.3)').optional().or(z.literal('')),
  account_holder: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  legal_representative_name: z.string().optional(),
  legal_representative_title: z.string().optional(),
  invoice_prefix: z.string().max(5, 'Máximo 5 caracteres').optional(),
  proforma_prefix: z.string().max(5, 'Máximo 5 caracteres').optional(),
  terms_footer: z.string().optional(),
  payment_terms: z.string().optional(),
});

type FormData = z.infer<typeof businessSettingsSchema>;

export function BusinessSettingsForm() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useBusinessSettings(user?.id);
  const createSettings = useCreateBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const uploadFile = useUploadBusinessFile();
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      business_name: '',
      email: user?.email || '',
      city: 'Luanda',
      province: 'Luanda',
      country: 'Angola',
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      invoice_prefix: 'FT',
      proforma_prefix: 'PF',
      terms_footer: 'Este documento é regido pelas leis de Angola.',
      payment_terms: 'Pagamento em 30 dias após emissão.',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        business_name: settings.business_name,
        trade_name: settings.trade_name || '',
        nif: settings.nif || '',
        email: settings.email,
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        website: settings.website || '',
        address_line1: settings.address_line1 || '',
        address_line2: settings.address_line2 || '',
        city: settings.city || 'Luanda',
        province: settings.province || 'Luanda',
        country: settings.country || 'Angola',
        postal_code: settings.postal_code || '',
        bank_name: settings.bank_name || '',
        iban: settings.iban || '',
        account_holder: settings.account_holder || '',
        primary_color: settings.primary_color || '#3B82F6',
        secondary_color: settings.secondary_color || '#1E40AF',
        legal_representative_name: settings.legal_representative_name || '',
        legal_representative_title: settings.legal_representative_title || '',
        invoice_prefix: settings.invoice_prefix || 'FT',
        proforma_prefix: settings.proforma_prefix || 'PF',
        terms_footer: settings.terms_footer || 'Este documento é regido pelas leis de Angola.',
        payment_terms: settings.payment_terms || 'Pagamento em 30 dias após emissão.',
      });
      setLogoPreview(settings.logo_url);
      setSignaturePreview(settings.signature_url);
    }
  }, [settings, form]);

  const handleFileUpload = async (file: File, type: 'logo' | 'signature') => {
    if (!user?.id) return;

    try {
      const url = await uploadFile.mutateAsync({ file, userId: user.id, type });
      
      if (type === 'logo') {
        setLogoPreview(url);
        await handleUpdateSettings({ logo_url: url });
      } else {
        setSignaturePreview(url);
        await handleUpdateSettings({ signature_url: url });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleUpdateSettings = async (updates: Partial<FormData> & { logo_url?: string; signature_url?: string }) => {
    if (!user?.id) return;

    if (settings) {
      await updateSettings.mutateAsync({ userId: user.id, ...updates });
    } else {
      // Type assertion since this is for logo/signature upload only
      await createSettings.mutateAsync({ 
        user_id: user.id,
        business_name: settings?.business_name || 'Empresa',
        email: user.email || '',
        ...updates 
      } as any);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return;
    
    // Ensure required fields are present
    if (!data.business_name || !data.email) {
      toast.error('Nome comercial e email são obrigatórios');
      return;
    }

    if (settings) {
      await updateSettings.mutateAsync({ userId: user.id, ...data });
    } else {
      // Type assertion for create since we've validated required fields
      await createSettings.mutateAsync({ 
        user_id: user.id,
        business_name: data.business_name,
        email: data.email,
        ...data 
      } as any);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados Básicos da Empresa
            </CardTitle>
            <CardDescription>
              Informações fundamentais sobre o seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Comercial *</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva Fotografia Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="trade_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="JoFoto Studio" {...field} />
                  </FormControl>
                  <FormDescription>Nome pelo qual é conhecido no mercado</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF (Número de Identificação Fiscal)</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" maxLength={10} {...field} />
                  </FormControl>
                  <FormDescription>10 dígitos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contactos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contactos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Empresarial *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+244 923456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+244 923456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address_line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (Linha 1)</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua da Missão, 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (Linha 2)</FormLabel>
                  <FormControl>
                    <Input placeholder="Prédio A, 3º andar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Luanda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Província</FormLabel>
                    <FormControl>
                      <Input placeholder="Luanda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="Angola" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Postal</FormLabel>
                  <FormControl>
                    <Input placeholder="000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dados Bancários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Dados Bancários
            </CardTitle>
            <CardDescription>
              Informações para pagamento que aparecerão nas faturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="BAI - Banco Angolano de Investimentos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IBAN</FormLabel>
                  <FormControl>
                    <Input placeholder="AO06.0006.0000.1234.5678.9012.3" {...field} />
                  </FormControl>
                  <FormDescription>Formato angolano: AO + 23 dígitos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_holder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titular da Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva Fotografia Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Identidade Visual
            </CardTitle>
            <CardDescription>
              Logotipo e cores da sua marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Logotipo da Empresa</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                {logoPreview && (
                  <div className="relative h-24 w-24 rounded-lg border border-border overflow-hidden bg-muted">
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploadFile.isPending}
                  >
                    {uploadFile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Carregar Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG ou WEBP. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="color" {...field} className="h-10 w-20" />
                      </FormControl>
                      <Input value={field.value} onChange={field.onChange} placeholder="#3B82F6" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Secundária</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="color" {...field} className="h-10 w-20" />
                      </FormControl>
                      <Input value={field.value} onChange={field.onChange} placeholder="#1E40AF" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assinatura Digital */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Assinatura Digital
            </CardTitle>
            <CardDescription>
              Assinatura do representante legal que aparecerá nos documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Imagem da Assinatura</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                {signaturePreview && (
                  <div className="relative h-24 w-48 rounded-lg border border-border overflow-hidden bg-muted">
                    <img src={signaturePreview} alt="Assinatura" className="h-full w-full object-contain" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'signature');
                    }}
                    className="hidden"
                    id="signature-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('signature-upload')?.click()}
                    disabled={uploadFile.isPending}
                  >
                    {uploadFile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Carregar Assinatura
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG com fundo transparente. Máximo 1MB.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="legal_representative_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Representante</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legal_representative_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Diretor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Faturação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Configurações de Faturação
            </CardTitle>
            <CardDescription>
              Defina como serão numeradas as suas faturas e pro-formas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefixo de Faturas</FormLabel>
                    <FormControl>
                      <Input placeholder="FT" maxLength={5} {...field} />
                    </FormControl>
                    <FormDescription>Ex: FT → FT2025001</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proforma_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefixo de Pro-Formas</FormLabel>
                    <FormControl>
                      <Input placeholder="PF" maxLength={5} {...field} />
                    </FormControl>
                    <FormDescription>Ex: PF → PF2025001</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Textos Legais */}
        <Card>
          <CardHeader>
            <CardTitle>Textos Legais</CardTitle>
            <CardDescription>
              Termos e condições que aparecerão nos documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições de Pagamento</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Pagamento em 30 dias após emissão."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms_footer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do Footer</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Este documento é regido pelas leis de Angola."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={createSettings.isPending || updateSettings.isPending}
          >
            {(createSettings.isPending || updateSettings.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar Configurações
          </Button>
        </div>
      </form>
    </Form>
  );
}
