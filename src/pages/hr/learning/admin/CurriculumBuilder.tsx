
import React, { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash, ArrowRight, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const curriculumSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional()
});

export default function CurriculumBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);

    // Fetch Curricula
    const { data: curricula, isLoading: loadingCurricula } = useQuery<any>({
        queryKey: ["curricula"],
        queryFn: async () => {
            const res = await fetch("/api/learning/curricula");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: z.infer<typeof curriculumSchema>) => {
            const res = await fetch("/api/learning/curricula", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["curricula"] });
            toast({ title: "Curriculum Created" });
            form.reset();
        }
    });

    const form = useForm<z.infer<typeof curriculumSchema>>({
        resolver: zodResolver(curriculumSchema),
        defaultValues: {
            title: "",
            description: ""
        }
    });

    const onSubmit = (values: z.infer<typeof curriculumSchema>) => {
        createMutation.mutate(values);
    };

    return (
        <StandardPage
            title="Curriculum Builder"
            description="Design learning paths and course sequences."
            breadcrumbs={[
                { label: "Learning", href: "/hr/learning/me" },
                { label: "Administration", href: "/hr/learning/admin" },
                { label: "Curriculum Builder" }
            ]}
        >
            <div className="space-y-6">

                {/* Create Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Path</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input placeholder="Path Title (e.g. Onboarding)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input placeholder="Description" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* List */}
                    <Card>
                        <CardHeader><CardTitle>Existing Curricula</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {loadingCurricula ? <Loader2 className="animate-spin" /> : curricula?.map((c: any) => (
                                <div role="button" tabIndex={0} key={c.id}
                                    className={`p-3 border rounded cursor-pointer hover:bg-muted ${selectedCurriculum?.id === c.id ? 'border-primary bg-muted' : ''}`}
                                    onClick={() => setSelectedCurriculum(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                >
                                    <div className="font-medium">{c.title}</div>
                                    <div className="text-xs text-muted-foreground">{c.description}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Editor */}
                    {selectedCurriculum ? (
                        <CurriculumEditor curriculumId={selectedCurriculum.id} title={selectedCurriculum.title} />
                    ) : (
                        <div className="flex items-center justify-center border rounded-lg h-64 bg-muted/20 text-muted-foreground">
                            Select a curriculum to edit courses
                        </div>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}

function CurriculumEditor({ curriculumId, title }: { curriculumId: string, title: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: details, isLoading } = useQuery<any>({
        queryKey: ["curriculum", curriculumId],
        queryFn: async () => {
            const res = await fetch(`/api/learning/curricula/${curriculumId}`);
            return res.json();
        }
    });

    const addCourseMutation = useMutation({
        mutationFn: async (courseId: string) => {
            const currentCount = details?.courses?.length || 0;
            const res = await fetch(`/api/learning/curricula/${curriculumId}/courses`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, sequence: currentCount + 1 })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["curriculum", curriculumId] });
            setIsAddOpen(false);
            toast({ title: "Course Added" });
        }
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>Drag to reorder (Mock)</CardDescription>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Course</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Course to Path</DialogTitle></DialogHeader>
                        <CoursePicker onSelect={(id) => addCourseMutation.mutate(id)} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? <TableSkeleton rows={4} /> : details?.courses?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No courses in this path yet.</p>
                ) : (
                    details?.courses?.map((member: any) => (
                        <div key={member.memberId} className="flex items-center gap-4 p-3 border rounded bg-card">
                            <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                                {member.sequence}
                            </Badge>
                            <div className="flex-1">
                                <div className="font-medium">{member.title}</div>
                                <div className="text-xs text-muted-foreground">{member.duration || '60'} mins</div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function CoursePicker({ onSelect }: { onSelect: (id: string) => void }) {
    // Simple fetch of all courses
    const { data: courses } = useQuery<any>({
        queryKey: ["courses-picker"],
        queryFn: async () => {
            const res = await fetch("/api/learning/courses?pageSize=50");
            const json = await res.json();
            return json.data || json; // Handle paginated vs non-paginated
        }
    });

    return (
        <div className="h-[300px] overflow-y-auto space-y-2">
            {courses?.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-2 hover:bg-muted rounded border cursor-pointer" onClick={() => onSelect(c.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                    <span className="text-sm font-medium">{c.title}</span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
            ))}
        </div>
    );
}
