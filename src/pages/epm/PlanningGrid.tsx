

import React, { useState, useEffect } from 'react';
import GlobalLayout from '@/components/GlobalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormulaManager from './FormulaManager';
import AllocationRules from './AllocationRules';

interface PlanUnit {
    id: string;
    accountId: string;
    departmentId: string;
    projectId?: string; // New
    channelId?: string; // New
    period: string;
    amount: string;
    versionId: string;
}

const PlanningGrid = () => {
    const { toast } = useToast();
    const [data, setData] = useState<PlanUnit[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock Fetch for specific version
    const loadData = async () => {
        setLoading(true);
        try {
            // In real app: fetch(`/api/epm/plan-units?versionId=...`)
            // Mock data for UI demonstration
            const mockData = [
                { id: '1', accountId: '40000 Revenue', departmentId: 'Global', projectId: 'PROJ-001', channelId: 'Direct', period: '2024-01', amount: '50000.00', versionId: 'v1' },
                { id: '2', accountId: '60000 Salaries', departmentId: 'Eng', projectId: 'PROJ-INT', channelId: '-', period: '2024-01', amount: '12000.00', versionId: 'v1' },
                { id: '3', accountId: '70000 Depr.', departmentId: 'IT', projectId: '-', channelId: '-', period: '2024-01', amount: '1000.00', versionId: 'v1' },
            ];
            setData(mockData);
        } finally {
            setLoading(false);
        }
    };

    const handleRunDriver = async () => {
        toast({ title: "Processing...", description: "Applying 5% Inflation Driver." });
        // In real app: POST /api/epm/calculate/driver
        setTimeout(() => {
            toast({ title: "Success", description: "Driver Applied. Data updated." });
            // Optionally reload data
        }, 1000);
    };

    const handleRunWFP = async () => {
        toast({ title: "Processing...", description: "Calculating Workforce Costs." });
        // In real app: POST /api/epm/calculate/wfp
        setTimeout(() => {
            toast({ title: "Success", description: "Workforce Calculation Complete." });
        }, 1000);
    };

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Financial Planning Grid</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleRunWFP}>Run WFP Logic</Button>
                    <Button variant="default" onClick={handleRunDriver}>Quick Inflation (5%)</Button>
                    <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50" onClick={() => toast({ title: "AI Forecasting", description: "Generating predictive baseline from historicals..." })}>
                        ✨ AI Forecast
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="grid" className="w-full">
                <TabsList>
                    <TabsTrigger value="grid">Data Grid</TabsTrigger>
                    <TabsTrigger value="formulas">Formulas</TabsTrigger>
                    <TabsTrigger value="allocations">Allocations</TabsTrigger>
                </TabsList>

                <TabsContent value="grid">
                    <Card>
                        <CardHeader><CardTitle>Working Budget 2024</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <div>Loading...</div> : (
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm text-left">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Account</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Department</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Project</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Channel</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Period</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {data.map((row) => (
                                                <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle">{row.accountId}</td>
                                                    <td className="p-4 align-middle">{row.departmentId}</td>
                                                    <td className="p-4 align-middle">{row.projectId || '-'}</td>
                                                    <td className="p-4 align-middle">{row.channelId || '-'}</td>
                                                    <td className="p-4 align-middle">{row.period}</td>
                                                    <td className="p-4 align-middle text-right">{Number(row.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="formulas">
                    <FormulaManager />
                </TabsContent>

                <TabsContent value="allocations">
                    <AllocationRules />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PlanningGrid;

