import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGalleries } from "@/hooks/useGalleries";
import { Image as ImageIcon, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function GalleriesWidget() {
  const { data: galleries, isLoading } = useGalleries();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galerias de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const activeGalleries = galleries?.filter(g => g.status === 'active') || [];
  const recentGalleries = galleries?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galerias de Cliente
        </CardTitle>
        <CardDescription>
          {activeGalleries.length} {activeGalleries.length === 1 ? 'galeria ativa' : 'galerias ativas'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentGalleries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma galeria criada ainda</p>
            <p className="text-xs mt-1">
              Crie galerias para compartilhar fotos com seus clientes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentGalleries.map((gallery: any) => (
              <div
                key={gallery.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{gallery.name}</p>
                    <Badge
                      variant={
                        gallery.status === 'active' ? 'default' :
                        gallery.status === 'expired' ? 'destructive' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {gallery.status === 'active' ? 'Ativa' :
                       gallery.status === 'expired' ? 'Expirada' : 'Fechada'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{gallery.gallery_photos?.[0]?.count || 0} fotos</span>
                    {gallery.expiration_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(gallery.expiration_date), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a
                    href={`/gallery/${gallery.share_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
