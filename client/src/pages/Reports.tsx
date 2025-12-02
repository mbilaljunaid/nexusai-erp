import { useRoute } from "wouter";
import { ReportBuilder } from "@/components/ReportBuilder";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MODULES = [
  { id: "crm", name: "CRM" },
  { id: "finance", name: "Finance" },
  { id: "supply_chain", name: "Supply Chain" },
  { id: "manufacturing", name: "Manufacturing" },
  { id: "hr", name: "HR & Payroll" },
  { id: "projects", name: "Projects" },
  { id: "admin", name: "Admin" },
];

export default function Reports() {
  const [, params] = useRoute("/reports/:module");
  const currentModule = params?.module || "crm";

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: "Reports", path: "/reports" }]} />
      
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Create and manage transactional and periodical reports</p>
      </div>

      <Tabs value={currentModule} onValueChange={() => {}} defaultValue="crm">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {MODULES.map((module) => (
            <TabsTrigger
              key={module.id}
              value={module.id}
              onClick={() => window.history.pushState(null, "", `/reports/${module.id}`)}
              data-testid={`tab-reports-${module.id}`}
            >
              {module.name}
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
