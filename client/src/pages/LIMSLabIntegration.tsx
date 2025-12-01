import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TestTubes, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LIMSLabIntegration() {
  const { toast } = useToast();
  const [newTest, setNewTest] = useState({ sampleId: "", testType: "chemical", result: "pending", status: "active" });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["/api/lab-tests"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/lab-tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-tests"] });
      setNewTest({ sampleId: "", testType: "chemical", result: "pending", status: "active" });
      toast({ title: "Test created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/lab-tests/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-tests"] });
      toast({ title: "Test deleted" });
    }
  });

  const passed = tests.filter((t: any) => t.result === "pass").length;
  const pending = tests.filter((t: any) => t.result === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTubes className="h-8 w-8" />
          LIMS & Lab Information Management
        </h1>
        <p className="text-muted-foreground mt-2">Sample tracking, test result capture, and QC integration</p>
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
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
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
            <p className="text-xs text-muted-foreground">Pass Rate</p>
            <p className="text-2xl font-bold">{tests.length > 0 ? ((passed / tests.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-test">
        <CardHeader><CardTitle className="text-base">Create Lab Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Sample ID" value={newTest.sampleId} onChange={(e) => setNewTest({ ...newTest, sampleId: e.target.value })} data-testid="input-sampleid" className="text-sm" />
            <Select value={newTest.testType} onValueChange={(v) => setNewTest({ ...newTest, testType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chemical">Chemical</SelectItem>
                <SelectItem value="microbial">Microbial</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Result" value={newTest.result} onChange={(e) => setNewTest({ ...newTest, result: e.target.value })} data-testid="input-result" className="text-sm" />
            <Select value={newTest.status} onValueChange={(v) => setNewTest({ ...newTest, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newTest)} disabled={createMutation.isPending || !newTest.sampleId} size="sm" data-testid="button-create-test">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Lab Tests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tests.length === 0 ? <p className="text-muted-foreground text-center py-4">No tests</p> : tests.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`test-${t.id}`}>
              <div>
                <p className="font-semibold">{t.sampleId}</p>
                <p className="text-xs text-muted-foreground">{t.testType}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.result === "pass" ? "default" : t.result === "pending" ? "secondary" : "destructive"} className="text-xs">{t.result}</Badge>
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
