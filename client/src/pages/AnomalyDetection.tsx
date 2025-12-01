import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2, Zap } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AnomalyDetection() {
  const { toast } = useToast();
  const [newRule, setNewRule] = useState({ metric: "Revenue", threshold: "20", frequency: "daily", recipients: "" });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["/api/anomaly-rules"]
    
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ["/api/anomalies"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/anomaly-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anomaly-rules"] });
      setNewRule({ metric: "Revenue", threshold: "20", frequency: "daily", recipients: "" });
      toast({ title: "Anomaly rule created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/anomaly-rules/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anomaly-rules"] });
      toast({ title: "Anomaly rule deleted" });
    }
  });

  const detectedAnomalies = anomalies.filter((a: any) => a.status === "detected");

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Anomaly Detection
        </h1>
        <p className="text-muted-foreground mt-2">Monitor metrics and detect unusual patterns</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Rules</p>
            <p className="text-2xl font-bold">{rules.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Anomalies Detected</p>
            <p className="text-2xl font-bold text-red-600">{detectedAnomalies.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Monitored</p>
            <p className="text-2xl font-bold">{anomalies.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Detection Rate</p>
            <p className="text-2xl font-bold text-green-600">92%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-rule">
        <CardHeader><CardTitle className="text-base">Create Detection Rule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Select value={newRule.metric} onValueChange={(v) => setNewRule({ ...newRule, metric: v })}>
              <SelectTrigger data-testid="select-metric"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Orders">Orders</SelectItem>
                <SelectItem value="Costs">Costs</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Threshold %" type="number" value={newRule.threshold} onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })} data-testid="input-threshold" />
            <Select value={newRule.frequency} onValueChange={(v) => setNewRule({ ...newRule, frequency: v })}>
              <SelectTrigger data-testid="select-frequency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Recipients" value={newRule.recipients} onChange={(e) => setNewRule({ ...newRule, recipients: e.target.value })} data-testid="input-recipients" />
          </div>
          <Button onClick={() => createMutation.mutate(newRule)} disabled={createMutation.isPending || !newRule.metric} className="w-full" data-testid="button-create-rule">
            <Plus className="w-4 h-4 mr-2" /> Create Rule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Monitoring Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : rules.length === 0 ? <p className="text-muted-foreground text-center py-4">No rules</p> : rules.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`rule-${r.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{r.metric}</h3>
                <p className="text-sm text-muted-foreground">Threshold: {r.threshold}% • Frequency: {r.frequency}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Anomalies</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {anomalies.length === 0 ? <p className="text-muted-foreground text-center py-4">No anomalies</p> : anomalies.slice(0, 5).map((a: any) => (
            <div key={a.id} className="p-3 border rounded-lg" data-testid={`anomaly-${a.id}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{a.metric}</p>
                <Badge variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "secondary" : "default"}>{a.severity}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Detected: {a.detectedAt} • Value: {a.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
