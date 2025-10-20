import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckSquare, FileSignature } from 'lucide-react';
import { TemplateManager } from '@/components/TemplateManager';

export default function Templates() {
  const [activeTab, setActiveTab] = useState('quotes');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Gerencie templates para orçamentos, checklists e contratos
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
