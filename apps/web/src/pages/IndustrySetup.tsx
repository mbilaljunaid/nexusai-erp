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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Zap, Loader2, Settings, Save, Code } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { INDUSTRY_MODULE_MAPPING } from "@/lib/industryConfig";
import { useToast } from "@/hooks/use-toast";

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
  customConfig: Record<string, unknown> | null;
  status: string | null;
  deployedAt: string;
}

const ALL_AVAILABLE_MODULES = [
  "ERP",
  "CRM",
  "Finance",
  "HR",
  "Manufacturing",
  "Projects",
  "Procurement",
  "Analytics",
  "Marketing",
  "AI",
  "Governance",
  "Service",
  "Compliance",
  "Education",
  "Communication",
  "Admin",
  "Logistics",
  "Operations",
  "Workflow",
  "Developer",
];

export default function IndustrySetup() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<IndustryDeployment | null>(null);
  const [editedModules, setEditedModules] = useState<string[]>([]);
  const [editedConfig, setEditedConfig] = useState<string>("");
  const [configError, setConfigError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Industry Setup | NexusAIFirst";
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

  const updateDeploymentMutation = useMutation({
    mutationFn: async (data: { id: string; enabledModules: string[]; customConfig: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/industry-deployments/${data.id}`, {
        enabledModules: data.enabledModules,
        customConfig: data.customConfig,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/industry-deployments"] });
      setCustomizeDialogOpen(false);
      setSelectedDeployment(null);
      toast({
        title: "Deployment Updated",
        description: "Your customization changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update deployment",
        variant: "destructive",
      });
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

  const handleOpenCustomize = (deployment: IndustryDeployment) => {
    setSelectedDeployment(deployment);
    setEditedModules(deployment.enabledModules || []);
    setEditedConfig(deployment.customConfig ? JSON.stringify(deployment.customConfig, null, 2) : "{}");
    setConfigError(null);
    setCustomizeDialogOpen(true);
  };

  const handleToggleModule = (module: string) => {
    setEditedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(editedConfig);
      setEditedConfig(JSON.stringify(parsed, null, 2));
      setConfigError(null);
    } catch (e) {
      const errorMessage = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setConfigError(`Cannot format: ${errorMessage}. Fix errors first.`);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (updateDeploymentMutation.isPending) return;
    setCustomizeDialogOpen(open);
    if (!open) {
      setSelectedDeployment(null);
      setConfigError(null);
    }
  };

  const handleSaveCustomization = () => {
    if (!selectedDeployment || updateDeploymentMutation.isPending) return;

    const trimmedConfig = editedConfig.trim();
    if (!trimmedConfig) {
      setConfigError("Configuration cannot be empty. Use {} for no custom settings.");
      return;
    }

    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(trimmedConfig);
      if (typeof parsedConfig !== "object" || parsedConfig === null || Array.isArray(parsedConfig)) {
        setConfigError("Configuration must be a JSON object (not an array or primitive).");
        return;
      }
      setConfigError(null);
    } catch (e) {
      const errorMessage = e instanceof SyntaxError ? e.message : "Invalid JSON format";
      setConfigError(`JSON Error: ${errorMessage}. Check for missing quotes, trailing commas, or invalid syntax.`);
      return;
    }

    updateDeploymentMutation.mutate({
      id: selectedDeployment.id,
      enabledModules: editedModules,
      customConfig: parsedConfig,
    });
  };

  const getIndustryModules = (industryId: string): string[] => {
    const industry = industries.find((i) => i.id === industryId);
    if (industry?.defaultModules && industry.defaultModules.length > 0) {
      return industry.defaultModules;
    }
    const slug = industry?.slug || "";
    return INDUSTRY_MODULE_MAPPING[slug] || [];
  };

  const getAvailableModulesForDeployment = (): string[] => {
    if (!selectedDeployment) return ALL_AVAILABLE_MODULES;
    const industryModules = getIndustryModules(selectedDeployment.industryId);
    const combinedModules = new Set([...industryModules, ...ALL_AVAILABLE_MODULES]);
    return Array.from(combinedModules).sort();
  };

  const tenantDeployments = selectedTenant
    ? allDeployments.filter((d) => d.tenantId === selectedTenant)
    : [];

  const getIndustryName = (industryId: string) => {
    return industries.find((i) => i.id === industryId)?.name || "Unknown";
  };

  const getIndustrySlug = (industryId: string) => {
    return industries.find((i) => i.id === industryId)?.slug || "";
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
                  className="p-4 border rounded-md space-y-3"
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCustomize(deployment)}
                    data-testid={`button-customize-${deployment.id}`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
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

      <Dialog open={customizeDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Deployment</DialogTitle>
            <DialogDescription>
              {selectedDeployment && (
                <>Customize modules and settings for {getIndustryName(selectedDeployment.industryId)} deployment</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Enabled Modules</h3>
              <p className="text-xs text-muted-foreground">
                Toggle modules on or off for this deployment. Default modules are pre-selected based on industry.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {getAvailableModulesForDeployment().map((module) => {
                  const isEnabled = editedModules.includes(module);
                  const industryDefaultModules = selectedDeployment
                    ? getIndustryModules(selectedDeployment.industryId)
                    : [];
                  const isDefault = industryDefaultModules.includes(module);

                  return (
                    <div
                      key={module}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`module-${module}`} className="text-sm cursor-pointer">
                          {module}
                        </Label>
                        {isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <Switch
                        id={`module-${module}`}
                        checked={isEnabled}
                        onCheckedChange={() => handleToggleModule(module)}
                        disabled={updateDeploymentMutation.isPending}
                        data-testid={`switch-module-${module}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">Custom Configuration</h3>
                  <p className="text-xs text-muted-foreground">
                    Add industry-specific settings as JSON. This can include custom parameters, feature flags, or integrations.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormatJson}
                  disabled={updateDeploymentMutation.isPending}
                  data-testid="button-format-json"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Format
                </Button>
              </div>
              <Textarea
                value={editedConfig}
                onChange={(e) => {
                  setEditedConfig(e.target.value);
                  setConfigError(null);
                }}
                className="font-mono text-sm min-h-[150px]"
                placeholder='{"customSetting": "value"}'
                disabled={updateDeploymentMutation.isPending}
                data-testid="textarea-custom-config"
              />
              {configError && (
                <p className="text-sm text-destructive">{configError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={updateDeploymentMutation.isPending}
              data-testid="button-cancel-customize"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCustomization}
              disabled={updateDeploymentMutation.isPending}
              data-testid="button-save-customize"
            >
              {updateDeploymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
