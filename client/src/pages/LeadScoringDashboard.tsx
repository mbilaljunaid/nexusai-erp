import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LeadScoringDashboard() {
  const { toast } = useToast();
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", score: "", status: "new" });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/crm/leads"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      setNewLead({ name: "", email: "", company: "", score: "", status: "new" });
      toast({ title: "Lead created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/leads/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      toast({ title: "Lead deleted" });
    }
  });
  const scoreDistribution = [
    { range: "0-20", count: 45 }
    { range: "21-40", count: 32 }
    { range: "41-60", count: 28 }
    { range: "61-80", count: 18 }
    { range: "81-100", count: 12 }
  ];

  const scoreFactors = [
    { factor: "Email Engagement", weight: 25, impact: "High" }
    { factor: "Website Activity", weight: 20, impact: "High" }
    { factor: "Company Size", weight: 15, impact: "Medium" }
    { factor: "Industry Match", weight: 20, impact: "High" }
    { factor: "Job Title", weight: 20, impact: "Medium" }
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const highQuality = leads.filter((l: any) => parseFloat(l.score || 0) >= 80).length;
  const avgScore = leads.length > 0 ? (leads.reduce((sum: number, l: any) => sum + parseFloat(l.score || 0), 0) / leads.length).toFixed(1) : "0";

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Lead Scoring Dashboard</h1>
        <p className="text-muted-foreground mt-1">AI-powered lead scoring model and insights</p>
      </div>

      <Card data-testid="card-new-lead">
        <CardHeader><CardTitle className="text-base">Create Lead</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} data-testid="input-email" />
            <Input placeholder="Company" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} data-testid="input-company" />
            <Input placeholder="Score" type="number" value={newLead.score} onChange={(e) => setNewLead({ ...newLead, score: e.target.value })} data-testid="input-score" />
            <Select value={newLead.status} onValueChange={(v) => setNewLead({ ...newLead, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newLead)} disabled={createMutation.isPending || !newLead.name} className="w-full" data-testid="button-create-lead">
            <Plus className="w-4 h-4 mr-2" /> Create Lead
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-3xl font-bold mt-1">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">High Quality (80+)</p>
            <p className="text-3xl font-bold mt-1">{highQuality}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold mt-1">{avgScore}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Scoring Factors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {scoreFactors.map((factor) => (
              <div key={factor.factor} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-medium">{factor.factor}</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">{factor.weight}%</Badge>
                  <Badge className={factor.impact === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{factor.impact}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Lead Registry</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : leads.length === 0 ? <p className="text-muted-foreground text-center py-4">No leads</p> : leads.map((l: any) => (
            <div key={l.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`lead-${l.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">Email: {l.email} • Company: {l.company}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{l.score}</Badge>
                <Badge variant="secondary">{l.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(l.id)} data-testid={`button-delete-${l.id}`}>
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
