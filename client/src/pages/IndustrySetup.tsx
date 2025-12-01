import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select
  SelectContent
  SelectItem
  SelectTrigger
  SelectValue
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { INDUSTRIES, INDUSTRY_MODULE_MAPPING, type TenantDeployment } from "@/lib/industryConfig";

interface Tenant {
  id: string;
  name: string;
}

export default function IndustrySetup() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: "tenant-1", name: "Acme Corporation" }
    { id: "tenant-2", name: "Global Industries" }
    { id: "tenant-3", name: "Tech Solutions Inc" }
  ]);
  const [deployments, setDeployments] = useState<TenantDeployment[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Industry Setup | NexusAI";
    // Load deployments from localStorage
    const saved = localStorage.getItem("industryDeployments");
    if (saved) {
      setDeployments(JSON.parse(saved));
    }
  }, []);

  const handleDeploy = async () => {
    if (!selectedTenant || !selectedIndustry) return;

    setIsDeploying(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const tenant = tenants.find((t) => t.id === selectedTenant);
      const industry = INDUSTRIES.find((i) => i.id === selectedIndustry);
      const enabledModules = INDUSTRY_MODULE_MAPPING[selectedIndustry] || [];

      const newDeployment: TenantDeployment = {
        id: `deployment-${Date.now()}`
        tenantId: selectedTenant
        tenantName: tenant?.name || "Unknown"
        industryId: selectedIndustry
        industryName: industry?.name || "Unknown"
        enabledModules
        deployedAt: new Date().toISOString()
        status: "active"
      };

      // Check if already deployed
      const existingIndex = deployments.findIndex(
        (d) => d.tenantId === selectedTenant && d.industryId === selectedIndustry
      );

      let updated: TenantDeployment[] = [];
      if (existingIndex >= 0) {
        updated = [...deployments];
        updated[existingIndex] = newDeployment;
      } else {
        updated = [...deployments, newDeployment];
      }

      setDeployments(updated);
      localStorage.setItem("industryDeployments", JSON.stringify(updated));
      setDeploymentSuccess(`${industry?.name} deployed to ${tenant?.name}`);
      setSelectedIndustry("");

      setTimeout(() => setDeploymentSuccess(null), 3000);
    } finally {
      setIsDeploying(false);
    }
  };

  const tenantDeployments = selectedTenant
    ? deployments.filter((d) => d.tenantId === selectedTenant)
    : [];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Industry Setup & Deployment</h1>
        <p className="text-muted-foreground">
          Deploy industry configurations to tenants and automatically enable relevant modules
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deployment Panel */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Deploy Industry</h2>

          <div className="space-y-4">
            {/* Tenant Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Tenant</label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger data-testid="select-tenant">
                  <SelectValue placeholder="Choose a tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger data-testid="select-industry">
                  <SelectValue placeholder="Choose an industry..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modules Preview */}
            {selectedIndustry && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2">Modules to be enabled:</p>
                <div className="flex flex-wrap gap-2">
                  {(INDUSTRY_MODULE_MAPPING[selectedIndustry] || []).map((module) => (
                    <Badge key={module} variant="secondary">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Deploy Button */}
            <Button
              onClick={handleDeploy}
              disabled={!selectedTenant || !selectedIndustry || isDeploying}
              className="w-full"
              size="lg"
              data-testid="button-deploy-industry"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isDeploying ? "Deploying..." : "Deploy Industry"}
            </Button>

            {/* Success Message */}
            {deploymentSuccess && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {deploymentSuccess}
              </div>
            )}
          </div>
        </Card>

        {/* Deployments List */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {selectedTenant ? "Tenant Deployments" : "Select a tenant to view deployments"}
          </h2>

          <div className="space-y-3">
            {tenantDeployments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {selectedTenant ? "No industries deployed for this tenant" : "No tenant selected"}
              </div>
            ) : (
              tenantDeployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="p-4 border rounded-md space-y-2"
                  data-testid={`deployment-card-${deployment.industryId}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{deployment.industryName}</p>
                      <p className="text-xs text-muted-foreground">
                        Deployed {new Date(deployment.deployedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {deployment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2">Enabled Modules:</p>
                    <div className="flex flex-wrap gap-1">
                      {deployment.enabledModules.map((module) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* All Tenants Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Tenant Deployments</h2>
        <div className="space-y-3">
          {tenants.map((tenant) => {
            const count = deployments.filter((d) => d.tenantId === tenant.id).length;
            return (
              <div
                key={tenant.id}
                className="p-3 border rounded-md flex items-center justify-between"
                data-testid={`tenant-summary-${tenant.id}`}
              >
                <div>
                  <p className="font-medium">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {count} {count === 1 ? "industry" : "industries"} deployed
                  </p>
                </div>
                <CheckCircle2 className={`w-5 h-5 ${count > 0 ? "text-green-600" : "text-muted"}`} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
