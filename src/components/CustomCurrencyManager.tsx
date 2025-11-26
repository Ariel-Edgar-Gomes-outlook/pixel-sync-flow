import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Coins } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences, useUpdateUserPreferences, CustomCurrency } from "@/hooks/useUserPreferences";
import { useCurrency } from "@/hooks/useCurrency";

export function CustomCurrencyManager() {
  const { user } = useAuth();
  const { data: preferences } = useUserPreferences(user?.id);
  const updatePreferences = useUpdateUserPreferences();
  const { customCurrencies } = useCurrency();

  const [newCurrency, setNewCurrency] = useState({
    code: "",
    symbol: "",
    name: "",
  });

  const handleAddCurrency = async () => {
    if (!user?.id) return;
    
    // Validations
    if (!newCurrency.code || !newCurrency.symbol || !newCurrency.name) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (newCurrency.code.length !== 3) {
      toast.error("O código da moeda deve ter 3 caracteres (ex: AOA, USD)");
      return;
    }

    const existingCurrencies = customCurrencies || [];
    
    // Check if currency already exists
    if (existingCurrencies.some(c => c.code.toUpperCase() === newCurrency.code.toUpperCase())) {
      toast.error("Moeda já existe");
      return;
    }

    const updatedCurrencies: CustomCurrency[] = [
      ...existingCurrencies,
      {
        code: newCurrency.code.toUpperCase(),
        symbol: newCurrency.symbol,
        name: newCurrency.name,
        locale: 'pt-AO',
      },
    ];

    await updatePreferences.mutateAsync({
      userId: user.id,
      custom_currencies: updatedCurrencies,
    });

    setNewCurrency({ code: "", symbol: "", name: "" });
    toast.success(`Moeda ${newCurrency.code.toUpperCase()} adicionada com sucesso`);
  };

  const handleRemoveCurrency = async (code: string) => {
    if (!user?.id) return;

    const updatedCurrencies = (customCurrencies || []).filter(c => c.code !== code);

    await updatePreferences.mutateAsync({
      userId: user.id,
      custom_currencies: updatedCurrencies,
    });

    toast.success("Moeda removida com sucesso");
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Moedas Personalizadas</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Adicione moedas personalizadas que não estão na lista padrão
        </p>

        {/* Add New Currency Form */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currency-code">Código (3 letras)</Label>
              <Input
                id="currency-code"
                placeholder="ex: MZN"
                value={newCurrency.code}
                onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                maxLength={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency-symbol">Símbolo</Label>
              <Input
                id="currency-symbol"
                placeholder="ex: MT"
                value={newCurrency.symbol}
                onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency-name">Nome</Label>
              <Input
                id="currency-name"
                placeholder="ex: Metical Moçambicano"
                value={newCurrency.name}
                onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
              />
            </div>
          </div>
          <Button 
            onClick={handleAddCurrency} 
            disabled={updatePreferences.isPending}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Moeda
          </Button>
        </div>

        {/* Existing Custom Currencies */}
        {customCurrencies && customCurrencies.length > 0 && (
          <>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Moedas Adicionadas:</p>
              <div className="grid gap-2">
                {customCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono">
                        {currency.code}
                      </Badge>
                      <span className="font-medium text-foreground">{currency.symbol}</span>
                      <span className="text-sm text-muted-foreground">{currency.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCurrency(currency.code)}
                      disabled={updatePreferences.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
