import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckSquare, FileSignature, Layers } from 'lucide-react';
import { TemplateManager } from '@/components/TemplateManager';

export default function Templates() {
  const [activeTab, setActiveTab] = useState('quotes');

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Gestão de Modelos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Modelos</h1>
          <p className="text-muted-foreground">
            Gerencie modelos para orçamentos, checklists e contratos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileSignature className="h-4 w-4" />
            Contratos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes">
          <TemplateManager type="quote" />
        </TabsContent>

        <TabsContent value="checklists">
          <TemplateManager type="checklist" />
        </TabsContent>

        <TabsContent value="contracts">
          <TemplateManager type="contract" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
