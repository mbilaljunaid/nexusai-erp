import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BomForm } from "@/components/forms/BomForm";
import { Factory } from "lucide-react";

export default function Manufacturing() {
  const [activeTab, setActiveTab] = useState("bom");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="w-8 h-8" />
            Manufacturing
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage BOMs, work orders, production planning, and quality control
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="production">Production Orders</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="bom" className="space-y-6">
          <BomForm />
          <Card>
            <CardHeader>
              <CardTitle>BOMs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No BOMs created yet. Create one above to get started.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Work Orders <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Work order management will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Production Orders <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Production order management will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Quality Checks <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quality control management will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
