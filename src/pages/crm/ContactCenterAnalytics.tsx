import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Users, Clock, Headset, TrendingDown, Star, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function ContactCenterAnalytics() {

    const overallMetrics = {
        activeQueue: 14,
        avgHandleTime: "8m 45s",
        csat: 4.6,
        escalationRate: "2.4%",
        agentsOnline: 18,
        activeCalls: 12
    };

    const hourlyVolumeData = [
        { time: "08:00", calls: 45, emails: 120 },
        { time: "09:00", calls: 86, emails: 150 },
        { time: "10:00", calls: 112, emails: 180 },
        { time: "11:00", calls: 135, emails: 210 },
        { time: "12:00", calls: 142, emails: 245 },
        { time: "13:00", calls: 95, emails: 190 },
        { time: "14:00", calls: 110, emails: null },
    ];

    const agentPerformance = [
        { id: "A-01", name: "Sarah Jenkins", role: "Tier 1 Support", aht: "7m 10s", selected: 124, csat: 4.8, status: "ONLINE" },
        { id: "A-02", name: "Michael Ross", role: "Tier 2 Technical", aht: "14m 20s", selected: 45, csat: 4.9, status: "ON_CALL" },
        { id: "A-03", name: "Emily Chen", role: "Tier 1 Support", aht: "9m 05s", selected: 98, csat: 4.2, status: "BREAK" },
        { id: "A-04", name: "David Kim", role: "Billing Specialist", aht: "5m 45s", selected: 156, csat: 4.7, status: "ONLINE" },
        { id: "A-05", name: "Rachel Green", role: "Tier 1 Support", aht: "11m 30s", selected: 72, csat: 3.8, status: "ON_CALL" },
    ];

    return (
        <StandardPage
            title="Contact Center Analytics"
            description="Live supervisor dashboard tracking queue depth, agent performance, and CSAT."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Service", href: "/crm/service" },
                { label: "Contact Center" }
            ]}
        >
            {/* Top Level Real-Time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Headset className="h-4 w-4 text-blue-500" /> Active Queue Depth
                            </p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{overallMetrics.activeQueue}</p>
                                <span className="text-xs text-red-500 flex items-center"><Activity className="h-3 w-3 mr-1" /> High</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{overallMetrics.activeCalls} active calls • {overallMetrics.agentsOnline} agents online</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-500" /> Average Handle Time
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{overallMetrics.avgHandleTime}</p>
                            <span className="text-xs text-green-500 flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> -12s</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Target: &lt; 9m 00s</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 bg-amber-50/30">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" /> Average CSAT
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{overallMetrics.csat}</p>
                            <span className="text-xl text-muted-foreground">/ 5.0</span>
                        </div>
                        <Progress value={overallMetrics.csat * 20} className="h-1 mt-2 bg-amber-100" />
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 bg-red-50/30">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" /> Escalation Rate
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{overallMetrics.escalationRate}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Based on past 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Intraday Volume Arrival</CardTitle>
                        <CardDescription>Live incoming case volume mapped against forecasted SLA capacity.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourlyVolumeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="calls" name="Voice Calls" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="emails" name="Email/Web Cases" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Case Resolution by Topic</CardTitle>
                        <CardDescription>Top drivers for inbound contacts today.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Password Reset', value: 145 },
                                { name: 'Billing Inquiry', value: 98 },
                                { name: 'Bug Report', value: 56 },
                                { name: 'Feature Request', value: 34 },
                                { name: 'Cancellation', value: 12 },
                            ]} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Agent Performance Scorecard</CardTitle>
                    <CardDescription>Real-time metrics for currently rostered agents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Daily Cases</TableHead>
                                <TableHead>AHT</TableHead>
                                <TableHead>CSAT</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agentPerformance.map(agent => (
                                <TableRow key={agent.id}>
                                    <TableCell>
                                        <div className="font-medium text-primary">{agent.name}</div>
                                        <div className="text-xs text-muted-foreground">{agent.role}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${agent.status === 'ONLINE' ? 'bg-green-500' : agent.status === 'ON_CALL' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                            <span className="text-xs font-medium uppercase">{agent.status.replace('_', ' ')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{agent.selected}</TableCell>
                                    <TableCell>
                                        <span className={parseFloat(agent.aht) > 10 ? 'text-red-600 font-medium' : ''}>{agent.aht}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{agent.csat}</span>
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Whisper/Barge</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
