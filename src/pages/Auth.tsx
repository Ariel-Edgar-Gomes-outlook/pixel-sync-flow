import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      // Não redirecionar se o usuário estiver na página de reset de senha
      if (window.location.pathname !== '/reset-password') {
        navigate('/');
      }
    }
  }, [user, navigate]);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao ArgomFotos'
      });
      navigate('/');
    }
    setIsLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira o seu nome',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    const {
      error
    } = await signUp(email, password, name);
    if (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique o seu email para confirmar a conta'
      });
      setEmail('');
      setPassword('');
      setName('');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir a senha'
      });
      setShowResetPassword(false);
      setResetEmail('');
    }
    setIsLoading(false);
  };

  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Camera className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-foreground">FotosArgom</h1>
        </div>

        <Card className="backdrop-blur-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-2xl">
              {showResetPassword ? 'Recuperar Senha' : 'Sistema de Gestão Fotográfica'}
            </CardTitle>
            <CardDescription>
              {showResetPassword 
                ? 'Insira seu email para receber o link de recuperação'
                : 'Faça login ou crie uma conta para começar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetPassword(false)}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'A entrar...' : 'Entrar'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setShowResetPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                  >
                    Esqueceu a senha?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input id="signup-name" type="text" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'A criar conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>;
}