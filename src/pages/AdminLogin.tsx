import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).max(100),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkIfFirstAdmin();
  }, []);

  const checkIfFirstAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1);

      if (error) throw error;
      setIsFirstAdmin(!data || data.length === 0);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsFirstAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar inputs
      const validation = signupSchema.safeParse({ email, password, confirmPassword });
      if (!validation.success) {
        toast.error("Erro de validação", {
          description: validation.error.issues[0].message,
        });
        setLoading(false);
        return;
      }

      // Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar utilizador");

      // Fazer login imediatamente para ter sessão autenticada
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      // Inserir na tabela admin_users (agora com sessão autenticada)
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          email: email.trim()
        });

      if (adminError) throw adminError;

      toast.success("Primeiro administrador criado!", {
        description: "Redirecionando...",
      });
      
      // Redirecionar para página de administração
      setTimeout(() => {
        navigate("/admin/subscribers");
      }, 1000);
    } catch (error: any) {
      toast.error("Erro ao criar administrador", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error("Erro ao fazer login", {
          description: "Credenciais inválidas ou utilizador não autorizado.",
        });
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/admin/subscribers");
    } catch (error) {
      toast.error("Erro ao fazer login", {
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isFirstAdmin ? "Criar Primeiro Administrador" : "Acesso Administrativo"}
            </CardTitle>
            <CardDescription>
              {isFirstAdmin 
                ? "Configure a primeira conta de administrador do sistema"
                : "Faça login para gerir os assinantes do sistema"
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={isFirstAdmin ? handleSignup : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                maxLength={100}
              />
            </div>

            {isFirstAdmin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  maxLength={100}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isFirstAdmin ? "Criando..." : "Entrando...") : (isFirstAdmin ? "Criar Administrador" : "Entrar")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
