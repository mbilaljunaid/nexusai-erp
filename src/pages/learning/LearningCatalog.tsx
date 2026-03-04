import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Clock, Users, Star, Play } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    duration: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    instructor: string;
    rating: number;
    enrolledCount: number;
    thumbnailUrl?: string;
    isEnrolled?: boolean;
}

export default function LearningCatalog() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const queryClient = useQueryClient();

    // Fetch courses
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ["/api/learning/courses", searchQuery, selectedCategory],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append("q", searchQuery);
            if (selectedCategory !== "ALL") params.append("category", selectedCategory);

            const res = await fetch(`/api/learning/courses?${params}`);
            return res.json();
        },
    });

    // Enroll mutation
    const enrollMutation = useMutation({
        mutationFn: async (courseId: string) => {
            const res = await fetch("/api/learning/enrollments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/courses"] });
            queryClient.invalidateQueries({ queryKey: ["/api/learning/my-learning"] });
        },
    });

    const categories = ["ALL", "Technical", "Leadership", "Compliance", "Soft Skills"];

    return (
        <StandardPage title="Learning Catalog">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Discover courses to advance your career
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                    <TabsList>
                        {categories.map((cat) => (
                            <TabsTrigger key={cat} value={cat}>
                                {cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p className="col-span-full text-center py-12 text-muted-foreground">
                        Loading courses...
                    </p>
                ) : courses.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No courses found</p>
                    </div>
                ) : (
                    courses.map((course: Course) => (
                        <Card key={course.id} className="flex flex-col">
                            {/* Thumbnail */}
                            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Play className="w-12 h-12 text-primary opacity-50" />
                            </div>

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                                    {course.isEnrolled && (
                                        <Badge variant="default">Enrolled</Badge>
                                    )}
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {course.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                                {/* Course Meta */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {course.duration}h
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {course.enrolledCount}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            {course.rating}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">{course.category}</Badge>
                                        <Badge variant="secondary">{course.level}</Badge>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Instructor: {course.instructor}
                                    </p>
                                </div>

                                {/* Actions */}
                                {!course.isEnrolled ? (
                                    <Button
                                        onClick={() => enrollMutation.mutate(course.id)}
                                        disabled={enrollMutation.isPending}
                                        className="w-full"
                                    >
                                        Enroll Now
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full">
                                        Continue Learning
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </StandardPage>
    );
}
