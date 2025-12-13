import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Zap, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { INDUSTRY_MODULE_MAPPING } from "@/lib/industryConfig";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  defaultModules: string[] | null;
  isActive: boolean;
}

interface IndustryDeployment {
  id: string;
  tenantId: string;
  industryId: string;
  enabledModules: string[] | null;
  status: string | null;
  deployedAt: string;
}

export default function IndustrySetup() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Industry Setup | NexusAI";
  }, []);

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const { data: industries = [], isLoading: industriesLoading } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const { data: allDeployments = [], isLoading: deploymentsLoading } = useQuery<IndustryDeployment[]>({
    queryKey: ["/api/industry-deployments"],
  });

  const deployMutation = useMutation({
    mutationFn: async (data: { tenantId: string; industryId: string; enabledModules: string[] }) => {
      const res = await apiRequest("POST", "/api/industry-deployments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/industry-deployments"] });
      const tenant = tenants.find((t) => t.id === selectedTenant);
      const industry = industries.find((i) => i.id === selectedIndustry);
      setDeploymentSuccess(`${industry?.name} deployed to ${tenant?.name}`);
      setSelectedIndustry("");
      setTimeout(() => setDeploymentSuccess(null), 3000);
    },
  });

  const handleDeploy = async () => {
    if (!selectedTenant || !selectedIndustry) return;

    const industry = industries.find((i) => i.id === selectedIndustry);
    const enabledModules = industry?.defaultModules || INDUSTRY_MODULE_MAPPING[industry?.slug || ""] || [];

    deployMutation.mutate({
      tenantId: selectedTenant,
      industryId: selectedIndustry,
      enabledModules,
    });
  };

  const tenantDeployments = selectedTenant
    ? allDeployments.filter((d) => d.tenantId === selectedTenant)
    : [];

  const getIndustryName = (industryId: string) => {
    return industries.find((i) => i.id === industryId)?.name || "Unknown";
  };

  const getTenantName = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)?.name || "Unknown";
  };

  const selectedIndustryData = industries.find((i) => i.id === selectedIndustry);
  const previewModules = selectedIndustryData?.defaultModules || 
    INDUSTRY_MODULE_MAPPING[selectedIndustryData?.slug || ""] || [];

  const isLoading = tenantsLoading || industriesLoading || deploymentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Industry Setup & Deployment</h1>
        <p className="text-muted-foreground">
          Deploy industry configurations to tenants and automatically enable relevant modules
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Deploy Industry</h2>

          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium mb-2">Select Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger data-testid="select-industry">
                  <SelectValue placeholder="Choose an industry..." />
                </SelectTrigger>
                <SelectContent>
                  {industries.filter((i) => i.isActive).map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIndustry && previewModules.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2">Modules to be enabled:</p>
                <div className="flex flex-wrap gap-2">
                  {previewModules.map((module) => (
                    <Badge key={module} variant="secondary">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleDeploy}
              disabled={!selectedTenant || !selectedIndustry || deployMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="button-deploy-industry"
            >
              <Zap className="w-4 h-4 mr-2" />
              {deployMutation.isPending ? "Deploying..." : "Deploy Industry"}
            </Button>

            {deploymentSuccess && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {deploymentSuccess}
              </div>
            )}
          </div>
        </Card>

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
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{getIndustryName(deployment.industryId)}</p>
                      <p className="text-xs text-muted-foreground">
                        Deployed {new Date(deployment.deployedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {deployment.status}
                    </Badge>
                  </div>
                  {deployment.enabledModules && deployment.enabledModules.length > 0 && (
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
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Tenant Deployments</h2>
        <div className="space-y-3">
          {tenants.map((tenant) => {
            const count = allDeployments.filter((d) => d.tenantId === tenant.id).length;
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
