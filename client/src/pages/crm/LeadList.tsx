import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeadTable } from "@/components/LeadTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface LeadsResponse {
    data: any[];
    pagination: PaginationData;
}

export default function LeadList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [, setLocation] = useLocation();

    const { data, isLoading } = useQuery<LeadsResponse>({
        queryKey: ["/api/leads", page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/leads?${params}`);
            if (!res.ok) throw new Error("Failed to fetch leads");
            return res.json();
        }
    });

    const leads = data?.data?.map((l: any) => ({
        id: l.id,
        name: l.firstName && l.lastName ? `${l.firstName} ${l.lastName}` : (l.company || "Unknown"),
        email: l.email || "",
        company: l.company || "",
        status: (l.status?.toLowerCase() || "new") as any,
        score: l.score || 0,
        value: Number(l.annualRevenue || 0)
    })) || [];

    const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    const handleSelectLead = (lead: any) => {
        setLocation(`/crm/leads/${lead.id}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to page 1 on search
                        }}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <LeadTable
                        leads={leads}
                        onSelectLead={handleSelectLead}
                    />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {Math.min((page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} entries
                        </p>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">Page {page} of {pagination.totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
