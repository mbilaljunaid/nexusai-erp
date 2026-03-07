import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";


export default function APIGateway() {
  const [newKey, setNewKey] = useState({ name: "" });
  const [showSecrets, setShowSecrets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const tenantId = "tenant1";
  const formMetadata = getFormMetadata("apiGateway");

  const { data: apiKeys = [] } = useQuery<any>({
    queryKey: ["/api/api-keys", tenantId],
    queryFn: () => fetch(`/api/api-keys?tenantId=${tenantId}`).then(r => r.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tenantId, permissions: ["read", "write"] })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys", tenantId] });
      setNewKey({ name: "" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/api-keys/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys", tenantId] });
    }
  });

  const toggleSecret = (id: string) => {
    setShowSecrets(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <StandardPage title="API Gateway">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={apiKeys} onFilter={setFiltered} />

      <div>

        <p className="text-muted-foreground">Manage API keys and authentication tokens</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>
        <div className="space-y-4">
          <Input
            placeholder="Key Name (e.g., Production API, Mobile App)"
            value={newKey.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKey({ ...newKey, name: e.target.value })}
            data-testid="input-api-key-name"
          />
          <Button
            onClick={() => createMutation.mutate(newKey)}
            disabled={!newKey.name || createMutation.isPending}
            data-testid="button-create-api-key"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create API Key"}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active API Keys ({apiKeys.length})</h2>
        <div className="grid gap-4">
          {apiKeys.map((key: any) => (
            <Card key={key.id} className="p-4 hover-elevate">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`text-key-${key.id}`}>{key.name}</h3>
                    <p className="text-xs text-muted-foreground">Created: {formatDate(key.createdAt)}</p>
                  </div>
                  <StatusBadge status={key.status} />
                </div>

                <div className="bg-muted dark:bg-gray-900 p-3 rounded font-mono text-sm break-all flex justify-between items-center">
                  <span data-testid={`key-value-${key.id}`}>
                    {showSecrets.includes(key.id) ? key.key : '••••••••' + key.key.slice(-4)}
                  </span>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleSecret(key.id)}
                      data-testid={`button-toggle-${key.id}`}
                      className="h-8 w-8" aria-label="Toggle secret visibility"
                    >
                      {showSecrets.includes(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(key.key)}
                      data-testid={`button-copy-${key.id}`}
                      className="h-8 w-8" aria-label="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 justify-between items-center">
                  <div className="flex gap-1">
                    {key.permissions.map((perm: string) => (
                      <span key={perm} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(key.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${key.id}`}
                    className="h-8 w-8 text-red-500" aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {apiKeys.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No API keys yet. Create one to get started.</p>
            </Card>
          )}
        </div>
      </div>
    </StandardPage>
  );
}
