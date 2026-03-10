import React from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EquityAwardsManager() {

    // Mock Vesting Schedule Data
    const vestingData = [
        { date: '2023-01', unvested: 10000, vested: 0 },
        { date: '2024-01', unvested: 7500, vested: 2500 }, // 1yr cliff
        { date: '2024-07', unvested: 6250, vested: 3750 },
        { date: '2025-01', unvested: 5000, vested: 5000 },
        { date: '2025-07', unvested: 3750, vested: 6250 },
        { date: '2026-01', unvested: 2500, vested: 7500 }, // Current
        { date: '2026-07', unvested: 1250, vested: 8750 },
        { date: '2027-01', unvested: 0, vested: 10000 }, // Fully Vested
    ];

    const currentStockPrice = 145.20;
    const vestedShares = 7500;
    const unvestedShares = 2500;

    return (
        <StandardPage title="Equity & Stock Awards">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Monitor your Restricted Stock Units (RSUs) and Option Grants vesting schedules.</p>
                <Button variant="outline" className="gap-2">E*TRADE Portal <ExternalLink className="h-3 w-3" /></Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Granted</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">10,000</div>
                        <p className="text-xs text-muted-foreground mt-1">Shares (RSUs)</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Vested Value (Est.)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700">${(vestedShares * currentStockPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-emerald-600/80 mt-1">{vestedShares.toLocaleString()} shares @ ${currentStockPrice}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unvested Value (Est.)</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">${(unvestedShares * currentStockPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">{unvestedShares.toLocaleString()} shares remaining</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vesting Trajectory</CardTitle>
                    <CardDescription>Visualizing your 4-year standard vesting schedule (1-year cliff, 1/48 monthly thereafter).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vestingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} stroke="#9ca3af" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} shares`, undefined]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="vested"
                                    name="Vested Shares"
                                    stroke="#059669"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="unvested"
                                    name="Unvested Shares"
                                    stroke="#9ca3af"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </StandardPage>
    );
}
