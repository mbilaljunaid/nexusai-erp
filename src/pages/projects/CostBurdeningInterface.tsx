import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, TrendingUp, CheckCircle2, AlertTriangle, Play, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/formatters";

interface BurdenSchedule {
    id: string;
    name: string;
    version: string;
    activeFlag: boolean;
}

interface BurdenRule {
    id: string;
    expenditureTypeId: string;
    expenditureTypeName: string;
    multiplier: number;
    description: string;
}

interface ExpenditureItem {
    id: string;
    taskId: string;
    taskName: string;
    expenditureTypeId: string;
    expenditureTypeName: string;
    expenditureItemDate: string;
    rawCost: number;
    burdenedCost?: number;
    status: string;
    selected?: boolean;
}

export default function CostBurdeningInterface() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
    const [expenditures, setExpenditures] = useState<ExpenditureItem[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch burden schedules
    const { data: schedules = [] } = useQuery<BurdenSchedule[]>({
        queryKey: ["burden-schedules"],
        queryFn: async () => {
            // Mock data - replace with actual API call
            return [
                { id: "1", name: "Standard Corporate Burden", version: "1.0", activeFlag: true },
                { id: "2", name: "Government Contract Burden", version: "2.0", activeFlag: true },
                { id: "3", name: "Internal Projects Burden", version: "1.5", activeFlag: false }
            ];
        }
    });

    // Fetch burden rules for selected schedule
    const { data: burdenRules = [] } = useQuery<BurdenRule[]>({
        queryKey: ["burden-rules", selectedScheduleId],
        queryFn: async () => {
            if (!selectedScheduleId) return [];
            // Mock data - replace with actual API call
            return [
                { id: "1", expenditureTypeId: "LAB-001", expenditureTypeName: "Professional Services", multiplier: 0.25, description: "25% overhead" },
                { id: "2", expenditureTypeId: "MAT-001", expenditureTypeName: "Materials", multiplier: 0.10, description: "10% handling" },
                { id: "3", expenditureTypeId: "TRV-001", expenditureTypeName: "Travel", multiplier: 0.05, description: "5% admin" }
            ];
        },
        enabled: !!selectedScheduleId
    });

    // Fetch unburdened expenditures
    const { data: rawExpenditures = [], refetch: refetchExpenditures } = useQuery<ExpenditureItem[]>({
        queryKey: ["expenditures"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/expenditures?status=UNCOSTED");
            const data = await res.json();
            return data.map((exp: any) => ({
                ...exp,
                selected: false
            }));
        }
    });

    // Apply burden mutation
    const burdenMutation = useMutation({
        mutationFn: async (costIds: string[]) => {
            const results = await Promise.all(
                costIds.map(id =>
                    fetch(`/api/ppm/costs/${id}/burden`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ scheduleId: selectedScheduleId })
                    }).then(r => r.json())
                )
            );
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenditures"] });
            setShowPreview(false);
            toast({
                title: "Burden Applied Successfully",
                description: `${selectedExpenditures.length} expenditures have been burdened.`
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Burden Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const calculateBurdenPreview = () => {
        if (!selectedScheduleId) {
            toast({
                title: "No Schedule Selected",
                description: "Please select a burden schedule first.",
                variant: "destructive"
            });
            return;
        }

        const withBurden = rawExpenditures.map(exp => {
            const rule = burdenRules.find(r => r.expenditureTypeId === exp.expenditureTypeId);
            const multiplier = rule?.multiplier || 0;
            const burdenedCost = exp.rawCost * (1 + multiplier);

            return {
                ...exp,
                burdenedCost
            };
        });

        setExpenditures(withBurden);
        setShowPreview(true);
    };

    const toggleSelection = (id: string) => {
        setExpenditures(prev =>
            prev.map(exp =>
                exp.id === id ? { ...exp, selected: !exp.selected } : exp
            )
        );
    };

    const toggleSelectAll = () => {
        const allSelected = expenditures.every(e => e.selected);
        setExpenditures(prev =>
            prev.map(exp => ({ ...exp, selected: !allSelected }))
        );
    };

    const applyBurden = () => {
        const selectedIds = selectedExpenditures.map(e => e.id);
        if (selectedIds.length === 0) {
            toast({
                title: "No Items Selected",
                description: "Select at least one expenditure to burden.",
                variant: "destructive"
            });
            return;
        }
        burdenMutation.mutate(selectedIds);
    };

    const selectedExpenditures = expenditures.filter(e => e.selected);
    const totalRawCost = selectedExpenditures.reduce((sum, e) => sum + e.rawCost, 0);
    const totalBurdenedCost = selectedExpenditures.reduce((sum, e) => sum + (e.burdenedCost || e.rawCost), 0);
    const totalBurdenAmount = totalBurdenedCost - totalRawCost;

    return (
        <StandardPage
            title="Cost Burdening Interface"
            description="Apply indirect cost multipliers to project expenditures based on burden schedules."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Cost Burdening" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Unburdened Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{rawExpenditures.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Selected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{selectedExpenditures.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Raw Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{formatCurrency(totalRawCost)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Burden Impact</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">{totalBurdenAmount >= 0 ? "+" : ""}{formatCurrency(totalBurdenAmount)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedule Selection & Rules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" /> Burden Schedule
                            </CardTitle>
                            <CardDescription>Select the burden calculation rules to apply.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Active Schedule</label>
                                <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select schedule..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schedules.filter(s => s.activeFlag).map(schedule => (
                                            <SelectItem key={schedule.id} value={schedule.id}>
                                                {schedule.name} <span className="text-xs text-muted-foreground">(v{schedule.version})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedScheduleId && burdenRules.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Multipliers</label>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {burdenRules.map(rule => (
                                            <div key={rule.id} className="p-2 bg-muted rounded-md text-xs">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium">{rule.expenditureTypeName}</span>
                                                    <Badge variant="secondary">{(rule.multiplier * 100).toFixed(0)}%</Badge>
                                                </div>
                                                <p className="text-muted-foreground text-[10px]">{rule.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={calculateBurdenPreview}
                                disabled={!selectedScheduleId}
                            >
                                <BarChart3 className="h-4 w-4 mr-2" /> Preview Burden Impact
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Expenditure List */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Expenditure Items</CardTitle>
                                    <CardDescription>Select items to burden and review cost impact.</CardDescription>
                                </div>
                                {showPreview && (
                                    <Button
                                        onClick={applyBurden}
                                        disabled={selectedExpenditures.length === 0 || burdenMutation.isPending}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {burdenMutation.isPending ? "Processing..." : "Apply Burden"}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!showPreview ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a burden schedule and click "Preview Burden Impact" to see calculations.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="max-h-96 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">
                                                        <Checkbox
                                                            checked={expenditures.length > 0 && expenditures.every(e => e.selected)}
                                                            onCheckedChange={toggleSelectAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Task</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Raw Cost</TableHead>
                                                    <TableHead className="text-right">Burden</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {expenditures.map((exp) => {
                                                    const burdenAmount = (exp.burdenedCost || exp.rawCost) - exp.rawCost;
                                                    const burdenPercent = exp.rawCost > 0 ? (burdenAmount / exp.rawCost) * 100 : 0;

                                                    return (
                                                        <TableRow key={exp.id} className={exp.selected ? "bg-blue-50" : ""}>
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={exp.selected}
                                                                    onCheckedChange={() => toggleSelection(exp.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">{exp.taskName}</TableCell>
                                                            <TableCell className="text-xs">{exp.expenditureTypeName}</TableCell>
                                                            <TableCell className="text-xs">{new Date(exp.expenditureItemDate).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-right font-medium">{formatCurrency(exp.rawCost)}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-orange-600 font-medium">{burdenAmount >= 0 ? "+" : ""}{formatCurrency(burdenAmount)}</span>
                                                                    <span className="text-[10px] text-muted-foreground">({burdenPercent.toFixed(0)}%)</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold">{formatCurrency(exp.burdenedCost || exp.rawCost)}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {selectedExpenditures.length > 0 && (
                                        <div className="flex justify-end">
                                            <Card className="w-80 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                                                <CardContent className="pt-4">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Total Raw Cost:</span>
                                                            <span className="font-medium">{formatCurrency(totalRawCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-orange-600">
                                                            <span>Burden Amount:</span>
                                                            <span className="font-medium">{totalBurdenAmount >= 0 ? "+" : ""}{formatCurrency(totalBurdenAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                            <span>Total Burdened:</span>
                                                            <span>{formatCurrency(totalBurdenedCost)}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
