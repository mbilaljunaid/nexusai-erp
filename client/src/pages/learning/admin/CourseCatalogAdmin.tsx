import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CourseCatalogAdmin() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: courses, isLoading } = useQuery({
        queryKey: ["learning-courses", searchQuery],
        queryFn: async () => {
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
        { header: "Created At", accessorKey: "createdAt", cell: (item) => new Date(item.createdAt).toLocaleDateString() },
        {
            header: "Actions",
            id: "actions",
            cell: () => (
                <Button variant="ghost" size="sm">Edit</Button>
            )
        }
    ];

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Course Catalog Management</h1>
                    <p className="text-muted-foreground">Manage courses, offerings, and compliance rules.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Course
                </Button>
            </div>

            <div className="bg-white rounded-md border">
                <StandardTable
                    data={courses || []}
                    columns={columns}
                    isLoading={isLoading}
                    filterColumn="title"
                    filterPlaceholder="Search courses..."
                />
            </div>
        </div>
    );
}
