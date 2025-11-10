import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

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
          toast.error("Erro ao fazer login", {
            description: error.message || "Credenciais inválidas ou utilizador não autorizado.",
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
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
            <CardDescription>
              Faça login para gerir os assinantes do sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
