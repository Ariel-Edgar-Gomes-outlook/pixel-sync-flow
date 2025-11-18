import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface MapEmbedInputProps {
  value: string;
  onChange: (embedUrl: string) => void;
}

const ALLOWED_IFRAME_DOMAINS = [
  'https://maps.google.com',
  'https://www.google.com/maps',
  'https://maps.googleapis.com',
];

function isValidMapUrl(url: string): boolean {
  if (!url) return true;
  
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_IFRAME_DOMAINS.some(domain => url.startsWith(domain));
  } catch {
    return false;
  }
}

export function MapEmbedInput({ value, onChange }: MapEmbedInputProps) {
  const [address, setAddress] = useState("");

  const generateGoogleMapsEmbed = () => {
    if (!address.trim()) {
      toast.error("Por favor, digite um endereço primeiro");
      return;
    }
    
    // Generate Google Maps embed URL (without API key requirement)
    const encodedAddress = encodeURIComponent(address);
    const embedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    onChange(embedUrl);
    toast.success("Mapa gerado com sucesso!");
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="address">Endereço</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Digite o endereço do local"
          />
          <Button 
            type="button"
            variant="outline" 
            onClick={generateGoogleMapsEmbed}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            Gerar Mapa
          </Button>
        </div>
      </div>
      
      {value && isValidMapUrl(value) && (
        <div className="rounded-lg overflow-hidden border">
          <iframe
            src={value}
            width="100%"
            height="300"
            style={{ border: 0 }}
            sandbox="allow-scripts allow-same-origin"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
      {value && !isValidMapUrl(value) && (
        <div className="rounded-lg border border-destructive p-4 text-sm text-destructive">
          URL de mapa inválido. Por favor, use apenas URLs do Google Maps.
        </div>
      )}
    </div>
  );
}
