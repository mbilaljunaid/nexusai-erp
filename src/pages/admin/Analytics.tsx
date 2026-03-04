import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { StandardPage } from "@/components/layout/StandardPage";

export default function Analytics() {
    return (
        <AdminLayout>
            <StandardPage
                title="Analytics"
                description="Platform-wide analytics and insights"
            >
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12,458</div>
                            <p className="text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                +18.3% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">247</div>
                            <p className="text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                +12.5% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$1.5M</div>
                            <p className="text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                +22.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24m</div>
                            <p className="text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                +8.7% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="usage">
                    <TabsList>
                        <TabsTrigger value="usage">Usage</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                    </TabsList>

                    {/* Usage Analytics */}
                    <TabsContent value="usage" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        User Growth
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                                        <p className="text-muted-foreground">User growth chart placeholder</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Daily Active Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                                        <p className="text-muted-foreground">DAU chart placeholder</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Revenue Analytics */}
                    <TabsContent value="revenue" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        MRR Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                                        <p className="text-muted-foreground">MRR trend chart placeholder</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="w-5 h-5" />
                                        Revenue by Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                                        <p className="text-muted-foreground">Revenue distribution chart placeholder</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Engagement Analytics */}
                    <TabsContent value="engagement" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Engagement Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <span className="font-medium">Average Session Duration</span>
                                        <span className="text-2xl font-bold">24m 32s</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <span className="font-medium">Pages per Session</span>
                                        <span className="text-2xl font-bold">8.4</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <span className="font-medium">Bounce Rate</span>
                                        <span className="text-2xl font-bold">12.3%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <span className="font-medium">Return User Rate</span>
                                        <span className="text-2xl font-bold">68.7%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Module Analytics */}
                    <TabsContent value="modules" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Finance & Accounting', usage: 89, tenants: 220 },
                                        { name: 'Human Resources', usage: 76, tenants: 198 },
                                        { name: 'CRM & Sales', usage: 82, tenants: 185 },
                                        { name: 'Supply Chain', usage: 64, tenants: 142 },
                                    ].map((module) => (
                                        <div key={module.name} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{module.name}</span>
                                                <span className="text-muted-foreground">{module.tenants} tenants ({module.usage}%)</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${module.usage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </StandardPage>
        </AdminLayout>
    );
}
