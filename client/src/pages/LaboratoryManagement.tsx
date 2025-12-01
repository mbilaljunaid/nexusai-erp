import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Microscope, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LaboratoryManagement() {
  const { toast } = useToast();
  const [newTest, setNewTest] = useState({ testId: "", specimenId: "", testType: "blood", status: "pending" });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-labs"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-labs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-labs"] });
      setNewTest({ testId: "", specimenId: "", testType: "blood", status: "pending" });
      toast({ title: "Lab test created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-labs/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-labs"] });
      toast({ title: "Test deleted" });
    }
  });

  const completed = tests.filter((t: any) => t.status === "completed").length;
  const pending = tests.filter((t: any) => t.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Microscope className="h-8 w-8" />
          Laboratory Information System (LIS)
        </h1>
        <p className="text-muted-foreground mt-2">Test orders, specimen collection, result entry, QC, and critical value alerts</p>
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
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{tests.length > 0 ? ((completed / tests.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-test">
        <CardHeader><CardTitle className="text-base">Order Lab Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Test ID" value={newTest.testId} onChange={(e) => setNewTest({ ...newTest, testId: e.target.value })} data-testid="input-testid" className="text-sm" />
            <Input placeholder="Specimen ID" value={newTest.specimenId} onChange={(e) => setNewTest({ ...newTest, specimenId: e.target.value })} data-testid="input-specid" className="text-sm" />
            <Select value={newTest.testType} onValueChange={(v) => setNewTest({ ...newTest, testType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blood">Blood</SelectItem>
                <SelectItem value="urine">Urine</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTest.status} onValueChange={(v) => setNewTest({ ...newTest, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newTest)} disabled={createMutation.isPending || !newTest.testId} size="sm" data-testid="button-order">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tests.length === 0 ? <p className="text-muted-foreground text-center py-4">No tests</p> : tests.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`test-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.testId}</p>
                <p className="text-xs text-muted-foreground">Specimen: {t.specimenId} • Type: {t.testType}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "completed" ? "default" : "secondary"} className="text-xs">{t.status}</Badge>
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
