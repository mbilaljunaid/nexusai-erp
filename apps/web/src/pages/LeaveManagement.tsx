import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LeaveManagement() {
  const { toast } = useToast();
  const [newLeave, setNewLeave] = useState({ employee: "", type: "Vacation", status: "pending" });

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["/api/hr/leaves"],
    queryFn: () => fetch("/api/hr/leaves").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hr/leaves", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/leaves"] });
      setNewLeave({ employee: "", type: "Vacation", status: "pending" });
      toast({ title: "Leave request created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hr/leaves/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/leaves"] });
      toast({ title: "Leave deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Leave Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage employee leave requests</p>
      </div>

      <Card data-testid="card-request-leave">
        <CardHeader><CardTitle className="text-base">Request Leave</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Employee name" value={newLeave.employee} onChange={(e) => setNewLeave({ ...newLeave, employee: e.target.value })} data-testid="input-employee" />
            <Select value={newLeave.type} onValueChange={(v) => setNewLeave({ ...newLeave, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Vacation">Vacation</SelectItem>
                <SelectItem value="Sick">Sick</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newLeave.status} onValueChange={(v) => setNewLeave({ ...newLeave, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newLeave.employee} className="w-full" data-testid="button-create-leave">
            <Plus className="w-4 h-4 mr-2" /> Request Leave
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Requests</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Days Used</p><p className="text-2xl font-bold">7</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Leave Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : leaves.length === 0 ? <p className="text-muted-foreground text-center py-4">No leave requests</p> : leaves.map((leave: any) => (
            <div key={leave.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`leave-${leave.id}`}>
              <div>
                <h3 className="font-semibold">{leave.employee}</h3>
                <p className="text-sm text-muted-foreground">Type: {leave.type}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={leave.status === "approved" ? "default" : "secondary"}>{leave.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${leave.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
