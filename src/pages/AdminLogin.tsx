import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Tentando fazer login...");
      const { error } = await signIn(email.trim(), password);
      
      if (error) {
        console.error("Erro no login:", error);
        
        // Mensagem específica para email não confirmado
        if (error.message?.includes("Email not confirmed") || error.message?.includes("email_not_confirmed")) {
          toast.error("Email não confirmado", {
            description: "Por favor, desabilite a confirmação de email no Supabase (Authentication → Providers → Email).",
            duration: 6000,
          });
        } else {
          toast.error("Acesso Negado", {
            description: "Credenciais inválidas ou você não tem permissão de administrador. Esta área é exclusiva para administradores autorizados.",
            duration: 5000,
          });
        }
        return;
      }

      console.log("Login bem-sucedido!");
      toast.success("Login realizado com sucesso!");
      navigate("/admin/subscribers");
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      toast.error("Erro ao fazer login", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
            <CardDescription>
              Área restrita - Apenas para administradores autorizados
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>ATENÇÃO:</strong> Esta área é exclusiva para administradores do sistema. 
              Usuários do sistema de fotografia não têm acesso e não devem tentar fazer login aqui.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
                maxLength={255}
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
