import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings2, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function GradeLadderSetup() {
    const [ladder, setLadder] = useState("GS");

    // Mock GS (General Schedule) representation
    const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const grades = [
        { grade: "GS-07", base: 43646, stepAmount: 1455 },
        { grade: "GS-08", base: 48332, stepAmount: 1611 },
        { grade: "GS-09", base: 53512, stepAmount: 1784 },
        { grade: "GS-10", base: 58930, stepAmount: 1964 }
    ];

    const calculateStep = (base: number, stepAmount: number, stepIndex: number) => {
        return base + (stepAmount * stepIndex);
    };

    return (
        <StandardPage title="Grade Ladder Setup">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Configure standardized pay grades, step progressions, and progression rules.</p>
                <div className="flex gap-3">
                    <Select value={ladder} onValueChange={setLadder}>
                        <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GS">Federal GS Scale</SelectItem>
                            <SelectItem value="TECH">Engineering IC Scale</SelectItem>
                            <SelectItem value="EXEC">Executive Level</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="gap-2"><Plus className="h-4 w-4" /> New Grade</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">{ladder} Pay Scale Matrix</CardTitle>
                    <CardDescription>Step-based compensation matrix for the selected ladder.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table className="whitespace-nowrap">
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-bold border-r min-w-[120px]">Grade</TableHead>
                                    {steps.map(s => (
                                        <TableHead key={s} className="text-center w-[100px]">Step {s}</TableHead>
                                    ))}
                                    <TableHead className="text-right border-l">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grades.map((g) => (
                                    <TableRow key={g.grade}>
                                        <TableCell className="font-bold border-r bg-muted/20">
                                            {g.grade}
                                            <div className="text-[10px] text-muted-foreground font-normal">+${g.stepAmount.toLocaleString()}/step</div>
                                        </TableCell>

                                        {steps.map((s, idx) => (
                                            <TableCell key={s} className="text-center font-mono text-xs hover:bg-muted/50 cursor-crosshair">
                                                ${calculateStep(g.base, g.stepAmount, idx).toLocaleString()}
                                            </TableCell>
                                        ))}

                                        <TableCell className="text-right border-l">
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="h-3 w-3" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        <div className="border rounded-lg p-4 bg-[#fafafa] dark:bg-zinc-950">
                            <h4 className="font-bold text-sm flex items-center gap-2 mb-3"><ArrowUpRight className="h-4 w-4 text-emerald-600" /> Progression Rules</h4>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li className="flex gap-2"><div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Steps 1-3: 1 year of acceptable performance</li>
                                <li className="flex gap-2"><div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Steps 4-6: 2 years of acceptable performance</li>
                                <li className="flex gap-2"><div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Steps 7-9: 3 years of acceptable performance</li>
                            </ul>
                        </div>
                        <div className="border rounded-lg p-4 bg-[#fafafa] dark:bg-zinc-950">
                            <h4 className="font-bold text-sm flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-blue-600" /> Compliance Guards</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Hard stops are enabled on this ladder. Managers cannot assign base salaries outside the defined matrix limits during compensation benching.
                            </p>
                            <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">Strict Enforcement Mode</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </StandardPage>
    );
}
