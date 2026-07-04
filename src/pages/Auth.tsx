import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import authSide from '@/assets/auth-side.jpg';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const defaultTab =
    new URLSearchParams(window.location.search).get('signup') === 'true' ? 'signup' : 'signin';

  useEffect(() => {
    if (user && window.location.pathname !== '/reset-password') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Erro ao fazer login', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Bem-vindo de volta', description: 'Sessão iniciada com sucesso' });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!name) {
      toast({ title: 'Nome obrigatório', description: 'Por favor, insira o seu nome', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    const { error } = await signUp(email, password, name);
    if (error) {
      toast({ title: 'Erro ao criar conta', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Conta criada com sucesso', description: 'A tua sessão foi iniciada' });
      navigate('/dashboard');
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
      toast({ title: 'Erro ao enviar email', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email enviado', description: 'Verifica a tua caixa de entrada' });
      setShowResetPassword(false);
      setResetEmail('');
    }
    setIsLoading(false);
  };

  const primaryBtn =
    'group relative inline-flex items-center justify-center gap-2 w-full rounded-full bg-white px-6 py-3.5 text-sm font-medium text-[#0a0a0f] transition-all duration-300 hover:bg-white/90 hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100';
  const primaryBtnShadow = { boxShadow: '0 20px 60px -15px rgba(255,255,255,0.25), 0 0 0 1px rgba(255,255,255,0.08)' };
  const ghostBtn =
    'inline-flex items-center justify-center gap-2 w-full rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/25';

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white grid lg:grid-cols-2">
      {/* Left: cinematic image panel */}
      <div className="relative hidden lg:block overflow-hidden lg:sticky lg:top-0 lg:h-screen">
        <img src={authSide} alt="Espaço de trabalho profissional de fotografia" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/40 to-[#05060a]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/60" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-3 group w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight">ArgomFotos</span>
          </Link>

          <div className="max-w-md">
            <p className="font-serif-display italic text-4xl xl:text-5xl leading-tight text-white/95">
              "Cada sessão é uma história.
              <br />
              A gestão não deveria roubar-lhe o brilho."
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
              <div className="h-px w-8 bg-white/30" />
              <span>Feito para fotógrafos profissionais</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 lg:p-16 min-h-screen">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden mb-10 inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight">ArgomFotos</span>
          </Link>

          {showResetPassword ? (
            <div>
              <button
                onClick={() => setShowResetPassword(false)}
                className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <h1 className="font-serif-display italic text-4xl md:text-5xl mb-3">Recuperar acesso</h1>
              <p className="text-white/60 mb-10">Insere o teu email para receberes um link de recuperação.</p>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="tu@estudio.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/30"
                  />
                </div>
                <button type="submit" disabled={isLoading} className={primaryBtn} style={primaryBtnShadow}>
                  {isLoading ? 'A enviar...' : 'Enviar link'}
                  {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="font-serif-display italic text-4xl md:text-5xl mb-3">
                {defaultTab === 'signup' ? 'Começa a criar.' : 'Bem-vindo de volta.'}
              </h1>
              <p className="text-white/60 mb-10">
                {defaultTab === 'signup'
                  ? 'Cria a tua conta e organiza o teu estúdio em minutos.'
                  : 'Acede ao teu estúdio e continua o teu trabalho.'}
              </p>

              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-full p-1 h-12">
                  <TabsTrigger
                    value="signin"
                    className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#0a0a0f] text-white/70 transition-all"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#0a0a0f] text-white/70 transition-all"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-8">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="tu@estudio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-white/70 text-xs uppercase tracking-wider">Palavra-passe</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/30"
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className={primaryBtn} style={primaryBtnShadow}>
                      {isLoading ? 'A entrar...' : 'Entrar'}
                      {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="w-full text-center text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Esqueceste-te da palavra-passe?
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-8">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-white/70 text-xs uppercase tracking-wider">Nome</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="O teu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@estudio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white/70 text-xs uppercase tracking-wider">Palavra-passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/30"
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className={primaryBtn} style={primaryBtnShadow}>
                      {isLoading ? 'A criar conta...' : 'Criar Conta'}
                      {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-10 pt-8 border-t border-white/10">
                <Link to="/" className={ghostBtn}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao início
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
