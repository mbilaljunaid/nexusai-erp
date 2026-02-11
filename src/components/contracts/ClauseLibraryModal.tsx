import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ClauseLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId?: string;
}

export function ClauseLibraryModal({ isOpen, onClose, contractId }: ClauseLibraryModalProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    // Fetch clauses
    const { data: clauses, isLoading } = useQuery({
        queryKey: ["/api/contract-portal/clauses", search, category],
        queryFn: async () => {
            const res = await fetch("/api/contract-portal/clauses");
            if (!res.ok) throw new Error("Failed to fetch clauses");
            return res.json();
        },
        enabled: isOpen
    });

    // Filter clauses
    const filteredClauses = clauses?.filter((clause: any) => {
        const matchesSearch = !search ||
            clause.title?.toLowerCase().includes(search.toLowerCase()) ||
            clause.text?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || clause.category === category;
        return matchesSearch && matchesCategory;
    }) || [];

    // Add clause to contract mutation
    const addClauseMutation = useMutation({
        mutationFn: async (clauseId: string) => {
            const res = await fetch(`/api/contract-portal/contracts/${contractId}/terms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clauseId })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Clause Added", description: "Clause successfully added to contract" });
            queryClient.invalidateQueries({ queryKey: [`/api/contract-portal/contracts/${contractId}`] });
            onClose();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Clause Library</DialogTitle>
                    <DialogDescription>
                        Select a clause from the library to add to your contract
                    </DialogDescription>
                </DialogHeader>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clauses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Payment Terms">Payment Terms</SelectItem>
                            <SelectItem value="Warranties">Warranties</SelectItem>
                            <SelectItem value="Liability">Liability</SelectItem>
                            <SelectItem value="Termination">Termination</SelectItem>
                            <SelectItem value="Confidentiality">Confidentiality</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clause List */}
                <ScrollArea className="flex-1 -mx-6 px-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredClauses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mb-3 opacity-20" />
                            <p>No clauses found</p>
                            {(search || category !== "all") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("all");
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredClauses.map((clause: any) => (
                                <div
                                    key={clause.id}
                                    className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-sm">{clause.title}</h4>
                                                {clause.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {clause.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {clause.text}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => addClauseMutation.mutate(clause.id)}
                                            disabled={addClauseMutation.isPending}
                                            className="gap-2 shrink-0"
                                        >
                                            {addClauseMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
