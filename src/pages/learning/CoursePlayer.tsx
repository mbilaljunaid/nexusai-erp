import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    FileText,
    PlayCircle,
    Award,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";


interface CourseContent {
    id: string;
    courseId: string;
    courseTitle: string;
    modules: Module[];
    currentModuleId?: string;
    progress: number;
}

interface Module {
    id: string;
    title: string;
    type: "VIDEO" | "DOCUMENT" | "QUIZ";
    duration?: number;
    completed: boolean;
    content?: string;
    videoUrl?: string;
}

export default function CoursePlayer() {
    const { enrollmentId } = useParams() as any;
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const queryClient = useQueryClient();

    const { data: courseContent } = useQuery<any>({
        queryKey: ["/api/learning/enrollments", enrollmentId, "content"],
        enabled: !!enrollmentId,
    });

    const completeModuleMutation = useMutation({
        mutationFn: async (moduleId: string) => {
            const res = await fetch(`/api/learning/enrollments/${enrollmentId}/complete-module`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduleId }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/learning/enrollments", enrollmentId, "content"],
            });
        },
    });

    if (!courseContent) {
        return <div className="p-6">Loading...</div>;
    }

    const modules: Module[] = courseContent.modules || [];
    const currentModule = modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === modules.length - 1;
    const isFirstModule = currentModuleIndex === 0;

    const handleNext = () => {
        if (!isLastModule) {
            setCurrentModuleIndex(currentModuleIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstModule) {
            setCurrentModuleIndex(currentModuleIndex - 1);
        }
    };

    const handleCompleteModule = () => {
        if (currentModule) {
            completeModuleMutation.mutate(currentModule.id);
            if (!isLastModule) {
                handleNext();
            }
        }
    };

    return (
        <StandardPage title="{courseContent.courseTitle}">
            {/* Header */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <div>

                        <p className="text-sm text-muted-foreground">
                            Module {currentModuleIndex + 1} of {modules.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
                        <div className="flex items-center gap-2">
                            <Progress value={courseContent.progress || 0} className="w-32" />
                            <span className="text-sm font-medium">{courseContent.progress || 0}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Module List */}
                <div className="w-80 border-r overflow-y-auto p-4 space-y-2">
                    <h3 className="font-semibold mb-3">Course Modules</h3>
                    {modules.map((module, idx) => (
                        <div
                            key={module.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${idx === currentModuleIndex
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent"
                                }`}
                            onClick={() => setCurrentModuleIndex(idx)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{module.title}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                            {module.type}
                                        </Badge>
                                        {module.duration && (
                                            <span className="text-xs text-muted-foreground">{module.duration}min</span>
                                        )}
                                    </div>
                                </div>
                                {module.completed && (
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    {currentModule && (
                        <>
                            {/* Content Display */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold mb-2">{currentModule.title}</h2>
                                        <div className="flex items-center gap-2">
                                            <Badge>{currentModule.type}</Badge>
                                            {currentModule.completed && (
                                                <Badge variant="default" className="bg-green-600">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Video Player */}
                                    {currentModule.type === "VIDEO" && (
                                        <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-6">
                                            <PlayCircle className="w-16 h-16 text-white opacity-75" />
                                            <p className="text-white ml-4">Video Player Placeholder</p>
                                        </div>
                                    )}

                                    {/* Document Content */}
                                    {currentModule.type === "DOCUMENT" && (
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5" />
                                                    <CardTitle>Course Material</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose max-w-none">
                                                    {currentModule.content || "Content will appear here..."}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Quiz */}
                                    {currentModule.type === "QUIZ" && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Assessment</CardTitle>
                                                <CardDescription>
                                                    Complete this quiz to progress
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground">
                                                    Quiz interface will appear here...
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Footer */}
                            <div className="border-t p-4">
                                <div className="max-w-4xl mx-auto flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={isFirstModule}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Previous
                                    </Button>

                                    <div className="flex gap-2">
                                        {!currentModule.completed && (
                                            <Button onClick={handleCompleteModule}>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark Complete
                                            </Button>
                                        )}

                                        {!isLastModule ? (
                                            <Button onClick={handleNext}>
                                                Next Module
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button variant="default" className="bg-green-600">
                                                <Award className="w-4 h-4 mr-2" />
                                                Finish Course
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}
