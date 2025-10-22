import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GalleryLink {
  name: string;
  platform: string;
  url: string;
  password?: string;
  access_instructions?: string;
}

interface GalleryLinksDisplayProps {
  links: GalleryLink[];
}

const platformIcons: Record<string, string> = {
  'google_drive': '📁',
  'dropbox': '📦',
  'wetransfer': '📤',
  'onedrive': '☁️',
  'mega': '💾',
  'other': '🔗'
};

export function GalleryLinksDisplay({ links }: GalleryLinksDisplayProps) {
  if (links.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum link de galeria disponível ainda</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <Card key={index} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{platformIcons[link.platform] || platformIcons.other}</span>
                <div>
                  <h3 className="font-semibold text-lg">{link.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{link.platform.replace('_', ' ')}</p>
                </div>
              </div>

              {link.password && (
                <div className="mb-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">🔒 Senha de acesso:</p>
                  <code className="text-sm bg-background px-3 py-2 rounded border border-border inline-block">
                    {link.password}
                  </code>
                </div>
              )}

              {link.access_instructions && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {link.access_instructions}
                  </p>
                </div>
              )}
            </div>

            <Button asChild size="lg">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir Galeria
              </a>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
