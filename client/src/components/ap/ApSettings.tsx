
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, Settings, Layers, List } from "lucide-react";

export default function ApSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch System Parameters
    const { data: params, isLoading: paramsLoading } = useQuery({
        queryKey: ['/api/ap/system-parameters'],
        queryFn: async () => (await apiRequest("GET", "/api/ap/system-parameters")).json()
    });

    // Fetch Distribution Sets
    const { data: distSets, isLoading: distLoading } = useQuery({
        queryKey: ['/api/ap/distribution-sets'],
        queryFn: async () => (await apiRequest("GET", "/api/ap/distribution-sets")).json()
    });

    // Form Stats
    const [priceTolerance, setPriceTolerance] = useState("");
    const [qtyTolerance, setQtyTolerance] = useState("");
    const [loadingParams, setLoadingParams] = useState(false);

    // Sync input with fetched data once
    if (params && !loadingParams && priceTolerance === "") {
        setPriceTolerance(params.priceTolerancePercent || "0");
        setQtyTolerance(params.qtyTolerancePercent || "0");
        setLoadingParams(true);
    }

    const updateParamsMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/ap/system-parameters", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Settings Saved", description: "System parameters updated successfully." });
            queryClient.invalidateQueries({ queryKey: ['/api/ap/system-parameters'] });
        }
    });

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payables Settings</h1>
                    <p className="text-muted-foreground">Configure global options and automation templates.</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="tolerances">Tolerances</TabsTrigger>
                    <TabsTrigger value="distribution">Distribution Sets</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Defaults</CardTitle>
                            <CardDescription>Set default values for new suppliers and invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Currency</Label>
                                    <Input defaultValue="USD" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Payment Terms</Label>
                                    <Input defaultValue="Immediate" disabled />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tolerances" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Validation Tolerances</CardTitle>
                            <CardDescription>Define acceptable variances for invoice validation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Price Tolerance (%)</Label>
                                    <Input
                                        type="number"
                                        value={priceTolerance}
                                        onChange={(e) => setPriceTolerance(e.target.value)}
                                        placeholder="e.g. 5"
                                    />
                                    <p className="text-xs text-muted-foreground">Allowable difference between PO Price and Invoice Price.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity Tolerance (%)</Label>
                                    <Input
                                        type="number"
                                        value={qtyTolerance}
                                        onChange={(e) => setQtyTolerance(e.target.value)}
                                        placeholder="e.g. 5"
                                    />
                                    <p className="text-xs text-muted-foreground">Allowable difference between PO Qty and Invoice Qty.</p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button onClick={() => updateParamsMutation.mutate({
                                    priceTolerancePercent: priceTolerance,
                                    qtyTolerancePercent: qtyTolerance
                                })}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Distribution Sets</CardTitle>
                                <CardDescription>Manage templates for automated expense allocation.</CardDescription>
                            </div>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Set
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array.isArray(distSets) && distSets.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                                        No distribution sets defined.
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {Array.isArray(distSets) && distSets.map((set: any) => (
                                            <div key={set.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                        <Layers className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{set.name}</p>
                                                        <p className="text-xs text-muted-foreground">{set.description || "No description"}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
