import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    LineChart,
    Save,
    Users,
    Search,
    Filter,
    ArrowDownToLine,
    ArrowUpRight,
    Target,
    MoreHorizontal
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

type Employee = {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    performance: number; // 1-3
    potential: number; // 1-3
    isFlightRisk: boolean;
};

// Map coordinates to Box IDs for the 9-box grid
// X is Performance (1=Low, 2=Medium, 3=High)
// Y is Potential (1=Low, 2=Medium, 3=High)
// Box ID format: "box_X_Y"
const gridDefinition = [
    { x: 1, y: 3, id: "box_1_3", label: "Enigma", color: "bg-blue-50/50 dark:bg-blue-900/10", border: "border-blue-200 dark:border-blue-800" },
    { x: 2, y: 3, id: "box_2_3", label: "Growth Employee", color: "bg-indigo-50/50 dark:bg-indigo-900/10", border: "border-indigo-200 dark:border-indigo-800" },
    { x: 3, y: 3, id: "box_3_3", label: "Future Leader", color: "bg-emerald-50/50 dark:bg-emerald-900/10", border: "border-emerald-200 dark:border-emerald-800" },
    { x: 1, y: 2, id: "box_1_2", label: "Dilemma", color: "bg-amber-50/50 dark:bg-amber-900/10", border: "border-amber-200 dark:border-amber-800" },
    { x: 2, y: 2, id: "box_2_2", label: "Core Employee", color: "bg-blue-50/50 dark:bg-blue-900/10", border: "border-blue-200 dark:border-blue-800" },
    { x: 3, y: 2, id: "box_3_2", label: "High Impact", color: "bg-indigo-50/50 dark:bg-indigo-900/10", border: "border-indigo-200 dark:border-indigo-800" },
    { x: 1, y: 1, id: "box_1_1", label: "Underperformer", color: "bg-red-50/50 dark:bg-red-900/10", border: "border-red-200 dark:border-red-800" },
    { x: 2, y: 1, id: "box_2_1", label: "Effective", color: "bg-amber-50/50 dark:bg-amber-900/10", border: "border-amber-200 dark:border-amber-800" },
    { x: 3, y: 1, id: "box_3_1", label: "Trusted Pro", color: "bg-blue-50/50 dark:bg-blue-900/10", border: "border-blue-200 dark:border-blue-800" },
];

const mockEmployees: Employee[] = [
    { id: "e1", name: "Sarah Jenkins", role: "Sr. Engineer", performance: 3, potential: 3, isFlightRisk: false },
    { id: "e2", name: "Marcus Torres", role: "Product Mgr", performance: 2, potential: 3, isFlightRisk: true },
    { id: "e3", name: "Elena Rostova", role: "Designer", performance: 3, potential: 2, isFlightRisk: false },
    { id: "e4", name: "David Kim", role: "QA Lead", performance: 2, potential: 2, isFlightRisk: false },
    { id: "e5", name: "Anita Patel", role: "DevOps", performance: 1, potential: 2, isFlightRisk: false },
    { id: "e6", name: "John Smith", role: "Jr. Engineer", performance: 1, potential: 1, isFlightRisk: true },
    { id: "e7", name: "Lisa Wong", role: "Tech Lead", performance: 3, potential: 1, isFlightRisk: false },
];

export default function PerformanceCalibrationBoard() {
    const { toast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [searchTerm, setSearchTerm] = useState("");

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId) return;

        // Parse new box ID to get coordinates
        const [, xStr, yStr] = destination.droppableId.split('_');
        const newPerf = parseInt(xStr);
        const newPot = parseInt(yStr);

        // Update employee
        setEmployees(prev => prev.map(emp => {
            if (emp.id === draggableId) {
                return { ...emp, performance: newPerf, potential: newPot };
            }
            return emp;
        }));

        toast({
            title: "Rating Calibrated",
            description: "Employee rating updated in the working draft.",
        });
    };

    const handleSave = () => {
        toast({
            title: "Calibration Saved",
            description: "Changes have feeding into the final performance review cycle."
        });
    };

    const getEmployeesForBox = (x: number, y: number) => {
        return employees.filter(e =>
            e.performance === x &&
            e.potential === y &&
            e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <StandardPage
            title="Talent Calibration Board"
            description="Facilitate leadership reviews using a drag-and-drop 9-box performance vs. potential grid."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Talent Management', href: '/hr/performance' },
                { label: 'Calibration Board' }
            ]}
        >
            <div className="max-w-[1400px] mx-auto pb-12 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm flex-wrap gap-4 lg:flex-nowrap">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hidden sm:block">
                            <LineChart className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold">Q4 2025 Engineering Calibration</h2>
                                <StatusBadge status="In Progress" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Facilitator: Maya Chen • Org: Engineering Global</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Find employee..."
                                className="pl-9 bg-zinc-500/10 dark:bg-zinc-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" /> Save Draft
                        </Button>
                    </div>
                </div>

                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="border-b bg-slate-500/10 dark:bg-zinc-900/20 pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base flex items-center gap-2">Interactive 9-Box Grid</CardTitle>
                            <div className="flex gap-4 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Not Flight Risk</span>
                                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Flight Risk</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 overflow-x-auto">

                        <div className="min-w-[900px]">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                {/* Grid Layout Structure */}
                                <div className="flex">
                                    {/* Y-Axis Label */}
                                    <div className="flex flex-col justify-center items-center w-12 mr-2">
                                        <div className="rotate-180 [writing-mode:vertical-rl] text-center font-bold tracking-widest text-muted-foreground uppercase text-sm flex items-center gap-2">
                                            POTENTIAL <ArrowUpRight className="h-4 w-4 -rotate-45" />
                                        </div>
                                    </div>

                                    {/* 9-Box Container */}
                                    <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-4">
                                        {gridDefinition.map((box) => (
                                            <div key={box.id} className={cn(`flex flex-col rounded-xl border-2 ${box.color} ${box.border} overflow-hidden shadow-sm h-56`)}>
                                                <div className="p-2 border-b bg-white/50 dark:bg-black/20 flex justify-between items-center backdrop-blur-sm">
                                                    <span className="font-semibold text-sm tracking-tight">{box.label}</span>
                                                    <Badge variant="outline" className="text-[10px] bg-white dark:bg-zinc-950 font-mono">
                                                        {getEmployeesForBox(box.x, box.y).length}
                                                    </Badge>
                                                </div>

                                                <Droppable droppableId={box.id}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={cn(`flex-1 p-2 overflow-y-auto space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''}`)}
                                                        >
                                                            {getEmployeesForBox(box.x, box.y).map((emp, index) => (
                                                                <Draggable key={emp.id} draggableId={emp.id} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={cn(`bg-white dark:bg-zinc-950 border p-2 rounded-lg shadow-sm group hover:border-blue-400 dark:hover:border-blue-500 transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 scale-105' : ''}`)}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="relative">
                                                                                    <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-zinc-950 shadow-sm">
                                                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                                                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    {emp.isFlightRisk && (
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger asChild>
                                                                                                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950 animate-pulse" />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>
                                                                                                    <p>High Flight Risk</p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{emp.name}</p>
                                                                                    <p className="text-[10px] text-muted-foreground truncate">{emp.role}</p>
                                                                                </div>
                                                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="More options">
                                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* X-Axis Label */}
                                <div className="flex mt-4 ml-14">
                                    <div className="w-full text-center font-bold tracking-widest text-muted-foreground uppercase text-sm flex items-center justify-center gap-2">
                                        PERFORMANCE <ArrowUpRight className="h-4 w-4 rotate-45" />
                                    </div>
                                </div>
                            </DragDropContext>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </StandardPage>
    );
}
