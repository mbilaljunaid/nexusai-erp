import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, TrendingUp, Users, Building2, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BUDGET_DATA = [
    {
        dept: "Engineering", budgetedFTE: 120, actualFTE: 110.5, actualHeadcount: 112,
        positions: [
            { id: "POS-ENG-01", title: "Senior Software Engineer", budgetedFTE: 40, actualFTE: 38, headcount: 39, vacancies: 2, status: "UNDER" },
            { id: "POS-ENG-02", title: "Product Manager", budgetedFTE: 15, actualFTE: 15, headcount: 15, vacancies: 0, status: "AT_PAR" },
            { id: "POS-ENG-03", title: "DevOps Engineer", budgetedFTE: 20, actualFTE: 22, headcount: 22, vacancies: 0, status: "OVER" },
        ]
    },
    {
        dept: "Sales", budgetedFTE: 80, actualFTE: 73.0, actualHeadcount: 75,
        positions: [
            { id: "POS-SALES-01", title: "Account Executive", budgetedFTE: 50, actualFTE: 46, headcount: 47, vacancies: 4, status: "UNDER" },
            { id: "POS-SALES-02", title: "Sales Director", budgetedFTE: 8, actualFTE: 8, headcount: 8, vacancies: 0, status: "AT_PAR" },
        ]
    },
];

export default function PositionBudgetingWorkbench() {
    const { toast } = useToast();
    const [period, setPeriod] = useState("FY2026");
    const [expandedDepts, setExpandedDepts] = useState<string[]>(["Engineering"]);
    const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "reject"; posTitle: string } | null>(null);

    const totalBudgetedFTE = BUDGET_DATA.reduce((s, d) => s + d.budgetedFTE, 0);
    const totalActualFTE = BUDGET_DATA.reduce((s, d) => s + d.actualFTE, 0);
    const totalVacancies = BUDGET_DATA.flatMap(d => d.positions).reduce((s, p) => s + p.vacancies, 0);

    const toggleDept = (dept: string) =>
        setExpandedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);

    return (
        <StandardPage title="Position Budgeting Workbench" description="Compare budgeted FTE against actual headcount. Approve or freeze open vacancies by position.">
            <div className="flex items-center gap-4 mb-6">
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FY2025">FY 2025</SelectItem>
                        <SelectItem value="FY2026">FY 2026</SelectItem>
                        <SelectItem value="Q1-2026">Q1 2026</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Budgeted FTE</p><p className="text-2xl font-bold">{totalBudgetedFTE}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Actual FTE</p><p className="text-2xl font-bold">{totalActualFTE.toFixed(1)}</p></CardContent></Card>
                <Card className="border-amber-200 bg-amber-50/30"><CardContent className="p-4"><p className="text-xs text-amber-600 mb-1">FTE Gap</p><p className="text-2xl font-bold text-amber-700">{(totalBudgetedFTE - totalActualFTE).toFixed(1)}</p></CardContent></Card>
                <Card className="border-amber-200 bg-amber-50/30"><CardContent className="p-4"><p className="text-xs text-amber-600 mb-1">Open Vacancies</p><p className="text-2xl font-bold text-amber-700">{totalVacancies}</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Department / Position Drill-Down</CardTitle>
                    <CardDescription>Expand departments to approve or freeze individual vacancies.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department / Position</TableHead>
                                <TableHead className="text-center">Budgeted FTE</TableHead>
                                <TableHead className="text-center">Actual FTE</TableHead>
                                <TableHead className="text-center">Vacancies</TableHead>
                                <TableHead>Utilisation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {BUDGET_DATA.map(dept => (
                                <React.Fragment key={dept.dept}>
                                    <TableRow className="bg-muted/30 cursor-pointer font-semibold" onClick={() => toggleDept(dept.dept)}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {expandedDepts.includes(dept.dept) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                <Building2 className="h-4 w-4 text-primary" />{dept.dept}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-mono">{dept.budgetedFTE}</TableCell>
                                        <TableCell className="text-center font-mono">{dept.actualFTE}</TableCell>
                                        <TableCell className="text-center text-amber-600 font-mono">{dept.positions.reduce((s, p) => s + p.vacancies, 0)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={(dept.actualFTE / dept.budgetedFTE) * 100} className="h-2 w-24" />
                                                <span className="text-xs text-muted-foreground">{Math.round((dept.actualFTE / dept.budgetedFTE) * 100)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell /><TableCell />
                                    </TableRow>
                                    {expandedDepts.includes(dept.dept) && dept.positions.map(pos => (
                                        <TableRow key={pos.id} className="hover:bg-muted/10">
                                            <TableCell className="pl-10 text-sm">{pos.title}</TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">{pos.budgetedFTE}</TableCell>
                                            <TableCell className="text-center text-sm">{pos.actualFTE}</TableCell>
                                            <TableCell className="text-center text-sm">
                                                {pos.vacancies > 0 ? <span className="text-amber-600 font-medium">{pos.vacancies}</span> : <span className="text-muted-foreground">0</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={(pos.actualFTE / pos.budgetedFTE) * 100} className="h-2 w-24" />
                                                    <span className="text-xs text-muted-foreground">{Math.round((pos.actualFTE / pos.budgetedFTE) * 100)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={pos.status === "UNDER" ? "border-amber-400 text-amber-700 bg-amber-50" : pos.status === "OVER" ? "border-red-400 text-red-700 bg-red-50" : "border-emerald-400 text-emerald-700 bg-emerald-50"}>
                                                    {pos.status === "UNDER" ? "Under Budget" : pos.status === "OVER" ? "Over Budget" : "At Par"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {pos.vacancies > 0 && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-emerald-600 h-7" onClick={() => setConfirmAction({ type: "approve", posTitle: pos.title })}>
                                                            <CheckCircle2 className="h-3 w-3" /> Approve
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-red-500 h-7" onClick={() => setConfirmAction({ type: "reject", posTitle: pos.title })}>
                                                            <XCircle className="h-3 w-3" /> Freeze
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmAction?.type === "approve" ? "Approve Vacancy" : "Freeze Vacancy"}</DialogTitle>
                        <DialogDescription>
                            {confirmAction?.type === "approve"
                                ? `Approving "${confirmAction.posTitle}" allows recruitment to proceed immediately.`
                                : `Freezing "${confirmAction.posTitle}" prevents new requisitions until unblocked.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                        <Button
                            variant={confirmAction?.type === "approve" ? "default" : "destructive"}
                            onClick={() => {
                                toast({ title: confirmAction?.type === "approve" ? "Vacancy Approved" : "Vacancy Frozen", description: confirmAction?.posTitle });
                                setConfirmAction(null);
                            }}
                        >
                            {confirmAction?.type === "approve" ? "Confirm Approval" : "Confirm Freeze"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
