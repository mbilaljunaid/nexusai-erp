import React from 'react';
import { Users, Activity, DollarSign, Folder, TrendingUp, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
    // Mock data - replace with real API calls
    const metrics = {
        totalUsers: 1247,
        totalUsersChange: '+12.5%',
        activeUsers: 856,
        activeUsersChange: '+8.2%',
        monthlyRevenue: 125430,
        monthlyRevenueChange: '+18.3%',
        totalProjects: 342,
        totalProjectsChange: '+22.1%',
    };

    const recentActivity = [
        { id: 1, type: 'user', message: 'New user registered: john@example.com', time: '5 min ago' },
        { id: 2, type: 'tenant', message: 'Tenant "Acme Corp" upgraded to Enterprise', time: '12 min ago' },
        { id: 3, type: 'demo', message: 'Demo environment created for "TechStart Inc"', time: '23 min ago' },
        { id: 4, type: 'module', message: 'CRM module enabled for tenant "Global Trade Ltd"', time: '1 hour ago' },
    ];

    const systemStatus = [
        { service: 'API Server', status: 'healthy', uptime: '99.98%' },
        { service: 'Database', status: 'healthy', uptime: '99.95%' },
        { service: 'Cache', status: 'healthy', uptime: '99.99%' },
        { service: 'Queue', status: 'healthy', uptime: '99.97%' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of platform metrics and activity</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {metrics.totalUsersChange}
                        </p>
                        <p className="text-xs text-muted-foreground">All registered users vs last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Users (7d)</CardTitle>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
                        <p className="text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {metrics.activeUsersChange}
                        </p>
                        <p className="text-xs text-muted-foreground">Users active in last 7 days vs last week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(metrics.monthlyRevenue / 1000).toFixed(1)}k</div>
                        <p className="text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {metrics.monthlyRevenueChange}
                        </p>
                        <p className="text-xs text-muted-foreground">MRR from subscriptions vs last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <Folder className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                        <p className="text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {metrics.totalProjectsChange}
                        </p>
                        <p className="text-xs text-muted-foreground">Projects created vs last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">Latest user actions and events</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                        <p className="text-sm text-muted-foreground">Service health and uptime</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {systemStatus.map((service) => (
                                <div key={service.service} className="flex items-center justify-between pb-3 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Server className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{service.service}</p>
                                            <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-medium text-green-600">Healthy</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <p className="text-sm text-muted-foreground">Common admin tasks</p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                        <Button variant="outline">
                            <Activity className="w-4 h-4 mr-2" />
                            Sync Stripe
                        </Button>
                        <Button variant="outline">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Create Invoice
                        </Button>
                        <Button variant="outline">
                            <Server className="w-4 h-4 mr-2" />
                            Run Health Check
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
