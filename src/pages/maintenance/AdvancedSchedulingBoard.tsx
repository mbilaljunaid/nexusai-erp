import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar,
    Users,
    Wrench,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    ArrowRight,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledWorkOrder {
    id: string;
    woNumber: string;
    description: string;
    assetName: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "SCHEDULED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";
    scheduledStart: string;
    scheduledEnd: string;
    estimatedHours: number;
    assignedTechnician?: string;
    technicianId?: string;
    skillRequired: string;
}

interface Technician {
    id: string;
    name: string;
    skills: string[];
    availability: number; // percentage
    currentLoad: number; // hours this week
    maxCapacity: number; // hours per week
}

interface TimeSlot {
    date: string;
    dayOfWeek: string;
    isToday: boolean;
}

// Helper function to generate date range
const generateDateRange = (startDate: Date, days: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        slots.push({
            date: date.toISOString().split('T')[0],
            dayOfWeek: dayNames[date.getDay()],
            isToday: date.getTime() === today.getTime()
        });
    }
    return slots;
};

export function AdvancedSchedulingBoard() {
    const [workOrders, setWorkOrders] = useState<ScheduledWorkOrder[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewStart, setViewStart] = useState(new Date());
    const [viewDays] = useState(7); // Show 7 days
    const [selectedTechnician, setSelectedTechnician] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");

    useEffect(() => {
        loadScheduleData();
    }, []);

    const loadScheduleData = async () => {
        setLoading(true);
        try {
            const [techRes, woRes] = await Promise.all([
                fetch('/api/maintenance/technicians'),
                fetch('/api/maintenance/scheduled-work-orders')
            ]);

            if (techRes.ok) {
                const fetchedTechs = await techRes.json();
                setTechnicians(fetchedTechs.length ? fetchedTechs : []);
            }
            if (woRes.ok) {
                const fetchedWOs = await woRes.json();
                setWorkOrders(fetchedWOs.length ? fetchedWOs : []);
            }
        } catch (error) {
        } catch (error) {
            console.error("Failed to load schedule data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityConfig = (priority: ScheduledWorkOrder["priority"]) => {
        switch (priority) {
            case "URGENT":
                return { color: "bg-red-600", label: "Urgent", textColor: "text-white" };
            case "HIGH":
                return { color: "bg-orange-500", label: "High", textColor: "text-white" };
            case "MEDIUM":
                return { color: "bg-blue-500", label: "Medium", textColor: "text-white" };
            case "LOW":
                return { color: "bg-gray-400", label: "Low", textColor: "text-white" };
        }
    };

    const getStatusConfig = (status: ScheduledWorkOrder["status"]) => {
        switch (status) {
            case "COMPLETED":
                return { icon: CheckCircle2, color: "text-green-600", label: "Completed" };
            case "IN_PROGRESS":
                return { icon: Wrench, color: "text-blue-600", label: "In Progress" };
            case "PAUSED":
                return { icon: AlertCircle, color: "text-yellow-600", label: "Paused" };
            case "SCHEDULED":
                return { icon: Clock, color: "text-gray-600", label: "Scheduled" };
        }
    };

    const handlePrevWeek = () => {
        const newDate = new Date(viewStart);
        newDate.setDate(newDate.getDate() - 7);
        setViewStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(viewStart);
        newDate.setDate(newDate.getDate() + 7);
        setViewStart(newDate);
    };

    const handleToday = () => {
        setViewStart(new Date());
    };

    const timeSlots = generateDateRange(viewStart, viewDays);

    const filteredWOs = workOrders.filter(wo => {
        if (selectedTechnician !== "all" && wo.technicianId !== selectedTechnician) return false;
        if (priorityFilter !== "all" && wo.priority !== priorityFilter) return false;
        return true;
    });

    // Calculate if WO is visible in current view
    const isWOInView = (wo: ScheduledWorkOrder) => {
        const woStart = new Date(wo.scheduledStart);
        const woEnd = new Date(wo.scheduledEnd);
        const viewEnd = new Date(viewStart);
        viewEnd.setDate(viewEnd.getDate() + viewDays);

        return woStart <= viewEnd && woEnd >= viewStart;
    };

    // Calculate WO position in grid
    const getWOPosition = (wo: ScheduledWorkOrder) => {
        const woStart = new Date(wo.scheduledStart);
        const gridStart = new Date(viewStart);
        gridStart.setHours(0, 0, 0, 0);
        woStart.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((woStart.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24));
        const woEnd = new Date(wo.scheduledEnd);
        woEnd.setHours(0, 0, 0, 0);
        const duration = Math.max(1, Math.floor((woEnd.getTime() - woStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        return { startCol: daysDiff, span: duration };
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Advanced Scheduling Board</h1>
                <p className="text-muted-foreground">Visual work order scheduling with resource capacity management</p>
            </div>

            {/* Technician Resource Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                {technicians.map(tech => {
                    const loadPercent = (tech.currentLoad / tech.maxCapacity) * 100;
                    return (
                        <Card key={tech.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="font-bold mb-1">{tech.name}</div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {tech.skills.join(", ")}
                                        </div>
                                    </div>
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Capacity:</span>
                                        <span className="font-bold">{tech.currentLoad}h / {tech.maxCapacity}h</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all",
                                                loadPercent >= 95 ? "bg-red-600" :
                                                    loadPercent >= 80 ? "bg-yellow-600" :
                                                        "bg-green-600"
                                            )}
                                            style={{ width: `${Math.min(loadPercent, 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-right text-muted-foreground">
                                        {loadPercent.toFixed(0)}% utilized
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Filters and Navigation */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleNextWeek}>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Technicians" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Technicians</SelectItem>
                                    {technicians.map(tech => (
                                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gantt-Style Schedule Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Date Headers */}
                    <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: `200px repeat(${viewDays}, 1fr)` }}>
                        <div className="font-bold text-sm p-2">Technician / Asset</div>
                        {timeSlots.map(slot => (
                            <div
                                key={slot.date}
                                className={cn(
                                    "text-center p-2 text-xs rounded",
                                    slot.isToday ? "bg-blue-100 font-bold" : "bg-gray-50"
                                )}
                            >
                                <div className="font-medium">{slot.dayOfWeek}</div>
                                <div className="text-muted-foreground">{new Date(slot.date).getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Work Order Rows grouped by Technician */}
                    <div className="space-y-2">
                        {technicians.map(tech => {
                            const techWOs = filteredWOs.filter(wo => wo.technicianId === tech.id && isWOInView(wo));

                            if (techWOs.length === 0) return null;

                            return (
                                <div key={tech.id} className="space-y-1">
                                    {techWOs.map(wo => {
                                        const position = getWOPosition(wo);
                                        const priorityConfig = getPriorityConfig(wo.priority);
                                        const statusConfig = getStatusConfig(wo.status);
                                        const StatusIcon = statusConfig.icon;

                                        if (position.startCol >= viewDays || position.startCol + position.span < 0) return null;

                                        const visibleStartCol = Math.max(0, position.startCol);
                                        const visibleSpan = Math.min(position.span, viewDays - visibleStartCol);

                                        return (
                                            <div
                                                key={wo.id}
                                                className="grid gap-1"
                                                style={{ gridTemplateColumns: `200px repeat(${viewDays}, 1fr)` }}
                                            >
                                                {/* WO Info */}
                                                <div className="p-2 text-xs border rounded bg-gray-50">
                                                    <div className="font-mono font-bold mb-1">{wo.woNumber}</div>
                                                    <div className="truncate text-muted-foreground">{wo.assetName}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <StatusIcon className={cn("h-3 w-3", statusConfig.color)} />
                                                        <span className={statusConfig.color}>{wo.estimatedHours}h</span>
                                                    </div>
                                                </div>

                                                {/* Timeline Cells */}
                                                {Array.from({ length: viewDays }).map((_, idx) => {
                                                    const isStart = idx === visibleStartCol;
                                                    const isWithinSpan = idx >= visibleStartCol && idx < visibleStartCol + visibleSpan;

                                                    return (
                                                        <div key={idx} className="relative h-16 border-l border-b border-gray-200">
                                                            {isStart && isWithinSpan && (
                                                                <div
                                                                    className={cn(
                                                                        "absolute top-1 left-1 right-1 bottom-1 rounded p-1 shadow-sm",
                                                                        priorityConfig.color,
                                                                        priorityConfig.textColor,
                                                                        "text-xs overflow-hidden"
                                                                    )}
                                                                    style={{
                                                                        width: `calc(${visibleSpan * 100}% + ${(visibleSpan - 1) * 4}px)`
                                                                    }}
                                                                >
                                                                    <div className="font-bold truncate">{wo.woNumber}</div>
                                                                    <div className="truncate opacity-90">{wo.description}</div>
                                                                    <div className="text-xs opacity-75 mt-0.5">{tech.name}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 mt-6 pt-4 border-t text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 rounded" />
                            <span>Urgent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded" />
                            <span>High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded" />
                            <span>Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-400 rounded" />
                            <span>Low</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Work Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Scheduled Work Orders ({filteredWOs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredWOs.map(wo => {
                            const priorityConfig = getPriorityConfig(wo.priority);
                            const statusConfig = getStatusConfig(wo.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div key={wo.id} className="border rounded p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-mono font-bold">{wo.woNumber}</span>
                                                <Badge variant="outline" className={cn("text-xs", priorityConfig.color, priorityConfig.textColor)}>
                                                    {priorityConfig.label}
                                                </Badge>
                                                <div className={cn("flex items-center gap-1 text-xs", statusConfig.color)}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusConfig.label}
                                                </div>
                                            </div>
                                            <div className="font-medium mb-1">{wo.description}</div>
                                            <div className="text-sm text-muted-foreground">{wo.assetName}</div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="font-medium">{wo.assignedTechnician}</div>
                                            <div className="text-muted-foreground">{wo.estimatedHours}h estimated</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {wo.scheduledStart === wo.scheduledEnd
                                                    ? wo.scheduledStart
                                                    : `${wo.scheduledStart} - ${wo.scheduledEnd}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AdvancedSchedulingBoard;
