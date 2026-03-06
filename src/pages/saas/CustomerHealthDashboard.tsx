import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Calendar, User, Loader2 } from "lucide-react";
import CustomerSuccessService, { CustomerHealthScore, RenewalForecast } from '@/services/customerSuccessService';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { format } from "date-fns";


interface CustomerHealthDashboardProps {
    customerId?: string; // If provided, shows single customer view
}

export default function CustomerHealthDashboard({ customerId }: CustomerHealthDashboardProps) {
    const [atRiskCustomers, setAtRiskCustomers] = useState<any[]>([]);
    const [renewalPipeline, setRenewalPipeline] = useState<RenewalForecast[]>([]);
    const [healthScoreHistory, setHealthScoreHistory] = useState<CustomerHealthScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadDashboardData();
    }, [customerId]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            if (customerId) {
                // Single customer view
                const [history] = await Promise.all([
                    CustomerSuccessService.getHealthHistory(customerId, 90)
                ]);
                setHealthScoreHistory(history);
            } else {
                // Portfolio view
                const [customers, renewals] = await Promise.all([
                    CustomerSuccessService.getAtRiskCustomers(['high', 'critical']),
                    CustomerSuccessService.getRenewalRiskReport(90)
                ]);
                setAtRiskCustomers(customers);
                setRenewalPipeline(renewals);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getHealthBadgeColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        if (score >= 40) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getWidthClass = (val: number) => {
        if (val >= 100) return "w-full";
        if (val >= 90) return "w-[90%]";
        if (val >= 80) return "w-[80%]";
        if (val >= 70) return "w-[70%]";
        if (val >= 60) return "w-[60%]";
        if (val >= 50) return "w-[50%]";
        if (val >= 40) return "w-[40%]";
        if (val >= 30) return "w-[30%]";
        if (val >= 20) return "w-[20%]";
        if (val >= 10) return "w-[10%]";
        return "w-[5%]";
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'declining':
            case 'critical':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'critical':
            case 'high':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'medium':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            default:
                return <CheckCircle className="h-5 w-5 text-green-600" />;
        }
    };

    const atRiskColumns: SpreadsheetColumn<any>[] = [
        {
            id: 'customer_name',
            header: 'Customer',
            width: "250px",
            cell: (row: any) => (
                <div className="flex items-center space-x-3 p-2">
                    {getRiskIcon(row.risk_level)}
                    <div>
                        <div className="font-medium">{row.customers?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{row.customers?.email}</div>
                    </div>
                </div>
            )
        },
        {
            id: 'health_score',
            header: 'Health Score',
            width: "150px",
            cell: (row: any) => (
                <div className="flex items-center space-x-2 p-2">
                    <Badge className={getHealthBadgeColor(row.health_score)}>
                        {row.health_score}
                    </Badge>
                    {getTrendIcon(row.trend)}
                </div>
            )
        },
        {
            id: 'risk_level',
            header: 'Risk Level',
            width: "120px",
            cell: (row: any) => (
                <div className="p-2">
                    <Badge variant={row.risk_level === 'critical' ? 'destructive' : 'default'}>
                        {row.risk_level}
                    </Badge>
                </div>
            )
        },
        {
            id: 'last_engagement',
            header: 'Last Engagement',
            width: "150px",
            cell: (row: any) => (
                <div className="p-2 text-sm text-gray-600">
                    {row.last_engagement ? format(new Date(row.last_engagement), "MMM d, yyyy") : 'Never'}
                </div>
            )
        },
        {
            id: 'days_since_last_activity',
            header: 'Days Inactive',
            width: "120px",
            cell: (row: any) => (
                <div className={cn(`p-2 text-sm ${row.days_since_last_activity > 30 ? 'text-red-600 font-semibold' : 'text-gray-600'}`)}>
                    {row.days_since_last_activity || 0}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            width: "150px",
            cell: (row: any) => (
                <div className="flex space-x-2 p-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm">Engage</Button>
                </div>
            )
        }
    ];

    const renewalColumns: SpreadsheetColumn<any>[] = [
        {
            id: 'customer_name',
            header: 'Customer',
            width: "250px",
            cell: (row: any) => (
                <div className="p-2">
                    <div className="font-medium">{row.customers?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">ARR: ${row.current_arr?.toLocaleString()}</div>
                </div>
            )
        },
        {
            id: 'renewal_date',
            header: 'Renewal Date',
            width: "150px",
            cell: (row: any) => (
                <div className="flex items-center space-x-2 p-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{format(new Date(row.renewal_date), "MMM d, yyyy")}</span>
                </div>
            )
        },
        {
            id: 'renewal_probability',
            header: 'Renewal Probability',
            width: "200px",
            cell: (row: any) => (
                <div className="w-full bg-gray-200 rounded-full h-2.5 m-2 relative">
                    <div
                        className={cn(`absolute left-0 top-0 h-2.5 rounded-full ${row.renewal_probability > 70 ? 'bg-green-600' :
                            row.renewal_probability > 50 ? 'bg-yellow-600' : 'bg-red-600'
                            } ${getWidthClass(row.renewal_probability)}`)}
                    />
                    <span className="text-xs absolute -right-8 -top-1">{row.renewal_probability}%</span>
                </div>
            )
        },
        {
            id: 'churn_risk',
            header: 'Churn Risk',
            width: "100px",
            cell: (row: any) => (
                <div className="p-2">
                    <Badge className={row.churn_risk > 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {row.churn_risk}%
                    </Badge>
                </div>
            )
        },
        {
            id: 'csm_confidence',
            header: 'CSM Confidence',
            width: "150px",
            cell: (row: any) => (
                <div className="p-2 text-sm text-gray-600 capitalize">
                    {row.csm_confidence || 'Not set'}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            width: "200px",
            cell: (row: any) => (
                <div className="flex space-x-2 p-2">
                    <Button size="sm" variant="outline">Update Forecast</Button>
                    <Button size="sm">Plan</Button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <StandardPage title="Customer Health Dashboard">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </StandardPage>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-gray-500 mt-1">
                        {customerId ? 'Customer Health Overview' : 'Portfolio Health & Risk Management'}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={loadDashboardData} variant="outline">
                        Refresh
                    </Button>
                    <Button>Run Health Check</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Critical Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                            {atRiskCustomers.filter(c => c.risk_level === 'critical').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Customers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">High Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            {atRiskCustomers.filter(c => c.risk_level === 'high').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Customers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Upcoming Renewals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {renewalPipeline.length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Next 90 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">At-Risk ARR</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ${renewalPipeline
                                .filter(r => r.churn_risk > 50)
                                .reduce((sum, r) => sum + (r.current_arr || 0), 0)
                                .toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">High churn risk</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">At-Risk Customers</TabsTrigger>
                    <TabsTrigger value="renewals">Renewal Pipeline</TabsTrigger>
                    <TabsTrigger value="health-trends">Health Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>At-Risk Customers</CardTitle>
                            <p className="text-sm text-gray-500">
                                Customers with high or critical health risk levels requiring immediate attention
                            </p>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                columns={atRiskColumns}
                                data={atRiskCustomers}
                                onChange={() => { }} virtualized={true} containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="renewals" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Renewal Pipeline (Next 90 Days)</CardTitle>
                            <p className="text-sm text-gray-500">
                                Upcoming renewals with churn risk assessment
                            </p>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                columns={renewalColumns}
                                data={renewalPipeline}
                                onChange={() => { }} virtualized={true} containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health-trends" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Health Score Trends</CardTitle>
                            <p className="text-sm text-gray-500">
                                Historical health score trends (Coming Soon)
                            </p>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-gray-400">Chart visualization will be implemented here</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
