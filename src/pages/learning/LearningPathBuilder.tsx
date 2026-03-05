import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, GripVertical, X, BookMarked } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface LearningPath {
    id: string;
    title: string;
    description: string;
    courses: PathCourse[];
    duration: number;
    enrolledCount: number;
}

interface PathCourse {
    id: string;
    courseId: string;
    courseTitle: string;
    sequence: number;
    required: boolean;
}

export default function LearningPathBuilder() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { data: paths = [] } = useQuery<any>({
        queryKey: ["/api/learning/paths"],
    });

    const { data: availableCourses = [] } = useQuery<any>({
        queryKey: ["/api/learning/courses"],
    });

    const createPathMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/learning/paths", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/paths"] });
            setIsCreateOpen(false);
            setFormData({ title: "", description: "" });
        },
    });

    const addCourseMutation = useMutation({
        mutationFn: async ({ pathId, courseId }: { pathId: string; courseId: string }) => {
            const res = await fetch(`/api/learning/paths/${pathId}/courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/paths"] });
        },
    });

    const selectedPath = paths.find((p: LearningPath) => p.id === selectedPathId);

    return (
        <StandardPage title="Learning Path Builder">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">
                        Create structured learning curricula
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Learning Path
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Learning Path</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="title">Path Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Frontend Developer Track"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the learning journey..."
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={() => createPathMutation.mutate(formData)}
                                disabled={!formData.title || createPathMutation.isPending}
                                className="w-full"
                            >
                                Create Path
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paths List */}
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Learning Paths</h2>
                    {paths.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <BookMarked className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No learning paths created</p>
                            </CardContent>
                        </Card>
                    ) : (
                        paths.map((path: LearningPath) => (
                            <Card
                                key={path.id}
                                className={`cursor-pointer transition-all ${selectedPathId === path.id
                                        ? "border-primary ring-2 ring-primary"
                                        : "hover:border-primary/50"
                                    }`}
                                onClick={() => setSelectedPathId(path.id)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg">{path.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {path.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{path.courses?.length || 0} courses</span>
                                        <span>{path.duration}h total</span>
                                        <span>{path.enrolledCount} enrolled</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Path Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Path Editor</CardTitle>
                        <CardDescription>
                            {selectedPath ? `Editing: ${selectedPath.title}` : "Select a path to edit"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedPath ? (
                            <p className="text-center py-12 text-muted-foreground">
                                Select a learning path to manage courses
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {/* Course Sequence */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Course Sequence</h3>
                                    <div className="space-y-2">
                                        {selectedPath.courses && selectedPath.courses.length > 0 ? (
                                            selectedPath.courses.map((course: PathCourse, idx: number) => (
                                                <div key={course.id} className="flex items-center gap-2 p-3 border rounded-lg">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{course.courseTitle}</div>
                                                        <div className="text-xs text-muted-foreground">Step {idx + 1}</div>
                                                    </div>
                                                    {course.required && <Badge variant="secondary">Required</Badge>}
                                                    <Button variant="ghost" size="sm">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-6">
                                                No courses added yet
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Add Course */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Add Course</h3>
                                    <div className="space-y-2">
                                        {availableCourses.slice(0, 3).map((course: any) => (
                                            <div key={course.id} className="flex items-center justify-between p-2 border rounded hover:bg-accent">
                                                <span className="text-sm">{course.title}</span>
                                                <Button
                                                    size="sm"
                                                    onClick={() => addCourseMutation.mutate({ pathId: selectedPath.id, courseId: course.id })}
                                                    disabled={addCourseMutation.isPending}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
