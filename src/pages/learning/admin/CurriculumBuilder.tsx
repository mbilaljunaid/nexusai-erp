
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash, ArrowRight, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function CurriculumBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);

    // Fetch Curricula
    const { data: curricula, isLoading: loadingCurricula } = useQuery({
        queryKey: ["curricula"],
        queryFn: async () => {
            const res = await fetch("/api/learning/curricula");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/learning/curricula", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["curricula"] });
            toast({ title: "Curriculum Created" });
        }
    });

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Curriculum Builder</h1>

            {/* Create Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Path</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        createMutation.mutate({ title: fd.get("title"), description: fd.get("description") });
                        e.currentTarget.reset();
                    }} className="flex gap-4">
                        <Input name="title" placeholder="Path Title (e.g. Onboarding)" required />
                        <Input name="description" placeholder="Description" />
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List */}
                <Card>
                    <CardHeader><CardTitle>Existing Curricula</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {loadingCurricula ? <Loader2 className="animate-spin" /> : curricula?.map((c: any) => (
                            <div key={c.id}
                                className={`p-3 border rounded cursor-pointer hover:bg-muted ${selectedCurriculum?.id === c.id ? 'border-primary bg-muted' : ''}`}
                                onClick={() => setSelectedCurriculum(c)}
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
    );
}

function CurriculumEditor({ curriculumId, title }: { curriculumId: string, title: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: details, isLoading } = useQuery({
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
                {isLoading ? <Loader2 className="animate-spin" /> : details?.courses?.length === 0 ? (
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
    const { data: courses } = useQuery({
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
                <div key={c.id} className="flex items-center justify-between p-2 hover:bg-muted rounded border cursor-pointer" onClick={() => onSelect(c.id)}>
                    <span className="text-sm font-medium">{c.title}</span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
            ))}
        </div>
    );
}
