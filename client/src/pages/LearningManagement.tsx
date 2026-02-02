import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, PlayCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function LearningManagement() {
  const [activeTab, setActiveTab] = useState("catalog");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch Catalog
  const { data: courses, isLoading: isCatalogLoading } = useQuery({
    queryKey: ["learning-courses", searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/learning/courses?q=${searchQuery}`);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    }
  });

  // Fetch My Learning (Mocking PersonID for MVP dev)
  const { data: enrollments, isLoading: isMyLearningLoading } = useQuery({
    queryKey: ["my-learning"],
    queryFn: async () => {
      // Assuming context middleware provides user, but for now we might need a fallback if not logged in
      const res = await fetch("/api/learning/my-enrollments?personId=current_user"); // Dev hack: query param fallback
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return res.json();
    }
  });

  // Create Course Mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/learning/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create course");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-courses"] });
      setIsCreateOpen(false);
      toast({ title: "Course Created" });
    },
  });

  // Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      // 1. Create Offering (Just-in-time for MVP demo) or Find one
      // For simplicity, we'll create a default "Self Paced" offering if one doesn't exist, 
      // but in real app we'd let user pick dates. This is a simplified "Start Now" flow.

      const offeringRes = await fetch("/api/learning/offerings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: "Self Paced Session",
          startDate: new Date().toISOString()
        })
      });
      const offering = await offeringRes.json();

      const res = await fetch("/api/learning/enroll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: "current_user", offeringId: offering.id }),
      });
      if (!res.ok) throw new Error("Failed to enroll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-learning"] });
      toast({ title: "Enrolled Successfully" });
      setActiveTab("my-learning");
    },
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createCourseMutation.mutate({
      title: formData.get("title"),
      description: formData.get("description"),
      provider: "Internal",
      durationMinutes: 60
    });
  };

  if (isCatalogLoading) return <div className="p-8">Loading Learning Catalog...</div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learning & Development</h1>
          <p className="text-muted-foreground mt-1">Upskill your journey</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <Button type="submit" className="w-full">Publish Course</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.filter((e: any) => e.status === 'COMPLETED').length || 0}</div>
            <p className="text-xs text-muted-foreground">Total certifications</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="my-learning">My Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses?.length === 0 ? (
              <div className="col-span-3 text-center p-8 text-muted-foreground">No courses found. Add some to get started!</div>
            ) : (
              courses?.map((course: any) => (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge variant="outline">{course.provider || "Internal"}</Badge>
                      {(enrollments?.find((e: any) => e.courseTitle === course.title)) && <Badge className="bg-emerald-100 text-emerald-800">Enrolled</Badge>}
                    </div>
                    <CardTitle className="mt-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <Button
                      className="w-full mt-4"
                      disabled={!!enrollments?.find((e: any) => e.courseTitle === course.title)} // Simple check by title for now
                      onClick={() => enrollMutation.mutate(course.id)}
                    >
                      {enrollments?.find((e: any) => e.courseTitle === course.title) ? "Continue Learning" : "Enroll Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-learning" className="space-y-4">
          <div className="space-y-4">
            {enrollments?.map((enrollment: any) => (
              <Card key={enrollment.enrollmentId}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <PlayCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{enrollment.courseTitle}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>{new Date(enrollment.startDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{enrollment.type}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <Progress value={enrollment.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{enrollment.progress}%</span>
                    </div>
                  </div>
                  <Button variant="outline">Resume</Button>
                </CardContent>
              </Card>
            ))}
            {enrollments?.length === 0 && (
              <div className="text-center p-12 text-muted-foreground">You are not enrolled in any courses yet.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
