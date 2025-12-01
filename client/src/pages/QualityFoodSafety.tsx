import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QualityFoodSafety() {
  const { toast } = useToast();
  const [newTest, setNewTest] = useState({ testId: "", batchId: "", testType: "microbial", result: "pass" });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["/api/fb-quality"],
    queryFn: () => fetch("/api/fb-quality").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-quality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-quality"] });
      setNewTest({ testId: "", batchId: "", testType: "microbial", result: "pass" });
      toast({ title: "QC test recorded" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-quality/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-quality"] });
      toast({ title: "Test deleted" });
    },
  });

  const passed = tests.filter((t: any) => t.result === "pass").length;
  const failed = tests.filter((t: any) => t.result === "fail").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="h-8 w-8" />
          Quality, LIMS & Food Safety
        </h1>
        <p className="text-muted-foreground mt-2">HACCP plans, CCP, QC testing, LIMS integration, NCR, and compliance audits</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tests</p>
            <p className="text-2xl font-bold">{tests.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Passed</p>
            <p className="text-2xl font-bold text-green-600">{passed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-red-600">{failed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pass Rate</p>
            <p className="text-2xl font-bold">{tests.length > 0 ? ((passed / tests.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-test">
        <CardHeader><CardTitle className="text-base">Record QC Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Test ID" value={newTest.testId} onChange={(e) => setNewTest({ ...newTest, testId: e.target.value })} data-testid="input-tid" className="text-sm" />
            <Input placeholder="Batch ID" value={newTest.batchId} onChange={(e) => setNewTest({ ...newTest, batchId: e.target.value })} data-testid="input-bid" className="text-sm" />
            <Input placeholder="Test Type" value={newTest.testType} onChange={(e) => setNewTest({ ...newTest, testType: e.target.value })} data-testid="input-type" className="text-sm" />
            <Input placeholder="Result" disabled value={newTest.result} data-testid="input-result" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newTest)} disabled={createMutation.isPending || !newTest.testId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">QC Tests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tests.length === 0 ? <p className="text-muted-foreground text-center py-4">No tests</p> : tests.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`test-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.testId}</p>
                <p className="text-xs text-muted-foreground">Batch: {t.batchId} • {t.testType}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.result === "pass" ? "default" : "destructive"} className="text-xs">{t.result}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
