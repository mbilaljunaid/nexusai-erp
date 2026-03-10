import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Download, Filter, Sparkles, FileSpreadsheet, TrendingUp, TrendingDown } from "lucide-react";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

interface Candidate {
    id: string;
    personName: string;
    employeeId?: string;
    currentRole?: string;
    performance?: number; // 1-5
    potential?: number; // 1-5
    nineBoxPosition?: string; // e.g., "HIGH_PERF_HIGH_POT"
    readiness?: string; // e.g., "READY_NOW", "12_MONTHS"
    planId?: string;
    previousPosition?: string; // For movement tracking
}

interface NineBoxMatrixProps {
    candidates: Candidate[];
    onPositionChange: (candidateId: string, position: string) => void;
    onAutoPosition?: (candidateId: string) => void;
    plans?: Array<{ id: string; name: string }>;
}

const NINE_BOX_GRID = [
    // Row 3 (High Performance)
    { id: "HIGH_PERF_LOW_POT", label: "Solid Performer", performance: 3, potential: 1, color: "bg-yellow-500/10 border-yellow-200" },
    { id: "HIGH_PERF_MED_POT", label: "High Professional", performance: 3, potential: 2, color: "bg-amber-500/10 border-amber-200" },
    { id: "HIGH_PERF_HIGH_POT", label: "Star / High Potential", performance: 3, potential: 3, color: "bg-emerald-500/10 border-emerald-300" },

    // Row 2 (Medium Performance)
    { id: "MED_PERF_LOW_POT", label: "Effective Performer", performance: 2, potential: 1, color: "bg-slate-500/10 border-border" },
    { id: "MED_PERF_MED_POT", label: "Core Talent", performance: 2, potential: 2, color: "bg-blue-500/10 border-blue-200" },
    { id: "MED_PERF_HIGH_POT", label: "High Potential", performance: 2, potential: 3, color: "bg-cyan-500/10 border-cyan-200" },

    // Row 1 (Low Performance)
    { id: "LOW_PERF_LOW_POT", label: "Underperformer", performance: 1, potential: 1, color: "bg-rose-500/10 border-rose-200" },
    { id: "LOW_PERF_MED_POT", label: "Inconsistent", performance: 1, potential: 2, color: "bg-orange-500/10 border-orange-200" },
    { id: "LOW_PERF_HIGH_POT", label: "Enigma / New Hire", performance: 1, potential: 3, color: "bg-purple-500/10 border-purple-200" },
];

const READINESS_COLORS: Record<string, string> = {
    "READY_NOW": "border-l-4 border-l-emerald-500",
    "6_MONTHS": "border-l-4 border-l-green-500",
    "12_MONTHS": "border-l-4 border-l-blue-500",
    "18_MONTHS": "border-l-4 border-l-amber-500",
    "24_MONTHS": "border-l-4 border-l-orange-500",
    "24_PLUS": "border-l-4 border-l-rose-500",
};

function DraggableCandidate({ candidate, onAutoPosition }: { candidate: Candidate; onAutoPosition?: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: candidate.id,
        data: candidate
    });

    const initials = candidate.personName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const readinessColor = candidate.readiness ? READINESS_COLORS[candidate.readiness] || "" : "";

    // Determine movement direction
    const getMovementIcon = () => {
        if (!candidate.previousPosition || !candidate.nineBoxPosition) return null;

        const prev = NINE_BOX_GRID.find(b => b.id === candidate.previousPosition);
        const current = NINE_BOX_GRID.find(b => b.id === candidate.nineBoxPosition);

        if (!prev || !current) return null;

        const prevScore = prev.performance + prev.potential;
        const currentScore = current.performance + current.potential;

        if (currentScore > prevScore) return <TrendingUp className="h-3 w-3 text-green-600" />;
        if (currentScore < prevScore) return <TrendingDown className="h-3 w-3 text-rose-600" />;
        return null;
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(`bg-card border rounded-lg p-2 cursor-move hover:shadow-md transition-shadow relative ${readinessColor} ${isDragging ? "opacity-50" : ""
                }`)}
        >
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <p className="text-xs font-medium truncate">{candidate.personName}</p>
                        {getMovementIcon()}
                    </div>
                    {candidate.currentRole && (
                        <p className="text-[10px] text-muted-foreground truncate">{candidate.currentRole}</p>
                    )}
                </div>
                {onAutoPosition && (
                    <Button variant="default"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAutoPosition(candidate.id);
                        }}
                        className="text-purple-600 hover:text-purple-700"
                        title="Auto-position"
                    >
                        <Sparkles className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function DroppableBox({
    box,
    candidates,
    onAutoPosition
}: {
    box: typeof NINE_BOX_GRID[0];
    candidates: Candidate[];
    onAutoPosition?: (id: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: box.id,
        data: box
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(`${box.color} border-2 rounded-lg p-3 min-h-36 transition-all ${isOver ? "ring-2 ring-blue-400 ring-offset-2" : ""
                }`)}
        >
            <div className="mb-2">
                <h4 className="text-xs font-semibold text-foreground/90">{box.label}</h4>
                <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Perf: {box.performance}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Pot: {box.potential}
                    </Badge>
                    {candidates.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-card">
                            {candidates.length}
                        </Badge>
                    )}
                </div>
            </div>
            <div className="space-y-2">
                {candidates.map(candidate => (
                    <DraggableCandidate
                        key={candidate.id}
                        candidate={candidate}
                        onAutoPosition={onAutoPosition}
                    />
                ))}
                {candidates.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                        Drop candidates here
                    </div>
                )}
            </div>
        </div>
    );
}

export function NineBoxMatrix({ candidates, onPositionChange, onAutoPosition, plans = [] }: NineBoxMatrixProps) {
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("all");
    const [colorByReadiness, setColorByReadiness] = useState(true);
    const matrixRef = useRef<HTMLDivElement>(null);

    // Filter candidates by selected plan
    const filteredCandidates = selectedPlanId === "all"
        ? candidates
        : candidates.filter(c => c.planId === selectedPlanId);

    // Group candidates by their 9-box position
    const candidatesByPosition = filteredCandidates.reduce((acc, candidate) => {
        const position = candidate.nineBoxPosition || "MED_PERF_MED_POT"; // Default to center
        if (!acc[position]) acc[position] = [];
        acc[position].push(candidate);
        return acc;
    }, {} as Record<string, Candidate[]>);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveCandidate(event.active.data.current as Candidate);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const candidateId = active.id as string;
            const newPosition = over.id as string;

            // Trigger position change callback
            onPositionChange(candidateId, newPosition);
        }

        setActiveCandidate(null);
    };

    const handleExportToPNG = async () => {
        if (!matrixRef.current) return;

        try {
            const canvas = await html2canvas(matrixRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `9-box-matrix-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
        }
    };

    const handleExportToExcel = () => {
        // Prepare data for Excel
        const excelData = filteredCandidates.map(candidate => {
            const box = NINE_BOX_GRID.find(b => b.id === candidate.nineBoxPosition);
            return {
                'Name': candidate.personName,
                'Employee ID': candidate.employeeId || '',
                'Current Role': candidate.currentRole || '',
                'Performance': box?.performance || '',
                'Potential': box?.potential || '',
                '9-Box Category': box?.label || '',
                'Readiness': candidate.readiness || '',
                'Position': candidate.nineBoxPosition || '',
            };
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, // Name
            { wch: 15 }, // Employee ID
            { wch: 30 }, // Current Role
            { wch: 12 }, // Performance
            { wch: 12 }, // Potential
            { wch: 25 }, // Category
            { wch: 15 }, // Readiness
            { wch: 25 }, // Position
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '9-Box Matrix');

        // Export
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `9-box-matrix-${timestamp}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">9-Box Talent Matrix</h3>
                    {plans.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Plans</SelectItem>
                                    {plans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setColorByReadiness(!colorByReadiness)}
                    >
                        {colorByReadiness ? "Hide" : "Show"} Readiness Colors
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportToExcel}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportToPNG}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export PNG
                    </Button>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Drag and drop candidates to position them based on performance and potential
                {colorByReadiness && " • Left border color indicates readiness timeline"}
                {onAutoPosition && " • Click sparkle icon for AI-powered auto-positioning"}
            </p>

            {/* Legend */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
                        <span>High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                        <span>Core Talent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-rose-100 border border-rose-300 rounded"></div>
                        <span>Needs Attention</span>
                    </div>
                </div>

                {colorByReadiness && (
                    <div className="flex gap-3 text-xs">
                        <span className="font-medium">Readiness:</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                            <span>Ready</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Mid-term</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-rose-500 rounded"></div>
                            <span>Long-term</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 9-Box Grid */}
            <div ref={matrixRef}>
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-card">
                        {/* Y-axis label */}
                        <div className="flex gap-2">
                            <div className="flex flex-col justify-around items-center w-12 text-xs font-semibold text-muted-foreground">
                                <div className="rotate-[-90deg] whitespace-nowrap">Performance →</div>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 space-y-2">
                                {/* Row 3 - High Performance */}
                                <div className="grid grid-cols-3 gap-2">
                                    {NINE_BOX_GRID.slice(0, 3).map(box => (
                                        <DroppableBox
                                            key={box.id}
                                            box={box}
                                            candidates={candidatesByPosition[box.id] || []}
                                            onAutoPosition={onAutoPosition}
                                        />
                                    ))}
                                </div>

                                {/* Row 2 - Medium Performance */}
                                <div className="grid grid-cols-3 gap-2">
                                    {NINE_BOX_GRID.slice(3, 6).map(box => (
                                        <DroppableBox
                                            key={box.id}
                                            box={box}
                                            candidates={candidatesByPosition[box.id] || []}
                                            onAutoPosition={onAutoPosition}
                                        />
                                    ))}
                                </div>

                                {/* Row 1 - Low Performance */}
                                <div className="grid grid-cols-3 gap-2">
                                    {NINE_BOX_GRID.slice(6, 9).map(box => (
                                        <DroppableBox
                                            key={box.id}
                                            box={box}
                                            candidates={candidatesByPosition[box.id] || []}
                                            onAutoPosition={onAutoPosition}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* X-axis label */}
                        <div className="text-center text-xs font-semibold text-muted-foreground mt-2">
                            Potential →
                        </div>
                        <div className="flex justify-around text-[10px] text-muted-foreground mt-1">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeCandidate && (
                            <Card className="w-48 shadow-lg">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold">{activeCandidate.personName}</p>
                                            <p className="text-xs text-muted-foreground">{activeCandidate.currentRole}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
