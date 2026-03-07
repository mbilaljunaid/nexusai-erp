import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface ScheduleTask {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
    modelElements: string[]; // BIM element IDs associated with this task
}

interface ScheduleOverlayProps {
    projectId: string;
    onHighlightElements?: (elementIds: string[]) => void;
}

/**
 * 4D BIM Schedule Overlay
 * 
 * Visualizes construction schedule timeline and highlights associated BIM elements.
 * Enables time-based simulation of construction sequence.
 */
export function ScheduleOverlay({ projectId, onHighlightElements }: ScheduleOverlayProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentDay, setCurrentDay] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Mock schedule data - in production, fetch from Primavera/MS Project API
    const tasks: ScheduleTask[] = [
        {
            id: "task-001",
            name: "Foundation & Excavation",
            startDate: "2026-02-01",
            endDate: "2026-02-15",
            progress: 100,
            status: "COMPLETED",
            modelElements: ["foundation-001", "excavation-001"]
        },
        {
            id: "task-002",
            name: "Structural Frame - Level 1",
            startDate: "2026-02-16",
            endDate: "2026-02-28",
            progress: 85,
            status: "IN_PROGRESS",
            modelElements: ["frame-level1-001", "frame-level1-002"]
        },
        {
            id: "task-003",
            name: "Structural Frame - Level 2",
            startDate: "2026-03-01",
            endDate: "2026-03-14",
            progress: 45,
            status: "IN_PROGRESS",
            modelElements: ["frame-level2-001", "frame-level2-002"]
        },
        {
            id: "task-004",
            name: "MEP Rough-In - Level 1",
            startDate: "2026-03-01",
            endDate: "2026-03-10",
            progress: 0,
            status: "NOT_STARTED",
            modelElements: ["mep-level1-hvac", "mep-level1-electrical"]
        },
        {
            id: "task-005",
            name: "Exterior Envelope",
            startDate: "2026-03-15",
            endDate: "2026-04-05",
            progress: 0,
            status: "NOT_STARTED",
            modelElements: ["exterior-walls", "windows-001"]
        }
    ];

    const projectStartDate = new Date("2026-02-01");
    const projectDuration = 90; // days
    const currentDate = addDays(projectStartDate, currentDay);

    const statusConfig = {
        NOT_STARTED: { color: "bg-gray-100 text-gray-800", icon: Circle },
        IN_PROGRESS: { color: "bg-blue-100 text-blue-800", icon: Clock },
        COMPLETED: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
        DELAYED: { color: "bg-red-100 text-red-800", icon: AlertCircle }
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);

        if (!isPlaying) {
            // Start playback simulation
            const interval = setInterval(() => {
                setCurrentDay(prev => {
                    if (prev >= projectDuration) {
                        setIsPlaying(false);
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000 / playbackSpeed); // Adjust speed
        }
    };

    const getTasksAtCurrentDate = () => {
        return tasks.filter(task => {
            const start = new Date(task.startDate);
            const end = new Date(task.endDate);
            return currentDate >= start && currentDate <= end;
        });
    };

    const getCompletedTasks = () => {
        return tasks.filter(task => {
            const end = new Date(task.endDate);
            return currentDate > end;
        });
    };

    const activeTasks = getTasksAtCurrentDate();
    const completedTasks = getCompletedTasks();

    return (
        <div className="space-y-4">
            {/* Timeline Controls */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        4D Construction Sequence
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date Display */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Current Date</div>
                            <div className="text-2xl font-bold">{format(currentDate, "MMM d, yyyy")}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Day</div>
                            <div className="text-2xl font-bold">{currentDay} / {projectDuration}</div>
                        </div>
                    </div>

                    {/* Timeline Slider */}
                    <div className="space-y-2">
                        <Slider
                            value={[currentDay]}
                            onValueChange={([value]) => setCurrentDay(value)}
                            max={projectDuration}
                            step={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{format(projectStartDate, "MMM d")}</span>
                            <span>{format(addDays(projectStartDate, projectDuration), "MMM d")}</span>
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentDay(0)}
                            disabled={currentDay === 0}
                        >
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            onClick={handlePlayPause}
                            className="w-24"
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Play
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentDay(projectDuration)}
                            disabled={currentDay === projectDuration}
                        >
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Playback Speed */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">Speed:</span>
                        <div className="flex gap-2 flex-1">
                            {[0.5, 1, 2, 5].map(speed => (
                                <Button
                                    key={speed}
                                    size="sm"
                                    variant={playbackSpeed === speed ? "default" : "outline"}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className="flex-1"
                                >
                                    {speed}x
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Tasks at Current Date */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                        Active Tasks ({activeTasks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeTasks.length > 0 ? (
                        <div className="space-y-2">
                            {activeTasks.map(task => {
                                const config = statusConfig[task.status];
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={task.id}
                                        className="border rounded-lg p-3 bg-blue-50/50"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm mb-1">{task.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(task.startDate), "MMM d")} - {format(new Date(task.endDate), "MMM d")}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={config.color}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {task.progress}%
                                            </Badge>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all"
                                                style={{ width: `${task.progress}%`}}
                                            />
                                        </div>

                                        {/* Highlight Button */}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="w-full mt-2"
                                            onClick={() => onHighlightElements?.(task.modelElements)}
                                        >
                                            Highlight in Model ({task.modelElements.length} elements)
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            No active tasks on this date
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Completed ({completedTasks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {completedTasks.length > 0 ? (
                        <div className="space-y-1">
                            {completedTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-2 rounded text-sm bg-green-500/10"
                                >
                                    <span className="text-green-800">{task.name}</span>
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            No completed tasks yet
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
