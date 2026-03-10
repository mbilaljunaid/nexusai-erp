import React, { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { BadgePercent, DollarSign, Calculator, SendToBack, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorkforceCompensationWorkbench() {
    const { toast } = useToast();

    // Budget Configuration
    const BUDGET_POOL = 150000;

    // Mock team data for allocation
    const [team, setTeam] = useState([
        { id: "EMP-101", name: "Jane Doe", rating: "Exceeds (5)", base: 140000, increasePct: 5, bonus: 15000 },
        { id: "EMP-102", name: "John Smith", rating: "Meets (3)", base: 115000, increasePct: 3, bonus: 8000 },
        { id: "EMP-103", name: "Emily Chen", rating: "Meets (3)", base: 125000, increasePct: 3, bonus: 9000 },
        { id: "EMP-104", name: "Michael V.", rating: "Needs Dev (2)", base: 95000, increasePct: 0, bonus: 0 },
        { id: "EMP-105", name: "Sarah K.", rating: "Outstanding (6)", base: 160000, increasePct: 7, bonus: 25000 }
    ]);

    const handleIncreaseChange = (id: string, val: number[]) => {
        setTeam(team.map(t => t.id === id ? { ...t, increasePct: val[0] } : t));
    };

    const handleBonusChange = (id: string, val: string) => {
        setTeam(team.map(t => t.id === id ? { ...t, bonus: parseInt(val) || 0 } : t));
    };

    // Derived allocations
    const totalAllocated = useMemo(() => {
        return team.reduce((acc, emp) => {
            const meritAmount = emp.base * (emp.increasePct / 100);
            return acc + meritAmount + emp.bonus;
        }, 0);
    }, [team]);

    const remainingBudget = BUDGET_POOL - totalAllocated;
    const isOverBudget = remainingBudget < 0;

    const handleSubmit = () => {
        if (isOverBudget) {
            toast({ title: "Over Budget", description: "You cannot submit allocations exceeding the approved pool.", variant: "destructive" });
            return;
        }
        toast({ title: "Allocations Submitted", description: "Merit and bonus numbers sent to HR for final approval." });
    };

    return (
        <StandardPage title="Workforce Compensation Workbench">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Allocate annual merit increases and performance bonuses across your direct reports.</p>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"><Sparkles className="h-4 w-4" /> AI Auto-Allocate</Button>
            </div>

            {/* Budget Dashboard */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Pool Budget</div>
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="text-3xl font-bold">${BUDGET_POOL.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Allocated</div>
                            <Calculator className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold">${totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </CardContent>
                </Card>
                <Card className={isOverBudget ? "border-red-500 bg-red-50/50" : "border-emerald-200 bg-emerald-50/50"}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`text-sm font-bold uppercase tracking-wider ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
                                {isOverBudget ? 'Budget Exceeded' : 'Remaining To Allocate'}
                            </div>
                            <BadgePercent className={`h-5 w-5 ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`} />
                        </div>
                        <div className={`text-3xl font-bold ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
                            ${Math.abs(remainingBudget).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Allocations (FY26 Cycle)</CardTitle>
                    <CardDescription>Adjust sliders for merit increases and input raw bonus amounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Perf. Rating</TableHead>
                                <TableHead>Current Base</TableHead>
                                <TableHead className="w-[200px]">Merit Increase (%)</TableHead>
                                <TableHead>New Base</TableHead>
                                <TableHead className="w-[150px]">Bonus Amount</TableHead>
                                <TableHead className="text-right">Total Impact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {team.map(emp => {
                                const meritAmount = emp.base * (emp.increasePct / 100);
                                const newBase = emp.base + meritAmount;
                                const impact = meritAmount + emp.bonus;

                                return (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="font-bold">{emp.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{emp.id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                emp.rating.includes('Exceeds') || emp.rating.includes('Outstanding') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                                    emp.rating.includes('Meets') ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                                        'border-amber-200 bg-amber-50 text-amber-700'
                                            }>
                                                {emp.rating}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">${emp.base.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Slider
                                                    max={15} step={0.5}
                                                    value={[emp.increasePct]}
                                                    onValueChange={(val) => handleIncreaseChange(emp.id, val)}
                                                    className="w-[100px]"
                                                />
                                                <span className="font-bold text-sm w-10">{emp.increasePct}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-emerald-700 font-bold">${newBase.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="number"
                                                    title="Bonus Amount"
                                                    placeholder="0"
                                                    className="flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={emp.bonus}
                                                    onChange={e => handleBonusChange(emp.id, e.target.value)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold">
                                            ${impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="mt-8 flex justify-end">
                        <Button
                            size="lg"
                            className="gap-2"
                            disabled={isOverBudget}
                            onClick={handleSubmit}
                        >
                            <SendToBack className="h-4 w-4" /> Submit for HR Approval
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </StandardPage>
    );
}
