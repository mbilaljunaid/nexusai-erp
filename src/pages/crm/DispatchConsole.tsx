import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar as CalendarIcon, Map, Truck, Users, Search,
    Filter, Settings2, Clock, MapPin, Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const RESOURCES = [
    { id: "r1", name: "Alex Jenkins", role: "Sr. Technician", status: "driving", avatar: "AJ" },
    { id: "r2", name: "Sarah Chen", role: "Field Engineer", status: "working", avatar: "SC" },
    { id: "r3", name: "Mike Ross", role: "Specialist", status: "available", avatar: "MR" },
    { id: "r4", name: "Jessica Day", role: "Technician", status: "offline", avatar: "JD" },
    { id: "r5", name: "David Kim", role: "Sr. Technician", status: "available", avatar: "DK" },
];

const WORK_ORDERS = [
    { id: "wo-101", title: "HVAC Installation", resourceId: "r1", start: 8, duration: 3, status: "completed", location: "Downtown HQ" },
    { id: "wo-102", title: "Emergency Repair", resourceId: "r1", start: 12.5, duration: 2, status: "in_progress", location: "North Site" },
    { id: "wo-103", title: "Quarterly Maintenance", resourceId: "r2", start: 9, duration: 4, status: "completed", location: "Westpark Center" },
    { id: "wo-104", title: "System Diagnostic", resourceId: "r2", start: 14, duration: 2.5, status: "scheduled", location: "Tech Park" },
    { id: "wo-105", title: "Parts Replacement", resourceId: "r3", start: 10, duration: 1.5, status: "scheduled", location: "South Mall" },
];

const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

export default function DispatchConsole() {
    const [date, setDate] = useState("Today, Oct 24");
    const [view, setView] = useState("timeline");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-emerald-500 border-emerald-600/20 text-white";
            case "in_progress": return "bg-blue-500 border-blue-600/20 text-white shadow-md animate-pulse border-2";
            case "scheduled": return "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200";
            default: return "bg-slate-100";
        }
    };

    const getResourceStatusColor = (status: string) => {
        switch (status) {
            case "driving": return "bg-amber-500";
            case "working": return "bg-blue-500";
            case "available": return "bg-emerald-500";
            case "offline": return "bg-slate-300";
            default: return "bg-slate-300";
        }
    };

    return (
        <StandardPage
            title="Dispatch Console"
            description="Manage field resources, schedule work orders, and optimize routes."
            className="flex flex-col h-[calc(100vh-80px)]"
            actions={
                <div className="flex gap-2">
                    <div className="flex bg-card border rounded-lg p-1 shadow-sm h-10">
                        <Button variant={view === "timeline" ? "secondary" : "ghost"} size="sm" onClick={() => setView("timeline")} className="h-full px-4"><CalendarIcon className="h-4 w-4 mr-2" /> Timeline</Button>
                        <Button variant={view === "map" ? "secondary" : "ghost"} size="sm" onClick={() => setView("map")} className="h-full px-4"><Map className="h-4 w-4 mr-2" /> Map Route</Button>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700"><Settings2 className="h-4 w-4 mr-2" /> Auto-Schedule</Button>
                </div>
            }
        >
            <div className="flex-1 flex flex-col min-h-0 bg-card rounded-xl border shadow-sm overflow-hidden mt-4">

                {/* Toolbar */}
                <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/10 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="font-bold">
                            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                            {date}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">2 Available</Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">2 Active</Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">1 Driving</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search resources or WO..." className="w-64 pl-8 h-9" />
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9"><Filter className="h-4 w-4" /></Button>
                    </div>
                </div>

                {/* Gantt Area */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Resource List (Fixed Left) */}
                    <div className="w-72 border-r shrink-0 flex flex-col bg-background z-10">
                        <div className="h-12 border-b flex items-center px-4 bg-slate-50 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" /> Field Resources
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {RESOURCES.map(res => (
                                <div key={res.id} className="p-4 border-b hover:bg-slate-50 transition-colors flex items-center gap-3 h-24">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">{res.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className={cn("absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white", getResourceStatusColor(res.status))} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm tracking-tight">{res.name}</div>
                                        <div className="text-xs text-muted-foreground font-medium">{res.role}</div>
                                        <div className="text-[10px] uppercase font-bold mt-1 tracking-wider text-slate-400">{res.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Grid (Scrollable Right) */}
                    <div className="flex-1 overflow-x-auto relative flex flex-col bg-slate-50/30">

                        {/* Time Headers */}
                        <div className="h-12 border-b flex items-center sticky top-0 bg-slate-50 z-20 min-w-max">
                            {TIME_SLOTS.map(hour => (
                                <div key={hour} className="w-48 shrink-0 flex items-center px-4 border-l first:border-l-0 border-slate-200">
                                    <span className="text-xs font-bold text-muted-foreground">{hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}</span>
                                </div>
                            ))}
                        </div>

                        {/* Resource Rows & WO Blocks */}
                        <div className="flex-1 min-w-max relative" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px)', backgroundSize: '192px 100%' }}>

                            {/* Current Time Indicator (Static for demo, approx 11:30 AM) */}
                            <div className="absolute top-0 bottom-0 w-px bg-red-500 z-10" style={{ left: `${(11.5 - 8) * 192}px` }}>
                                <div className="absolute top-0 -translate-x-1/2 -translate-y-[calc(100%+8px)] bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    11:30 AM
                                </div>
                            </div>

                            {RESOURCES.map((res, i) => {
                                const resourceWOs = WORK_ORDERS.filter(wo => wo.resourceId === res.id);
                                return (
                                    <div key={res.id} className="relative h-24 border-b border-transparent group hover:bg-slate-100/50 transition-colors">
                                        {/* Grid borders applied via parent background to stay under blocks */}
                                        <div className="absolute inset-0 border-b border-slate-200" />

                                        {/* Render Work Orders as Blocks */}
                                        {resourceWOs.map(wo => {
                                            const left = (wo.start - 8) * 192; // 8 AM is start (0px), 192px per hour
                                            const width = wo.duration * 192;

                                            return (
                                                <div
                                                    key={wo.id}
                                                    className={cn(
                                                        "absolute h-[70px] top-[13px] rounded-lg border p-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg z-20 group/wo overflow-hidden",
                                                        getStatusColor(wo.status)
                                                    )}
                                                    style={{ left: `${left}px`, width: `${width - 8}px` }} // -8 for gap
                                                >
                                                    <div className="font-bold text-xs truncate drop-shadow-sm flex items-center justify-between">
                                                        <span>{wo.id}</span>
                                                        <Wrench className="h-3 w-3 opacity-50" />
                                                    </div>
                                                    <div className="font-semibold text-sm truncate leading-tight mt-0.5" title={wo.title}>{wo.title}</div>

                                                    {width > 120 && (
                                                        <div className="mt-1 flex items-center gap-3 text-[10px] font-medium opacity-80 truncate">
                                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {wo.location}</span>
                                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {wo.duration}h</span>
                                                        </div>
                                                    )}

                                                    {/* Hover Details */}
                                                    <div className="absolute inset-0 bg-indigo-900/90 text-white p-3 opacity-0 group-hover/wo:opacity-100 transition-opacity flex flex-col justify-center backdrop-blur-sm">
                                                        <div className="font-bold text-sm truncate">{wo.title}</div>
                                                        <div className="text-xs text-indigo-200 truncate mt-1">{wo.location} • {wo.duration} Hours</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
