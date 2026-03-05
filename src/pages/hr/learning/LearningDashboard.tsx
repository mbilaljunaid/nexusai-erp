import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, PlayCircle, Plus, Download, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const courseSchema = z.object({
  title: z.string().min(1, "Course Title is required"),
  description: z.string().optional()
});

export default function LearningManagement() {
  const { open, sendMessage } = useNexusAI();
  const [activeTab, setActiveTab] = useState("catalog");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { legalEntityId } = useEnterpriseStore();

  // Fetch Catalog
  const { data: courses, isLoading: isCatalogLoading } = useQuery<any>({
    queryKey: ["learning-courses", searchQuery, categoryFilter, providerFilter, legalEntityId],
    queryFn: async () => {
      const res = await fetch(`/api/learning/courses?q=${searchQuery}&category=${categoryFilter}&provider=${providerFilter}`, {
        headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined
      });
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    }
  });

  // Fetch Recommendations
  const { data: recommendations } = useQuery<any>({
    queryKey: ["learning-recommendations", legalEntityId],
    queryFn: async () => {
      // Fallback for MVP if user context is missing in strict fetch
      const res = await fetch("/api/learning/recommendations?personId=current_user", {
        headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined
      });
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch My Learning (Mocking PersonID for MVP dev)
  const { data: enrollments, isLoading: isMyLearningLoading } = useQuery<any>({
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
      form.reset();
      toast({ title: "Course Created" });
    },
  });

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  });

  const onSubmit = (values: z.infer<typeof courseSchema>) => {
    createCourseMutation.mutate({
      title: values.title,
      description: values.description,
      provider: "Internal",
      durationMinutes: 60
    });
  };

  // Enroll / Request Mutation
  const enrollMutation = useMutation({
    mutationFn: async (course: any) => {
      // 1. Create Offering (Simplified)
      const offeringRes = await fetch("/api/learning/offerings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          title: "Self Paced Session", // Default
          startDate: new Date().toISOString()
        })
      });
      const offering = await offeringRes.json();

      // 2. Check Price for Approval
      const isPaid = Number(offering.price) > 0;
      const endpoint = isPaid
        ? `/api/learning/enrollments/${offering.id}/request-approval` // Technically we need enrollment first, but let's assume we create enrollment as PENDING
        : "/api/learning/enroll";

      // For this demo: We assume "enroll" endpoint creates ENROLLED status if clean, or PENDING if logic dictates.
      // But our Plan said: Enroll -> Pending Approval.
      // Let's stick to: Create Enrollment normally. Backend sets status based on flow?
      // OR: Frontend explicitly requests approval?

      // REVISED FLOW:
      // A. Create Enrollment (Default Enrolled for free, or Pending if logic exists)
      // B. If Paid, we call request-approval.

      // Simplified for this step:
      // We will call "/api/learning/enroll". If it returns "PENDING_APPROVAL" or needs it?

      // Let's implement the logic from the Plan:
      // POST /api/learning/enroll
      // body: { personId, offeringId, requestApproval: isPaid }

      const res = await fetch("/api/learning/enroll", {
        method: "POST", headers: { "Content-Type": "application/json", ...(legalEntityId ? { "x-legal-entity-id": legalEntityId } : {}) },
        body: JSON.stringify({
          personId: "current_user",
          offeringId: offering.id,
          status: isPaid ? "PENDING_APPROVAL" : "ENROLLED",
          entLegalEntityId: legalEntityId
        }),
      });

      if (!res.ok) throw new Error("Failed to enroll");
      const enrollment = await res.json();

      // If PENDING, we might want to trigger the workflow explicitly or trust the enrollment creation did it?
      // Let's trust logic.

      if (isPaid) {
        await fetch(`/api/learning/enrollments/${enrollment.id}/request-approval`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "current_user" })
        });
      }

      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-learning"] });
      toast({ title: "Request Processed", description: "Enrollment status updated." });
      setActiveTab("my-learning");
    },
  });



  if (isCatalogLoading) return <div className="p-8">Loading Learning Catalog...</div>;

  return (
    <StandardPage
      title="Learning & Development"
      description="Upskill your journey"
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/hr/learning/admin'}>
            Manage Content (Admin)
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/hr/learning/team'}>
            Manager Dashboard
          </Button>
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Publish Course</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* AI RECOMMENDATIONS BANNER */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen className="h-32 w-32 rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h2 className="text-xl font-bold">Personalized Learning Paths</h2>
              </div>
              <p className="opacity-90 max-w-2xl text-slate-100">
                NexusAI has analyzed your career goals and skill gaps. We've prepared recommended learning paths to accelerate your growth within the organization.
              </p>
            </div>
            <Button
              className="whitespace-nowrap bg-white text-indigo-600 hover:bg-slate-100 font-black shadow-xl h-12 px-8"
              onClick={() => {
                open();
                sendMessage("I need AI-powered course recommendations based on my career goals and current skill set.");
              }}
            >
              Ask NexusAI for Recommendations
            </Button>
          </div>
        </div>

        {/* Active Learning */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {enrollments?.filter((e: any) => e.status !== 'COMPLETED').map((enrollment: any) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate" title={enrollment.title}>
                  {enrollment.title}
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrollment.progressPercent || 0}%</div>
                <p className="text-xs text-muted-foreground mb-4">
                  {enrollment.status}
                </p>
                <Link href={`/hr/learning/play/${enrollment.id}`}>
                  <Button className="w-full" size="sm">
                    <PlayCircle className="mr-2 h-4 w-4" /> Continue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
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
            <div className="flex gap-4 mb-4 flex-wrap">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />

              <div className="w-[180px]">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[180px]">
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Providers</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Udemy">Udemy</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Pluralsight">Pluralsight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(categoryFilter !== "ALL" || providerFilter !== "ALL" || searchQuery) && (
                <Button variant="ghost" onClick={() => {
                  setCategoryFilter("ALL");
                  setProviderFilter("ALL");
                  setSearchQuery("");
                }}>
                  Clear Filters
                </Button>
              )}
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
                        {(enrollments?.find((e: any) => e.courseTitle === course.title)) && <StatusBadge status="Enrolled" />}
                      </div>
                      <CardTitle className="mt-2">{course.title}</CardTitle>
                      <div className="flex justify-between items-center mt-1">
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        {Number(course.price) > 0 && <Badge variant="secondary">{course.currency} {course.price}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      <Button
                        className="w-full mt-4"
                        disabled={!!enrollments?.find((e: any) => e.courseTitle === course.title)}
                        onClick={() => enrollMutation.mutate(course)}
                      >
                        {enrollments?.find((e: any) => e.courseTitle === course.title)
                          ? "Continue Learning"
                          : (Number(course.price) > 0 ? "Request Approval" : "Enroll Now")}
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
                    <div className="flex gap-2">
                      {enrollment.status === 'COMPLETED' ? (
                        <Button variant="outline" onClick={() => window.open(`/api/learning/enrollments/${enrollment.enrollmentId}/certificate`, '_blank')}>
                          <Download className="mr-2 h-4 w-4" /> Certificate
                        </Button>
                      ) : enrollment.status === 'PENDING_APPROVAL' ? (
                        <Button variant="outline" disabled>
                          Pending Approval
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => window.location.href = `/hr/learning/play/${enrollment.enrollmentId}`}>Resume</Button>
                      )}
                    </div>
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
    </StandardPage>
  );
}
