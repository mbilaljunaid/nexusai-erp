import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Play, Info, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ABCClassInfo {
    className: string;
    percentageItems: number;
    percentageValue: number;
}

export default function ABCClassificationSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Mock State for Setup configuration (To be wired to Drizzle on backend later)
    const [criteria, setCriteria] = useState("CURRENT_ONHAND_VALUE");
    const [classes, setClasses] = useState<ABCClassInfo[]>([
        { className: "A", percentageItems: 20, percentageValue: 80 },
        { className: "B", percentageItems: 30, percentageValue: 15 },
        { className: "C", percentageItems: 50, percentageValue: 5 },
    ]);

    const { data: compileHistory, isLoading } = useQuery({
        queryKey: ["/api/inventory/abc-compiles"],
        queryFn: async () => {
            // Stub until backend route is built
            return [
                { id: "CMP-1002", date: "2026-03-05", criteria: "CURRENT_ONHAND_VALUE", itemTotal: 450, status: "COMPLETED" },
                { id: "CMP-1001", date: "2026-02-01", criteria: "HISTORICAL_USAGE_VALUE", itemTotal: 442, status: "COMPLETED" }
            ];
        }
    });

    const compileMutation = useMutation({
        mutationFn: async () => {
            // Simulate backend generation
            return new Promise(resolve => setTimeout(resolve, 1500));
        },
        onSuccess: () => {
            toast({ title: "ABC Compile Initiated", description: "The classification engine is evaluating items in the background.", variant: "default" });
        }
    });

    const handleUpdateClass = (index: number, field: keyof ABCClassInfo, value: number) => {
        const newClasses = [...classes];
        newClasses[index] = { ...newClasses[index], [field]: value };
        setClasses(newClasses);
    };

    const totalItems = classes.reduce((sum, c) => sum + c.percentageItems, 0);
    const totalValue = classes.reduce((sum, c) => sum + c.percentageValue, 0);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">ABC Classification Setup</h1>
                    <p className="text-muted-foreground mt-1">Configure criteria and class constraints for automatic inventory value categorization.</p>
                </div>
                <Button onClick={() => compileMutation.mutate()} disabled={compileMutation.isPending || totalItems !== 100 || totalValue !== 100}>
                    <Play className="w-4 h-4 mr-2" />
                    {compileMutation.isPending ? "Compiling..." : "Run ABC Compile"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Compilation Criteria</CardTitle>
                        <CardDescription>Determine how the engine ranks your item catalog.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ranking Criteria</Label>
                            <Select value={criteria} onValueChange={setCriteria}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT_ONHAND_VALUE">Current On-Hand Value</SelectItem>
                                    <SelectItem value="HISTORICAL_USAGE_VALUE">Historical Usage Value (12 Mo)</SelectItem>
                                    <SelectItem value="HISTORICAL_USAGE_QTY">Historical Usage Volume (12 Mo)</SelectItem>
                                    <SelectItem value="FUTURE_DEMAND_VALUE">Future Demand Value (MRP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-md border text-sm text-primary flex gap-3">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>The engine will sort all items in the inventory organization descending by <strong>{criteria.replace(/_/g, " ")}</strong> before partitioning them into the classes defined below.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Class Distribution Rules</CardTitle>
                        <CardDescription>Define the percentage constraints for partitioning.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {classes.map((c, i) => (
                                <div key={c.className} className="flex items-center gap-4">
                                    <div className="w-16 font-bold text-center bg-muted py-2 rounded">
                                        Class {c.className}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Item Qty %</Label>
                                        <Input
                                            type="number"
                                            value={c.percentageItems}
                                            onChange={(e) => handleUpdateClass(i, "percentageItems", parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Value % Target</Label>
                                        <Input
                                            type="number"
                                            value={c.percentageValue}
                                            onChange={(e) => handleUpdateClass(i, "percentageValue", parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t flex justify-between text-sm font-medium">
                                <span className={totalItems === 100 ? "text-green-600" : "text-destructive"}>
                                    Total Items: {totalItems}%
                                </span>
                                <span className={totalValue === 100 ? "text-green-600" : "text-destructive"}>
                                    Total Value: {totalValue}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Compilation History</CardTitle>
                    <CardDescription>Log of past ABC engine runs and assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Compile ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Ranking Criteria</TableHead>
                                <TableHead className="text-right">Items Classified</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {compileHistory?.map((compile: any) => (
                                <TableRow key={compile.id}>
                                    <TableCell className="font-medium">{compile.id}</TableCell>
                                    <TableCell>{compile.date}</TableCell>
                                    <TableCell>{compile.criteria}</TableCell>
                                    <TableCell className="text-right">{compile.itemTotal}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                            {compile.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!compileHistory || compileHistory.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No compilations run yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
