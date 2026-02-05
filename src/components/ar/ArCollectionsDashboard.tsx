import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Play } from "lucide-react";
import { ArCollectorWorklist } from "./ArCollectorWorklist";
import { ArDunningTemplates } from "./ArDunningTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ArCollectionsDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Metric: Tasks Open
    const { data: tasks } = useQuery<any[]>({ queryKey: ["/api/ar/collections/tasks", { status: "Open" }] });

    const startRunMutation = useMutation({
        mutationFn: async () => {
            return await api.ar.dunning.run.create();
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/collections/tasks"] });
            toast({
                title: "Dunning Run Completed",
                description: `Processed ${data.run.totalInvoicesProcessed} invoices. Generated ${data.run.totalLettersGenerated} new tasks.`
            });
        },
        onError: (err: any) => {
            toast({ title: "Run Failed", description: err.message, variant: "destructive" });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Collections Center</h2>
                <Button onClick={() => startRunMutation.mutate()} disabled={startRunMutation.isPending}>
                    <Play className="w-4 h-4 mr-2" />
                    {startRunMutation.isPending ? "Running..." : "Start Dunning Run"}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Collector Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks ? tasks.length : 0}</div>
                        <p className="text-xs text-muted-foreground">Require action</p>
                    </CardContent>
                </Card>
                {/* Add more metrics here later (e.g. Total Overdue Amount) */}
            </div>

            <Tabs defaultValue="worklist" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="worklist">My Worklist</TabsTrigger>
                    <TabsTrigger value="templates">Dunning Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="worklist" className="space-y-4">
                    <ArCollectorWorklist />
                </TabsContent>
                <TabsContent value="templates" className="space-y-4">
                    <ArDunningTemplates />
                </TabsContent>
            </Tabs>
        </div>
    );
}
