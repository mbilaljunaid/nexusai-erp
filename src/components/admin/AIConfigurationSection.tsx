import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AI_PROVIDER_OPTIONS, type AIProviderType } from "@/types/nexus-ai";
import {
  Brain, Plus, Trash2, CheckCircle, Loader2, Eye, EyeOff, Zap, TestTube,
} from "lucide-react";

interface ProviderFromAPI {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  isActive: boolean;
  isDefault: boolean;
  maxTokens?: number;
  temperature?: number;
}

export default function AIConfigurationSection() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    provider: "" as AIProviderType | "",
    apiKey: "",
    baseUrl: "",
    model: "",
    isDefault: true,
    maxTokens: 4096,
    temperature: 7,
  });

  const { data: providers = [], isLoading } = useQuery<ProviderFromAPI[]>({
    queryKey: ["/api/nexus-ai/providers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/nexus-ai/providers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/provider/active"] });
      toast({ title: "AI Provider Added", description: "Provider configured successfully." });
      setShowForm(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/nexus-ai/providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/provider/active"] });
      toast({ title: "Provider Deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive, isDefault }: { id: string; isActive?: boolean; isDefault?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/nexus-ai/providers/${id}`, { isActive, isDefault });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/provider/active"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      setTestingId(id);
      const res = await apiRequest("POST", `/api/nexus-ai/providers/${id}/test`);
      return res.json();
    },
    onSuccess: (data) => {
      setTestingId(null);
      if (data.success) {
        toast({ title: "✅ Connection Successful", description: `Latency: ${data.latencyMs}ms` });
      } else {
        toast({ title: "❌ Connection Failed", description: data.message, variant: "destructive" });
      }
    },
    onError: (err: any) => {
      setTestingId(null);
      toast({ title: "Test Failed", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm({ name: "", provider: "", apiKey: "", baseUrl: "", model: "", isDefault: true, maxTokens: 4096, temperature: 7 });
  };

  const selectedProviderOption = AI_PROVIDER_OPTIONS.find(p => p.provider === form.provider);

  const handleSubmit = () => {
    if (!form.name || !form.provider || !form.apiKey || !form.model) {
      toast({ title: "Missing Fields", description: "Name, provider, API key, and model are required.", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Provider Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure which AI model powers NexusAI across all modules
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Provider
        </Button>
      </div>

      {/* Add Provider Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">New AI Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g. Production GPT-4o"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={form.provider} onValueChange={(v: AIProviderType) => {
                  const opt = AI_PROVIDER_OPTIONS.find(p => p.provider === v);
                  setForm(f => ({
                    ...f,
                    provider: v,
                    baseUrl: opt?.defaultBaseUrl || "",
                    model: opt?.models[0] || "",
                  }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDER_OPTIONS.map(opt => (
                      <SelectItem key={opt.provider} value={opt.provider}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={form.apiKey}
                  onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                {selectedProviderOption && selectedProviderOption.models.length > 0 ? (
                  <Select value={form.model} onValueChange={v => setForm(f => ({ ...f, model: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selectedProviderOption.models.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Model name"
                    value={form.model}
                    onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  />
                )}
              </div>
            </div>

            {(form.provider === "custom" || form.provider === "azure_openai" || form.provider === "ollama") && (
              <div className="space-y-2">
                <Label>Base URL / Endpoint</Label>
                <Input
                  placeholder="https://your-endpoint.com/v1"
                  value={form.baseUrl}
                  onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Tokens: {form.maxTokens}</Label>
                <Slider
                  value={[form.maxTokens]}
                  onValueChange={([v]) => setForm(f => ({ ...f, maxTokens: v }))}
                  min={256}
                  max={128000}
                  step={256}
                />
              </div>
              <div className="space-y-2">
                <Label>Temperature: {(form.temperature / 10).toFixed(1)}</Label>
                <Slider
                  value={[form.temperature]}
                  onValueChange={([v]) => setForm(f => ({ ...f, temperature: v }))}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isDefault}
                onCheckedChange={v => setForm(f => ({ ...f, isDefault: v }))}
              />
              <Label>Set as default provider</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Save Provider
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configured Providers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="font-medium text-muted-foreground">No AI Providers Configured</h4>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add an AI provider to enable NexusAI across all modules
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {providers.map(prov => {
            const opt = AI_PROVIDER_OPTIONS.find(o => o.provider === prov.provider);
            return (
              <Card key={prov.id} className={prov.isDefault ? "border-primary/40" : ""}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prov.name}</span>
                        {prov.isDefault && <Badge variant="default" className="text-xs">Default</Badge>}
                        <Badge variant={prov.isActive ? "secondary" : "outline"} className="text-xs">
                          {prov.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {opt?.label || prov.provider} · {prov.model}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {showKeys[prov.id] ? prov.apiKey : prov.apiKey.substring(0, 8) + "••••••••"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowKeys(s => ({ ...s, [prov.id]: !s[prov.id] }))}
                    >
                      {showKeys[prov.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={testingId === prov.id}
                      onClick={() => testMutation.mutate(prov.id)}
                    >
                      {testingId === prov.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TestTube className="h-4 w-4 mr-1" />}
                      Test
                    </Button>
                    {!prov.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: prov.id, isDefault: true })}
                      >
                        <Zap className="h-4 w-4 mr-1" /> Set Default
                      </Button>
                    )}
                    <Switch
                      checked={prov.isActive}
                      onCheckedChange={v => toggleMutation.mutate({ id: prov.id, isActive: v })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(prov.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
