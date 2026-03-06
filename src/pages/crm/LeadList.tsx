import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeadTable } from "@/components/LeadTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
        
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm font-medium mx-4">Page {page} of {totalPages}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => p + 1)} 
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
    );
}
