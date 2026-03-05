import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, FileText, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    duration: number;
    createdAt: string;
}

export default function LearningAdmin() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Technical",
        level: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        duration: 0,
    });

    const queryClient = useQueryClient();

    const { data: courses = [] } = useQuery<any>({
        queryKey: ["/api/learning/admin/courses"],
    });

    const createCourseMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/learning/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/admin/courses"] });
            setIsCreateOpen(false);
            resetForm();
        },
    });

    const publishMutation = useMutation({
        mutationFn: async (courseId: string) => {
            const res = await fetch(`/api/learning/admin/courses/${courseId}/publish`, {
                method: "POST",
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/admin/courses"] });
        },
    });

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            category: "Technical",
            level: "BEGINNER",
            duration: 0,
        });
    };

    const drafts = courses.filter((c: Course) => c.status === "DRAFT");
    const published = courses.filter((c: Course) => c.status === "PUBLISHED");

    return (
        <StandardPage title="Learning Administration">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">
                        Create and manage courses
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Course</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Introduction to React"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what students will learn..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Technical">Technical</SelectItem>
                                            <SelectItem value="Leadership">Leadership</SelectItem>
                                            <SelectItem value="Compliance">Compliance</SelectItem>
                                            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="level">Level</Label>
                                    <Select
                                        value={formData.level}
                                        onValueChange={(v: any) => setFormData({ ...formData, level: v })}
                                    >
                                        <SelectTrigger id="level">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="duration">Duration (hours)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                    placeholder="5"
                                />
                            </div>

                            <Button
                                onClick={() => createCourseMutation.mutate(formData)}
                                disabled={!formData.title || createCourseMutation.isPending}
                                className="w-full"
                            >
                                Create Course
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Published</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{published.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Drafts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{drafts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Enrollments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {courses.reduce((acc: number, c: any) => acc + (c.enrolledCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course Management Tabs */}
            <Tabs defaultValue="published">
                <TabsList>
                    <TabsTrigger value="published">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Published ({published.length})
                    </TabsTrigger>
                    <TabsTrigger value="drafts">
                        <FileText className="w-4 h-4 mr-2" />
                        Drafts ({drafts.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="published" className="space-y-4">
                    {published.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No published courses</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {published.map((course: Course) => (
                                <Card key={course.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{course.title}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {course.description}
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-green-600">Published</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{course.category}</Badge>
                                            <Badge variant="secondary">{course.level}</Badge>
                                            <Badge variant="outline">{course.duration}h</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                Edit Content
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Users className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4">
                    {drafts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No draft courses</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {drafts.map((course: Course) => (
                                <Card key={course.id} className="border-yellow-200 bg-yellow-50/30">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{course.title}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {course.description}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline">Draft</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{course.category}</Badge>
                                            <Badge variant="secondary">{course.level}</Badge>
                                            <Badge variant="outline">{course.duration}h</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                Edit Course
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => publishMutation.mutate(course.id)}
                                                disabled={publishMutation.isPending}
                                            >
                                                Publish
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
