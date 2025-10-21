import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface MapEmbedInputProps {
  value: string;
  onChange: (embedUrl: string) => void;
}

export function MapEmbedInput({ value, onChange }: MapEmbedInputProps) {
  const [address, setAddress] = useState("");

  const generateGoogleMapsEmbed = () => {
    if (!address.trim()) return;
    
    // Generate Google Maps embed URL
    const encodedAddress = encodeURIComponent(address);
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;
    onChange(embedUrl);
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
      
      {value && (
        <div className="rounded-lg overflow-hidden border">
          <iframe
            src={value}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
