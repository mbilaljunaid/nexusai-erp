import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select
  SelectContent
  SelectItem
  SelectTrigger
  SelectValue
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Copy, Check, AlertCircle } from "lucide-react";

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  environment: "development" | "staging" | "production";
  isSecret: boolean;
  createdAt: string;
}

export default function EnvironmentManagement() {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<"development" | "staging" | "production">("production");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Environment Management | NexusAI";
    loadEnvVars();
  }, []);

  const loadEnvVars = async () => {
    try {
      const res = await fetch("/api/environment-vars");
      if (res.ok) {
        setEnvVars(await res.json());
      }
    } catch (e) {
      console.error("Failed to load environment variables", e);
    }
  };

  const handleAddVariable = async () => {
    if (!newKey || !newValue) return;

    setLoading(true);
    try {
      const newVar: EnvironmentVariable = {
        id: `var-${Date.now()}`
        key: newKey
        value: isSecret ? "•••••••" : newValue
        environment: selectedEnv
        isSecret
        createdAt: new Date().toISOString()
      };

      const res = await fetch("/api/environment-vars", {
        method: "POST"
        headers: { "Content-Type": "application/json" }
        body: JSON.stringify(newVar)
      });

      if (res.ok) {
        setEnvVars([...envVars, newVar]);
        setNewKey("");
        setNewValue("");
        setIsSecret(false);
      }
    } catch (e) {
      console.error("Failed to add variable", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariable = async (id: string) => {
    if (!confirm("Delete this environment variable?")) return;

    try {
      await fetch(`/api/environment-vars/${id}`, { method: "DELETE" });
      setEnvVars(envVars.filter((v) => v.id !== id));
    } catch (e) {
      console.error("Failed to delete variable", e);
    }
  };

  const handleCopy = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = envVars.filter((v) => v.environment === selectedEnv);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Environment Management</h1>
        <p className="text-muted-foreground">
          Manage environment variables across development, staging, and production
        </p>
      </div>

      {/* Add Variable Panel */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Add Environment Variable</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Environment</label>
            <Select value={selectedEnv} onValueChange={(v: any) => setSelectedEnv(v)}>
              <SelectTrigger data-testid="select-environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Variable Name</label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="DATABASE_URL"
              className="w-full px-3 py-2 border rounded-md bg-background"
              data-testid="input-env-key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            <input
              type={isSecret ? "password" : "text"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-3 py-2 border rounded-md bg-background"
              data-testid="input-env-value"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                data-testid="checkbox-is-secret"
              />
              <span>Secret/Sensitive</span>
            </label>
            <Button
              onClick={handleAddVariable}
              disabled={!newKey || !newValue || loading}
              data-testid="button-add-env-var"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Environment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Development Vars</p>
          <p className="text-2xl font-bold">
            {envVars.filter((v) => v.environment === "development").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Staging Vars</p>
          <p className="text-2xl font-bold">
            {envVars.filter((v) => v.environment === "staging").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Production Vars</p>
          <p className="text-2xl font-bold text-orange-600">
            {envVars.filter((v) => v.environment === "production").length}
          </p>
        </Card>
      </div>

      {/* Variables List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {selectedEnv.charAt(0).toUpperCase() + selectedEnv.slice(1)} Variables
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No variables in this environment</p>
          ) : (
            filtered.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                data-testid={`env-var-${variable.key}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-semibold">{variable.key}</code>
                    {variable.isSecret && (
                      <Badge variant="secondary" className="text-xs">
                        Secret
                      </Badge>
                    )}
                  </div>
                  <code className="text-xs text-muted-foreground mt-1">
                    {variable.isSecret ? "••••••••••" : variable.value}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(variable.value, variable.id)}
                    data-testid={`button-copy-${variable.key}`}
                  >
                    {copied === variable.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteVariable(variable.id)}
                    data-testid={`button-delete-${variable.key}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Security Warning */}
      <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900 dark:text-orange-100">Security Notice</p>
            <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
              Never commit environment variables or secrets to version control. Always use this management interface for sensitive data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
