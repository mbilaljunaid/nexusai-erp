import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, ArrowUpRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SuccessionPlanning() {
  const [activeTab, setActiveTab] = useState("plans");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch Plans
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ["succession-plans"],
    queryFn: async () => {
      const res = await fetch("/api/succession/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    }
  });

  // Fetch Pools
  const { data: pools, isLoading: isPoolsLoading } = useQuery({
    queryKey: ["talent-pools"],
    queryFn: async () => {
      const res = await fetch("/api/succession/pools");
      if (!res.ok) throw new Error("Failed to fetch pools");
      return res.json();
    }
  });

  // Create Plan Mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/succession/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create plan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["succession-plans"] });
      setIsCreateOpen(false);
      toast({ title: "Succession Plan Created" });
    },
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createPlanMutation.mutate({
      name: formData.get("name"),
      status: "DRAFT",
      reviewDate: new Date().toISOString(),
    });
  };

  if (isPlansLoading || isPoolsLoading) return <div className="p-8">Loading Succession Data...</div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Succession Planning</h1>
          <p className="text-muted-foreground mt-1">Identify and develop future leaders</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Create Succession Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Succession Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input id="name" name="name" placeholder="e.g. CFO Succession 2026" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Role</Label>
                <Input id="target" name="target" placeholder="Role being planned for" />
              </div>
              <Button type="submit" className="w-full">Create Plan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Key roles covered</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Talent Pools</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pools?.length || 0}</div>
            <p className="text-xs text-muted-foreground">High potential groups</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <p className="text-xs text-muted-foreground">Ready Now candidates</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Analysis</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Critical roles vacant</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Succession Plans</TabsTrigger>
          <TabsTrigger value="pools">Talent Pools</TabsTrigger>
          <TabsTrigger value="matrix">9-Box Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {plans?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No active succession plans found. Create one to get started.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans?.map((plan: any) => (
                <Card key={plan.id} className="cursor-pointer hover:border-indigo-200 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge variant="outline">{plan.status}</Badge>
                    </div>
                    <CardDescription>Target: {plan.targetJobId || "General Leadership"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Incumbent</span>
                        <span className="font-medium">Current Occupant</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Candidates</span>
                        <span className="font-medium">0 Identified</span>
                      </div>
                      <div className="pt-2">
                        <Button variant="ghost" className="w-full h-8 text-xs">Manage Candidates</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          {pools?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No talent pools defined.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pools?.map((pool: any) => (
                <Card key={pool.id}>
                  <CardHeader>
                    <CardTitle>{pool.name}</CardTitle>
                    <CardDescription>{pool.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={pool.status === "ACTIVE" ? "default" : "secondary"}>{pool.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matrix Tab remains static/placeholder for now as it's complex visualization */}
        <TabsContent value="matrix">
          <div className="grid grid-cols-3 gap-4 h-[600px]">
            {/* Simplified 9-Box Grid Layout */}
            {["High Potential / Low Perf", "High Potential / Med Perf", "Top Talent", "Growth Employee", "Core Employee", "High Performer", "Underperformer", "Effective", "Trusted Professional"].map((box, i) => (
              <Card key={i} className={`flex flex-col items-center justify-center p-4 border-2 ${i === 2 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100'}`}>
                <h3 className="font-semibold text-center text-slate-700">{box}</h3>
                <span className="text-3xl font-bold text-slate-400 mt-2">0</span>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
