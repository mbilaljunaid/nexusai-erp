import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReportBuilder } from "@/components/ReportBuilder";
import { Plus, BarChart3 } from "lucide-react";

const MODULES = [
  { id: "crm", label: "CRM", icon: "Target" },
  { id: "finance", label: "Finance", icon: "DollarSign" },
  { id: "supply_chain", label: "Supply Chain", icon: "Package" },
  { id: "manufacturing", label: "Manufacturing", icon: "Factory" },
  { id: "hr", label: "HR & Payroll", icon: "Users" },
  { id: "projects", label: "Projects", icon: "Briefcase" },
  { id: "admin", label: "Admin", icon: "Settings" },
];

export default function Reports() {
  const [selectedModule, setSelectedModule] = useState("crm");

  return (
    <div className="space-y-8">
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Reports", href: "/reports" }
      ]} />

      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground text-lg">Build, view, and export reports across all modules</p>
      </div>

      <Tabs value={selectedModule} onValueChange={setSelectedModule} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {MODULES.map((module) => (
            <TabsTrigger key={module.id} value={module.id} data-testid={`tab-module-${module.id}`}>
              {module.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MODULES.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            <ReportBuilder module={module.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
