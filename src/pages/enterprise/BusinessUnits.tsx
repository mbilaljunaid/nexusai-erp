import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Building } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function BusinessUnits() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ name: "", code: "", description: "" });

    const { data: businessUnits, isLoading } = useQuery({
        queryKey: ["/api/enterprise/business-units"],
        queryFn: () => fetch("/api/enterprise/business-units").then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/enterprise/business-units", data);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/enterprise/business-units"] });
            setIsAddOpen(false);
            setFormData({ name: "", code: "", description: "" });
            toast({ title: "Success", description: "Business Unit created successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const filtered = businessUnits?.filter((b: any) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <StandardPage
            title="Business Units"
            description="Manage Operational nodes, Regions, and Segments"
            breadcrumbs={[
                { label: "Company Setup", href: "/company-setup" },
                { label: "Business Units" }
            ]}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search business units..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Business Unit
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Business Unit Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">No Business Units Found</TableCell></TableRow>
                        ) : (
                            filtered.map((b: any) => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Building className="h-4 w-4 text-green-600" />
                                        {b.name}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{b.description || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Business Unit</DialogTitle>
                        <DialogDescription>Define a new operational node (e.g., North America Sales, US Operations).</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2 col-span-1">
                                <label className="text-sm font-medium">Code *</label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. NA01"
                                />
                            </div>
                            <div className="space-y-2 col-span-3">
                                <label className="text-sm font-medium">Business Unit Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => createMutation.mutate(formData)}
                            disabled={createMutation.isPending || !formData.name || !formData.code}
                        >
                            {createMutation.isPending ? "Saving..." : "Save Business Unit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
