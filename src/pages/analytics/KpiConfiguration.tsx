
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function KpiConfiguration() {
    const { toast } = useToast();
    const [selectedKpi, setSelectedKpi] = useState<any>(null);

    const { data: kpis = [], isLoading } = useQuery({
        queryKey: ["/api/hr/config/kpis"],
        queryFn: () => fetch("/api/hr/config/kpis").then(r => r.json())
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/hr/config/kpis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/config/kpis"] });
            toast({ title: "KPI Definition Updated" });
            setSelectedKpi(null);
        }
    });

    const columns: SpreadsheetColumn<any>[] = [
        { id: "name", header: "KPI Name", width: "200px", cell: (r) => <div className="p-2">{r.name}</div> },
        { id: "code", header: "Code", width: "150px", cell: (r) => <div className="p-2">{r.code}</div> },
        { id: "category", header: "Category", width: "150px", cell: (r) => <div className="p-2">{r.category}</div> },
        { id: "periodicity", header: "Frequency", width: "150px", cell: (r) => <div className="p-2">{r.periodicity}</div> },
        { id: "isActive", header: "Active", width: "100px", cell: (r) => <div className="p-2">{r.isActive ? "Yes" : "No"}</div> },
        {
            id: "actions", header: "Actions", width: "100px", cell: (row) => (
                <div className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedKpi(row)}>Edit</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 p-4">
            <div>
                <h1 className="text-3xl font-semibold flex items-center gap-2">
                    <Settings className="w-8 h-8 text-gray-600" />
                    KPI Configuration
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Manage definitions and logic for HR Metrics ("FastFormula" Editor)</p>
            </div>

            <Card>
                <CardHeader><CardTitle>Metric Repository</CardTitle></CardHeader>
                <CardContent>
                    <InteractiveSpreadsheet
                        data={kpis}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true} containerHeight="400px"
                    />
                </CardContent>
            </Card>

            {/* KPI Editor Sheet */}
            <Sheet open={!!selectedKpi} onOpenChange={(o) => !o && setSelectedKpi(null)}>
                <SheetContent className="w-[600px] sm:w-[500px]">
                    <SheetHeader>
                        <SheetTitle>Edit Metric: {selectedKpi?.name}</SheetTitle>
                        <SheetDescription>Update the calculation logic and targets.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Code (Immutable)</Label>
                                <Input value={selectedKpi?.code || ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={selectedKpi?.category || ""} disabled />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Target Value</Label>
                            <Input
                                type="number"
                                value={selectedKpi?.targetValue || ""}
                                onChange={(e) => setSelectedKpi({ ...selectedKpi, targetValue: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Calculation Logic (SQL / FastFormula)</Label>
                                <span className="text-xs text-muted-foreground">Read-only in V1 GUI</span>
                            </div>
                            <Textarea
                                className="h-32 font-mono text-xs bg-muted"
                                value={selectedKpi?.sqlLogic || "-- Logic defined in backend service --"}
                                onChange={(e) => setSelectedKpi({ ...selectedKpi, sqlLogic: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={selectedKpi?.isActive}
                                onCheckedChange={(c) => setSelectedKpi({ ...selectedKpi, isActive: c })}
                            />
                            <Label>Metric Active</Label>
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedKpi(null)}>Cancel</Button>
                            <Button onClick={() => updateMutation.mutate(selectedKpi)} disabled={updateMutation.isPending}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
