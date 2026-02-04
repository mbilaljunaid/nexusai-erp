
import React from 'react';
import GlobalLayout from '@/components/GlobalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PlanningDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Enterprise Performance Management</h1>
                <div className="flex gap-2">
                    <Button variant="outline">Refresh</Button>
                    <Button>New Plan</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/epm/planning')}>
                    <CardHeader>
                        <CardTitle>Financial Planning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Manage P&L, Balance Sheet, and Driver-based Budgets.</p>
                        <div className="mt-4 text-2xl font-bold">2 Active Plans</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition">
                    <CardHeader>
                        <CardTitle>Workforce Planning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Manage Headcount, Salaries, and Benefits.</p>
                        <div className="mt-4 text-2xl font-bold">142 Positions</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition">
                    <CardHeader>
                        <CardTitle>Capital Expenditure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Plan Asset Acquisitions and Depreciation.</p>
                        <div className="mt-4 text-2xl font-bold">$4.2M CapEx</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Workflow Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span>Budget 2025 (Draft)</span>
                                <span className="text-yellow-600">In Progress</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Q1 Forecast</span>
                                <span className="text-green-600">Approved</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlanningDashboard;
