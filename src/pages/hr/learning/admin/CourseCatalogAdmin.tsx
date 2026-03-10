import { formatDate, formatDateTime } from "@/lib/dateUtils";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card } from "@/components/ui/card";

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
    const { data: catalogData, isLoading } = useQuery<any>({
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
    const { data: auditLogs } = useQuery<any>({
        queryKey: ["learning-audit-logs"],
        queryFn: async () => {
            // Mocking Price update for existing items if missing in fetch, or ensuring backend returns it
            const res = await fetch(`/api/learning/courses?q=${searchQuery}`);
            if (!res.ok) throw new Error("Failed to fetch catalog");
            return res.json();
        }
    });

    const columns: SpreadsheetColumn<any>[] = [
        { header: "Course Title", id: "title", width: "150px", className: "font-medium" },
        { header: "Provider", id: "provider", width: "150px" },
        { header: "Category", id: "category", width: "150px", cell: (item) => item.category || "N/A" },
        {
            header: "Status",
            id: "status", width: "150px",
            cell: (item) => (
                <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Validity",
            id: "validityMonths", width: "150px",
            cell: (item) => item.validityMonths ? `${item.validityMonths} Months` : "-"
        },
        {
            header: "Price",
            id: "price", width: "150px",
            cell: (item) => Number(item.price) > 0 ? `${item.currency} ${item.price}` : "Free"
        },
        { header: "Created At", id: "createdAt", width: "150px", cell: (item) => formatDate(item.createdAt) },
        {
            header: "Actions",
            id: "actions",
            cell: () => (
                <Button variant="ghost" size="sm">Edit</Button>
            )
        }
    ];

    const auditColumns: SpreadsheetColumn<any>[] = [
        { header: "Date", id: "createdAt", width: "150px", cell: (item) => formatDateTime(item.createdAt) },
        { header: "Action", id: "action", width: "150px" },
        { header: "Entity", id: "entityType", width: "150px" },
        { header: "Entity ID", id: "entityId", width: "150px", className: "font-mono text-xs" },
        { header: "Actor", id: "actorId", width: "150px" },
        { header: "Details", id: "newValue", width: "150px", className: "truncate max-w-48" },
    ];

    return (
        <StandardPage
            title="Learning Administration"
            description="Manage courses, compliance, and system logs."
            breadcrumbs={[
                { label: "Learning", href: "/hr/learning/me" },
                { label: "Administration" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={runComplianceCheck}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Run Compliance Check
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Course
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">

                <Tabs defaultValue="courses" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="courses">Course Catalog</TabsTrigger>
                        <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses" className="space-y-4">
                        <Card className="overflow-hidden">
                            <InteractiveSpreadsheet
                                data={courses || []}
                                columns={columns}
                                isLoading={isLoading}
                                onChange={() => { }} containerHeight="600px" />
                        </Card>
                    </TabsContent>

                    <TabsContent value="audit" className="space-y-4">
                        <Card className="overflow-hidden">
                            <InteractiveSpreadsheet
                                data={auditLogs || []}
                                columns={auditColumns}
                                onChange={() => { }} containerHeight="600px" />
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
