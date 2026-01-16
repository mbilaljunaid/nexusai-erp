import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Handshake, Plus, Trash2, Activity, UserPlus, Users, MessageSquare } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupplierOnboardingWorkbench from "@/components/procurement/SupplierOnboardingWorkbench";
import ContractWorkbench from "@/components/procurement/ContractWorkbench";

export default function SupplierCollaborationPortal() {
  const { toast } = useToast();
  const [newInteraction, setNewInteraction] = useState({ supplier: "", type: "po-confirm", referenceId: "", status: "pending" });

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ["/api/supplier-collab"],
    queryFn: () => fetch("/api/supplier-collab").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/supplier-collab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-collab"] });
      setNewInteraction({ supplier: "", type: "po-confirm", referenceId: "", status: "pending" });
      toast({ title: "Interaction logged" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/supplier-collab/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-collab"] });
      toast({ title: "Interaction deleted" });
    },
  });

  const completed = interactions.filter((i: any) => i.status === "completed").length;
  const pending = interactions.filter((i: any) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Handshake className="h-8 w-8 text-primary" />
            Supplier Collaboration Portal
          </h1>
          <p className="text-muted-foreground mt-1">Holistic management of supplier lifecycle and transactional performance.</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="w-4 h-4" /> Performance Dashboard
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <UserPlus className="w-4 h-4" /> Onboard Requests
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="w-4 h-4" /> Contracts
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="w-4 h-4" /> Supplier Master
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Portal Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-none border-muted/60">
              <CardContent className="pt-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Interactions</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold">{interactions.length}</p>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 border-green-500/20">Active</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-muted/60">
              <CardContent className="pt-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Tasks</p>
                <p className="text-3xl font-bold text-amber-500 mt-2">{pending}</p>
              </CardContent>
            </Card>
            <Card className="shadow-none border-muted/60">
              <CardContent className="pt-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{completed}</p>
              </CardContent>
            </Card>
            <Card className="shadow-none border-muted/60">
              <CardContent className="pt-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SLA Compliance</p>
                <p className="text-3xl font-bold mt-2">{interactions.length > 0 ? ((completed / interactions.length) * 100).toFixed(0) : 0}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Log Interaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Supplier Name</label>
                    <Input placeholder="Search supplier..." value={newInteraction.supplier} onChange={(e) => setNewInteraction({ ...newInteraction, supplier: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Interaction Type</label>
                    <Select value={newInteraction.type} onValueChange={(v) => setNewInteraction({ ...newInteraction, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rfq">Request for Quotation (RFQ)</SelectItem>
                        <SelectItem value="po-confirm">Purchase Order Confirmation</SelectItem>
                        <SelectItem value="asn">Advance Ship Notice (ASN)</SelectItem>
                        <SelectItem value="invoice">Supplier Invoice Submission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Reference Number</label>
                    <Input placeholder="PO-XXXXX" value={newInteraction.referenceId} onChange={(e) => setNewInteraction({ ...newInteraction, referenceId: e.target.value })} />
                  </div>
                  <Button className="w-full" disabled={createMutation.isPending || !newInteraction.supplier} onClick={() => createMutation.mutate(newInteraction)}>
                    <Plus className="w-4 h-4 mr-2" /> Log Interaction
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-2 space-y-4">
              <Card className="bg-muted/10 border-dashed">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Recent Collaboration Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-8">View All</Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <p>Loading activity feed...</p>
                  ) : interactions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-background">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                      <p className="text-muted-foreground text-sm font-medium">No collaboration history yet</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Manual logs and automated portal events will appear here.</p>
                    </div>
                  ) : (
                    interactions.map((i: any) => (
                      <div key={i.id} className="p-3 bg-background border rounded-lg hover:border-primary/30 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{i.supplier}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{i.type} • REF: {i.referenceId}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <Badge variant={i.status === "completed" ? "default" : "secondary"} className="text-[10px] h-5">
                            {i.status}
                          </Badge>
                          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteMutation.mutate(i.id)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <SupplierOnboardingWorkbench />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractWorkbench />
        </TabsContent>

        <TabsContent value="suppliers">
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="h-[400px] flex flex-col items-center justify-center text-center space-y-3">
              <Users className="w-12 h-12 text-muted-foreground opacity-20" />
              <div>
                <CardTitle className="text-lg">Supplier Master Directory</CardTitle>
                <CardDescription>Comprehensive list of all approved and active vendors.</CardDescription>
              </div>
              <Button variant="outline" size="sm">Access Master Data</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="h-[400px] flex flex-col items-center justify-center text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-muted-foreground opacity-20" />
              <div>
                <CardTitle className="text-lg">Supplier Messaging Hub</CardTitle>
                <CardDescription>Secure direct communication with external supplier portal users.</CardDescription>
              </div>
              <Badge variant="secondary">Phase 3 Implementation</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
