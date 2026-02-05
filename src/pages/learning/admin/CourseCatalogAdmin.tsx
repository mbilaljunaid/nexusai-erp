
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function CourseCatalogAdmin() {
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    // Run Compliance Job
    const runComplianceCheck = async () => {
        try {
            const res = await fetch("/api/learning/admin/compliance/run-check", { method: "POST" });
            if (!res.ok) throw new Error("Failed to run check");
            toast({ title: "Compliance Check Initiated", description: "Recertification job is running in background." });
        } catch (err: any) {
            toast({ title: "Error", description: "Failed to start compliance job.", variant: "destructive" });
        }
    };

    // State for Pagination
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Fetch Courses (Paginated)
    const { data: catalogData, isLoading } = useQuery({
        queryKey: ["learning-courses", searchQuery, page],
        queryFn: async () => {
            const res = await fetch(`/api/learning/courses?q=${searchQuery}&page=${page}&pageSize=${pageSize}`);
            if (!res.ok) throw new Error("Failed to fetch catalog");
            return res.json();
        }
    });

    const courses = catalogData?.data || [];
    const totalCourses = catalogData?.total || 0;

    // Fetch Audit Logs
    const { data: auditLogs } = useQuery({
        queryKey: ["learning-audit-logs"],
        queryFn: async () => {
            // Mocking Price update for existing items if missing in fetch, or ensuring backend returns it
            const res = await fetch(`/api/learning/courses?q=${searchQuery}`);
            if (!res.ok) throw new Error("Failed to fetch catalog");
            return res.json();
        }
    });

    const columns: Column<any>[] = [
        { header: "Course Title", accessorKey: "title", className: "font-medium" },
        { header: "Provider", accessorKey: "provider" },
        { header: "Category", accessorKey: "category", cell: (item) => item.category || "N/A" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Validity",
            accessorKey: "validityMonths",
            cell: (item) => item.validityMonths ? `${item.validityMonths} Months` : "-"
        },
        {
            header: "Price",
            accessorKey: "price",
            cell: (item) => Number(item.price) > 0 ? `${item.currency} ${item.price}` : "Free"
        },
        { header: "Created At", accessorKey: "createdAt", cell: (item) => new Date(item.createdAt).toLocaleDateString() },
        {
            header: "Actions",
            id: "actions",
            cell: () => (
                <Button variant="ghost" size="sm">Edit</Button>
            )
        }
    ];

    const auditColumns: Column<any>[] = [
        { header: "Date", accessorKey: "createdAt", cell: (item) => new Date(item.createdAt).toLocaleString() },
        { header: "Action", accessorKey: "action" },
        { header: "Entity", accessorKey: "entityType" },
        { header: "Entity ID", accessorKey: "entityId", className: "font-mono text-xs" },
        { header: "Actor", accessorKey: "actorId" },
        { header: "Details", accessorKey: "newValue", className: "truncate max-w-[200px]" },
    ];

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Learning Administration</h1>
                    <p className="text-muted-foreground">Manage courses, compliance, and system logs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={runComplianceCheck}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Run Compliance Check
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Course
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="courses" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="courses">Course Catalog</TabsTrigger>
                    <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-4">
                    <div className="bg-white rounded-md border">
                        <StandardTable
                            data={courses || []}
                            columns={columns}
                            isLoading={isLoading}
                            totalItems={totalCourses}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            filterColumn="title"
                            filterPlaceholder="Search courses..."
                        />
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                    <div className="bg-white rounded-md border">
                        <StandardTable
                            data={auditLogs || []}
                            columns={auditColumns}
                            filterColumn="action"
                            filterPlaceholder="Filter by Action..."
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
