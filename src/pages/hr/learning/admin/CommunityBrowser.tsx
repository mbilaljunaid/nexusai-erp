
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Folder, FolderOpen, ChevronRight, Home, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const communitySchema = z.object({
    title: z.string().min(1, "Title is required")
});

export default function CommunityBrowser() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Fetch Roots
    const { data: roots, isLoading: loadingRoots } = useQuery<any>({
        queryKey: ["communities", "roots"],
        queryFn: async () => {
            const res = await fetch("/api/learning/communities/roots");
            return res.json();
        },
        enabled: !currentId
    });

    // Fetch Children & Courses
    const { data: children, isLoading: loadingChildren } = useQuery<any>({
        queryKey: ["communities", currentId, "children"],
        queryFn: async () => {
            const res = await fetch(`/api/learning/communities/${currentId}/children`);
            return res.json();
        },
        enabled: !!currentId
    });

    // Fetch Breadcrumbs
    const { data: breadcrumbs } = useQuery<any>({
        queryKey: ["communities", currentId, "breadcrumbs"],
        queryFn: async () => {
            const res = await fetch(`/api/learning/communities/${currentId}/breadcrumbs`);
            return res.json();
        },
        enabled: !!currentId
    });

    // Create Community Mutation
    const createMutation = useMutation({
        mutationFn: async (title: string) => {
            const res = await fetch("/api/learning/communities", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, parentId: currentId })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communities"] });
            toast({ title: "Community Created" });
            form.reset();
        }
    });

    const form = useForm<z.infer<typeof communitySchema>>({
        resolver: zodResolver(communitySchema),
        defaultValues: {
            title: ""
        }
    });

    const onSubmit = (values: z.infer<typeof communitySchema>) => {
        createMutation.mutate(values.title);
    };

    return (
        <StandardPage
            title="Catalog Hierarchy"
            description="Manage learning communities and view courses."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Learning Management' },
                { label: 'Communities' }
            ]}
        >
            <div className="space-y-6">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentId(null)} className="h-8">
                        <Home className="h-4 w-4 mr-1" /> Catalog
                    </Button>
                    {breadcrumbs?.map((bc: any) => (
                        <React.Fragment key={bc.id}>
                            <ChevronRight className="h-4 w-4" />
                            <Button variant="ghost" size="sm" onClick={() => setCurrentId(bc.id)} className="h-8">
                                {bc.title}
                            </Button>
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Creation Sidebar */}
                    <Card className="md:col-span-1">
                        <CardHeader><CardTitle className="text-sm">Quick Add</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="New Sub-community..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="sm" className="w-full" disabled={createMutation.isPending}>
                                        <Folder className="mr-2 h-4 w-4" /> Create
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Main View */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Sub-Communities */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(currentId ? children?.subCommunities : roots)?.map((c: any) => (
                                <Card key={c.id} className="hover:border-primary cursor-pointer transition-colors" onClick={() => setCurrentId(c.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <Folder className="h-8 w-8 text-blue-500 fill-blue-500/20" />
                                        <div>
                                            <div className="font-semibold">{c.title}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{c.description || 'Learning Community'}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {(loadingRoots || loadingChildren) && <Loader2 className="animate-spin" />}
                        </div>

                        {/* Courses in this Community */}
                        {currentId && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Book className="h-5 w-5" /> Courses
                                </h2>
                                {children?.courses?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No courses in this community yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {children?.courses?.map((course: any) => (
                                            <Card key={course.id}>
                                                <CardContent className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <div className="font-medium">{course.title}</div>
                                                        <div className="text-xs text-muted-foreground">{course.provider}</div>
                                                    </div>
                                                    <Badge variant="outline">{course.status}</Badge>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
