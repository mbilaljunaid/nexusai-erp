import React from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, FileText, HeartPulse, Coins, PiggyBank, Briefcase } from "lucide-react";

export default function TotalCompensationStatement() {

    // Mock statement data
    const statementYear = "2025";
    const compData = {
        basePay: 140000,
        bonus: 15000,
        equityVested: 10890,
        healthBenefits: 18400, // Employer paid
        retirementMatch: 7000, // 401k match
        taxes: 11800 // Employer portion of payroll taxes
    };

    const totalRewards = Object.values(compData).reduce((a, b) => a + b, 0);

    const chartData = [
        { name: "Direct Compensation (Base + Bonus)", value: compData.basePay + compData.bonus, color: "#2563eb" },
        { name: "Equity (Vested Value)", value: compData.equityVested, color: "#059669" },
        { name: "Health & Welfare Benefits", value: compData.healthBenefits, color: "#d97706" },
        { name: "Retirement Contributions", value: compData.retirementMatch, color: "#7c3aed" },
        { name: "Statutory Contributions", value: compData.taxes, color: "#6b7280" }
    ];

    return (
        <StandardPage title="Total Compensation Statement">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Review your complete "hidden paycheck", including benefits and employer taxes.</p>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> {statementYear} Summary</Button>
                    <Button className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
                {/* Total Value Hero */}
                <Card className="md:col-span-12 border-primary/20 bg-primary/5">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
                        <div>
                            <div className="text-sm font-bold text-muted-foreground tracking-wider uppercase mb-1">Total Rewards Value ({statementYear})</div>
                            <div className="text-5xl font-black text-primary">${totalRewards.toLocaleString()}</div>
                            <p className="text-sm text-primary/80 mt-2 font-medium">Your base pay represents only {Math.round((compData.basePay / totalRewards) * 100)}% of your total compensation package.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground mb-1">Cash Earnings</div>
                                <div className="text-xl font-bold">${(compData.basePay + compData.bonus).toLocaleString()}</div>
                            </div>
                            <div className="w-px bg-primary/20"></div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground mb-1">Employer Investments</div>
                                <div className="text-xl font-bold">${(totalRewards - compData.basePay - compData.bonus).toLocaleString()}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Breakdown & Chart */}
                <Card className="md:col-span-5">
                    <CardHeader>
                        <CardTitle>Value Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        formatter={(val: number) => `$${val.toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    />
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Item Ledger */}
                <Card className="md:col-span-7">
                    <CardHeader>
                        <CardTitle>Detailed Breakdown</CardTitle>
                        <CardDescription>Line-by-line accounting of employer costs and employee earnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 p-2 rounded mb-3 border border-blue-100">
                                <Contains className="h-4 w-4" as={Coins} /> Direct Pay
                            </h4>
                            <div className="space-y-2 px-2 text-sm">
                                <div className="flex justify-between border-b border-dashed pb-1">
                                    <span className="text-muted-foreground">Base Salary</span>
                                    <span className="font-mono font-medium">${compData.basePay.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed pb-1">
                                    <span className="text-muted-foreground">Performance Bonus</span>
                                    <span className="font-mono font-medium">${compData.bonus.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-1 font-bold text-blue-800">
                                    <span>Subtotal</span>
                                    <span className="font-mono">${(compData.basePay + compData.bonus).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 p-2 rounded mb-3 border border-emerald-100">
                                <Contains className="h-4 w-4" as={Briefcase} /> Equity Awards
                            </h4>
                            <div className="space-y-2 px-2 text-sm">
                                <div className="flex justify-between border-b border-dashed pb-1">
                                    <span className="text-muted-foreground">Value of shares vested in {statementYear}</span>
                                    <span className="font-mono font-medium">${compData.equityVested.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-purple-700 bg-purple-50 p-2 rounded mb-3 border border-purple-100">
                                <Contains className="h-4 w-4" as={HeartPulse} /> Benefits & Retirement Investment
                            </h4>
                            <div className="space-y-2 px-2 text-sm">
                                <div className="flex justify-between border-b border-dashed pb-1">
                                    <span className="text-muted-foreground">Medical, Dental, Vision Premiums (Employer Cost)</span>
                                    <span className="font-mono font-medium">${compData.healthBenefits.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed pb-1">
                                    <span className="text-muted-foreground">401(k) Employer Match Contributions</span>
                                    <span className="font-mono font-medium">${compData.retirementMatch.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed pb-1">
                                    <span className="text-muted-foreground">Employer Payroll Taxes (Social Security, Medicare)</span>
                                    <span className="font-mono font-medium">${compData.taxes.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-1 font-bold text-purple-800">
                                    <span>Subtotal</span>
                                    <span className="font-mono">${(compData.healthBenefits + compData.retirementMatch + compData.taxes).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}

function Contains({ as: Component, ...props }: any) {
    return <Component {...props} />;
}
