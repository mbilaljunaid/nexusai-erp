
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import {
    Activity, Package, Truck, Clock, AlertTriangle,
    CheckCircle2, TrendingUp, Layers, MousePointer2, ChevronRight,
    Waves, ClipboardList, Ship, Users, Database, MapPin, Settings
} from "lucide-react";
import { Link } from "wouter";
import { DashboardWidget, StandardDashboard } from "@/components/layout/StandardDashboard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnterpriseContextSwitcher } from "@/components/EnterpriseContextSwitcher";

const taskData = [
    { time: '08:00', picks: 120, putaway: 80 },
    { time: '10:00', picks: 240, putaway: 150 },
    { time: '12:00', picks: 180, putaway: 110 },
    { time: '14:00', picks: 310, putaway: 200 },
    { time: '16:00', picks: 280, putaway: 190 },
    { time: '18:00', picks: 150, putaway: 100 },
];

const zoneUtilization = [
    { name: 'Cold Storage', value: 85, colorClass: 'bg-blue-500' },
    { name: 'Dry Goods', value: 65, colorClass: 'bg-emerald-500' },
    { name: 'Bulk Area', value: 45, colorClass: 'bg-violet-500' },
    { name: 'Hazardous', value: 25, colorClass: 'bg-amber-500' },
];

export default function WmsDashboard() {
    return (
        <StandardDashboard
            className="bg-slate-950 text-slate-200"
            header={
                <div className="flex justify-between items-center bg-slate-900 px-6 py-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">WMS Executive Insight</h1>
                            <p className="text-muted-foreground/70 text-sm">Real-time Warehouse Operations &amp; Efficiency</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <EnterpriseContextSwitcher />
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Workers</p>
                            <p className="text-xl font-bold text-white">24</p>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">System Health</p>
                            <p className="text-xl font-bold text-green-400">99.9%</p>
                        </div>
                    </div>
                </div>
            }
        >

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DashboardWidget title="Picking Performance" icon={MousePointer2}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">382</span>
                        <span className="text-xs text-green-400">+12% vs goal</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Dock Occupation" icon={Truck}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-yellow-400">4/6</span>
                        <span className="text-xs text-muted-foreground">Critical priority</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Average Cycle Time" icon={Clock}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-purple-400">18m</span>
                        <span className="text-xs text-green-400">-2m optimized</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="System Logic" icon={Layers}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-blue-400">AI-Dir</span>
                        <span className="text-xs text-muted-foreground">Advanced Engine</span>
                    </div>
                </DashboardWidget>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task Backlog Status */}
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                            Throughput Velocity (24H)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={taskData}>
                                <defs>
                                    <linearGradient id="colorPicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#cbd5e1' }}
                                />
                                <Area type="monotone" dataKey="picks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPicks)" />
                                <Area type="monotone" dataKey="putaway" stroke="#10b981" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Zone Utilization */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Zone Capacity Utilization</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex flex-col justify-center">
                        <div className="space-y-6">
                            {zoneUtilization.map((zone) => (
                                <div key={zone.name} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground/70">{zone.name}</span>
                                        <span className="text-white font-bold">{zone.value}%</span>
                                    </div>
                                    <Progress
                                        value={zone.value}
                                        className="h-2 bg-slate-800"
                                        indicatorClassName={zone.colorClass}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Dock Status Card */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">Dock Schedule (Next 2H)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { dock: 'D-01', carrier: 'FedEx', time: '17:30', status: 'Arrived' },
                            { dock: 'D-02', carrier: 'UPS', time: '18:00', status: 'Inbound' },
                        ].map((dock, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                <div>
                                    <p className="font-bold text-white">{dock.dock}</p>
                                    <p className="text-xs text-muted-foreground">{dock.carrier}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-blue-400">{dock.time}</p>
                                    <Badge variant="outline" className="text-[10px] py-0">{dock.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Inventory Alerts */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">Storage Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-1" />
                            <p className="text-xs text-red-200">Temp deviation detected in Zone-C (Cold Storage)</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />
                            <p className="text-xs text-yellow-100">Low stock levels for Item #WH-9284 in Picking Zone</p>
                        </div>
                    </CardContent>
                </Card>

                {/* LPN Integrity */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">LPN Accuracy Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6">
                        <div className="relative h-24 w-24">
                            <svg className="h-24 w-24 -rotate-90">
                                <circle cx="48" cy="48" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                                <circle cx="48" cy="48" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="5" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-white">98%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Distribution */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">Task Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-800">
                            <span className="text-muted-foreground/70">Picking</span>
                            <span className="text-blue-400 font-bold">65%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-800">
                            <span className="text-muted-foreground/70">Putaway</span>
                            <span className="text-green-400 font-bold">20%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground/70">Replenish</span>
                            <span className="text-purple-400 font-bold">15%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access Navigation Cards */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 mt-2">Warehouse Operations</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {[
                        { title: "Operations", desc: "Putaway, pick, and pack tasks", href: "/scm/wms/operations", icon: Activity },
                        { title: "Wave Planning", desc: "Plan and release pick waves", href: "/scm/wms/waves", icon: Waves },
                        { title: "Task Monitor", desc: "Live task queue and metrics", href: "/scm/wms/tasks", icon: ClipboardList },
                        { title: "Slotting", desc: "Optimise warehouse slot assignments", href: "/scm/wms/slotting", icon: Layers },
                        { title: "Shipping", desc: "Packing, labels, and dispatch", href: "/scm/wms/shipping", icon: Ship },
                        { title: "Labor", desc: "Labor performance and scheduling", href: "/scm/wms/labor", icon: Users },
                        { title: "Master Data", desc: "Locations, bins, and SKU setup", href: "/scm/wms/masters", icon: Database },
                        { title: "Yard Management", desc: "Inbound yard and dock management", href: "/scm/wms/yard", icon: MapPin },
                    ].map((mod) => (
                        <Link key={mod.href} to={mod.href}>
                            <Card className="cursor-pointer bg-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-md transition-all h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-medium text-slate-300">{mod.title}</CardTitle>
                                    <ChevronRight className="h-3 w-3 text-slate-500" />
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <mod.icon className="h-5 w-5 text-blue-400 mb-1" />
                                    <p className="text-[10px] text-slate-500">{mod.desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </StandardDashboard>
    );
}
