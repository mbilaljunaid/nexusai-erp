import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeftRight, Calculator, BadgePercent } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PayrollSimulator() {
    // Current Baseline
    const BASE_SALARY = 120000;
    const [increase, setIncrease] = useState([5]); // 5% default
    const [bonus, setBonus] = useState([10]); // 10% default
    const TAX_RATE = 0.24;

    const newSalary = BASE_SALARY * (1 + (increase[0] / 100));
    const bonusAmount = newSalary * (bonus[0] / 100);
    const newTotal = newSalary + bonusAmount;

    // Monthly Baseline
    const baseMonthlyGross = BASE_SALARY / 12;
    const baseMonthlyNet = baseMonthlyGross * (1 - TAX_RATE);

    // Monthly Simulated
    const simMonthlyGross = newTotal / 12;
    const simMonthlyNet = simMonthlyGross * (1 - TAX_RATE);

    return (
        <StandardPage title="Payroll Simulator">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Model "What-If" compensation changes and visualize net pay impact instantly.</p>
                <Badge variant="outline" className="text-amber-600 bg-amber-50">Draft Simulation Mode</Badge>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
                {/* Controls */}
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Adjust Parameters</CardTitle>
                        <CardDescription>Jane Doe (EMP-10042)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Salary Increase (%)</Label>
                                <span className="font-bold text-emerald-600">+{increase[0]}%</span>
                            </div>
                            <Slider max={20} step={0.5} value={increase} onValueChange={setIncrease} />
                            <p className="text-xs text-muted-foreground">New Base: ${(newSalary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex justify-between">
                                <Label>Target Bonus (%)</Label>
                                <span className="font-bold text-blue-600">{bonus[0]}%</span>
                            </div>
                            <Slider max={50} step={1} value={bonus} onValueChange={setBonus} />
                            <p className="text-xs text-muted-foreground">Bonus Amount: ${(bonusAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Comparison panel */}
                <Card className="md:col-span-8">
                    <CardHeader>
                        <CardTitle>Monthly Payslip Impact</CardTitle>
                        <CardDescription>Estimated net pay changes based on your parameters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

                            {/* Baseline Column */}
                            <div className="bg-muted/30 p-5 rounded-xl border border-border">
                                <div className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Current Baseline</div>
                                <div className="space-y-2 font-mono text-sm">
                                    <div className="flex justify-between text-muted-foreground"><span>Gross Pay</span><span>${baseMonthlyGross.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-red-500"><span>Taxes (Est. 24%)</span><span>-${(baseMonthlyGross * TAX_RATE).toFixed(2)}</span></div>
                                    <div className="pt-2 mt-2 border-t flex justify-between font-bold text-lg"><span>Net Pay</span><span>${baseMonthlyNet.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div className="text-muted-foreground"><ArrowLeftRight className="h-6 w-6" /></div>

                            {/* Simulated Column */}
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 text-emerald-100 dark:text-emerald-900/40">
                                    <Calculator className="h-32 w-32" />
                                </div>
                                <div className="relative">
                                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-4 uppercase tracking-wider">Simulated Total</div>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex justify-between text-emerald-800 dark:text-emerald-300"><span>Gross Pay</span><span>${simMonthlyGross.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-red-500"><span>Taxes (Est. 24%)</span><span>-${(simMonthlyGross * TAX_RATE).toFixed(2)}</span></div>
                                        <div className="pt-2 mt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between font-bold text-lg text-emerald-700 dark:text-emerald-400">
                                            <span>Net Pay</span><span>${simMonthlyNet.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
                                        <div className="text-xs text-emerald-600 font-bold flex gap-1 items-center">
                                            <BadgePercent className="h-3 w-3" /> Monthly net impact: +${(simMonthlyNet - baseMonthlyNet).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
