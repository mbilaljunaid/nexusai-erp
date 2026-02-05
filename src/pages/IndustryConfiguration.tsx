import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface IndustryData {
  id: string;
  name: string;
  modules: string[];
  aiCapabilities: string[];
  regulations: string[];
}

export default function IndustryConfiguration() {
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [config, setConfig] = useState({
    currency: "USD",
    timezone: "UTC",
    language: "en",
    accountingStandard: "GAAP",
  });

  const { data: industries, isLoading } = useQuery<IndustryData[]>({
    queryKey: ["/api/industries"],
    queryFn: () =>
      fetch("http://localhost:3001/api/industries", { credentials: "include" }).then((r) =>
        r.json()
      ),
  });

  const selectedIndustryData = industries?.find((i) => i.id === selectedIndustry);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "http://localhost:3001/api/configuration", {
        industryId: selectedIndustry,
        tenantId: "acme",
        enabledModules,
        taxRules: {},
        laborLaws: {},
        ...config,
        complianceRequirements: selectedIndustryData?.regulations || [],
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Industry configuration saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    },
  });

  const handleModuleToggle = (module: string) => {
    setEnabledModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Industry Configuration</h1>
        <p className="text-muted-foreground mt-2">Configure your enterprise for a specific industry</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Industry Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Industry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry Type</Label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger id="industry" data-testid="select-industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries?.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id} data-testid={`option-industry-${ind.id}`}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIndustryData && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{selectedIndustryData.name}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Regulations:</span>
                      <div className="mt-1 space-y-1">
                        {selectedIndustryData.regulations.map((reg) => (
                          <div key={reg} className="text-xs text-muted-foreground">
                            • {reg}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">AI Capabilities:</span>
                      <div className="mt-1 space-y-1">
                        {selectedIndustryData.aiCapabilities.slice(0, 3).map((cap) => (
                          <div key={cap} className="text-xs text-muted-foreground">
                            • {cap}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modules Configuration */}
          {selectedIndustryData && (
            <Card>
              <CardHeader>
                <CardTitle>Enable Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedIndustryData.modules.map((module) => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox
                      id={module}
                      checked={enabledModules.includes(module)}
                      onCheckedChange={() => handleModuleToggle(module)}
                      data-testid={`checkbox-module-${module}`}
                    />
                    <Label htmlFor={module} className="cursor-pointer">
                      {module}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Regional Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={config.currency} onValueChange={(val) => setConfig({ ...config, currency: val })}>
                    <SelectTrigger id="currency" data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={config.timezone} onValueChange={(val) => setConfig({ ...config, timezone: val })}>
                    <SelectTrigger id="timezone" data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern</SelectItem>
                      <SelectItem value="America/Chicago">Central</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={config.language} onValueChange={(val) => setConfig({ ...config, language: val })}>
                    <SelectTrigger id="language" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accounting">Accounting Standard</Label>
                  <Select value={config.accountingStandard} onValueChange={(val) => setConfig({ ...config, accountingStandard: val })}>
                    <SelectTrigger id="accounting" data-testid="select-accounting">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GAAP">GAAP (US)</SelectItem>
                      <SelectItem value="IFRS">IFRS (International)</SelectItem>
                      <SelectItem value="ASPE">ASPE (Canada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!selectedIndustry || saveMutation.isPending}
              data-testid="button-save-configuration"
            >
              {saveMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
