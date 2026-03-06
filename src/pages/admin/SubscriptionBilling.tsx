import React, { useState } from 'react';
import { CreditCard, DollarSign, Users, Package, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function SubscriptionBilling() {
    const subscriptionColumns: SpreadsheetColumn<any>[] = [
        { id: "tenant", header: "Tenant", width: "200px", cell: (row: any) => row.tenant },
        { id: "plan", header: "Plan", width: "150px", cell: (row: any) => <Badge>{row.plan}</Badge> },
        { id: "mrr", header: "MRR", width: "150px", cell: (row: any) => row.mrr },
        { id: "startDate", header: "Start Date", width: "150px", cell: (row: any) => row.startDate },
        { id: "status", header: "Status", width: "150px", cell: (row: any) => <Badge variant="outline" className="text-green-600">{row.status}</Badge> },
        { id: "actions", header: "Actions", width: "100px", cell: () => <div className="text-right w-full"><Button variant="ghost" size="sm">View</Button></div> }
    ];

    const subscriptionData = [
        { id: "1", tenant: "Acme Corp", plan: "Enterprise", mrr: "$2,500", startDate: "2024-01-15", status: "Active" }
    ];

    return (
        <AdminLayout>
            <StandardPage
                title="Subscription & Billing"
                description="Manage subscription plans, pricing, and revenue"
            >
                <div className="space-y-6">

                    {/* Revenue Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$125.4k</div>
                                <p className="text-xs text-green-600 mt-1">
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                    +18.3%
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">ARR</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$1.5M</div>
                                <p className="text-xs text-green-600 mt-1">
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                    +22.1%
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">247</div>
                                <p className="text-xs text-muted-foreground mt-1">Across all plans</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2.3%</div>
                                <p className="text-xs text-green-600 mt-1">↓ 0.5% vs last month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="plans">
                        <TabsList>
                            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                            <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                        </TabsList>

                        {/* Plans Tab */}
                        <TabsContent value="plans" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Subscription Plans</CardTitle>
                                        <Button>Add Plan</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Starter Plan */}
                                        <Card>
                                            <CardContent className="pt-6 space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">Starter</h3>
                                                    <div className="text-3xl font-bold mt-2">$49<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="w-4 h-4" />
                                                        <span>Up to 10 users</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Package className="w-4 h-4" />
                                                        <span>Core modules only</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <Badge variant="secondary">45 active</Badge>
                                                </div>
                                                <Button variant="outline" className="w-full">Edit Plan</Button>
                                            </CardContent>
                                        </Card>

                                        {/* Professional Plan */}
                                        <Card className="border-blue-500 border-2">
                                            <CardContent className="pt-6 space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-semibold">Professional</h3>
                                                        <Badge>Popular</Badge>
                                                    </div>
                                                    <div className="text-3xl font-bold mt-2">$149<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="w-4 h-4" />
                                                        <span>Up to 50 users</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Package className="w-4 h-4" />
                                                        <span>All modules + AI</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <Badge variant="secondary">142 active</Badge>
                                                </div>
                                                <Button variant="outline" className="w-full">Edit Plan</Button>
                                            </CardContent>
                                        </Card>

                                        {/* Enterprise Plan */}
                                        <Card>
                                            <CardContent className="pt-6 space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">Enterprise</h3>
                                                    <div className="text-3xl font-bold mt-2">Custom</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="w-4 h-4" />
                                                        <span>Unlimited users</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Package className="w-4 h-4" />
                                                        <span>Full platform + Support</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <Badge variant="secondary">60 active</Badge>
                                                </div>
                                                <Button variant="outline" className="w-full">Edit Plan</Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Subscriptions Tab */}
                        <TabsContent value="subscriptions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Subscriptions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-72">
                                        <InteractiveSpreadsheet
                                            columns={subscriptionColumns}
                                            data={subscriptionData}
                                            onChange={() => { }}
                                            containerHeight="300px"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Invoices</CardTitle>
                                        <Button variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">INV-2024-{1000 + i}</div>
                                                        <div className="text-sm text-muted-foreground">Acme Corp</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">$2,500.00</div>
                                                    <div className="text-sm text-muted-foreground">Paid</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </StandardPage>
        </AdminLayout>
    );
}
