import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
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
import { Plus, Search, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";

export default function LegalGroups() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ name: "", registrationNumber: "", currency: "USD", description: "" });

    const { data: legalGroups, isLoading } = useQuery<any>({
        queryKey: ["/api/enterprise/legal-groups"],
        queryFn: () => fetch("/api/enterprise/legal-groups").then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/enterprise/legal-groups", data);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/enterprise/legal-groups"] });
            setIsAddOpen(false);
            setFormData({ name: "", registrationNumber: "", currency: "USD", description: "" });
            toast({ title: "Success", description: "Legal Group created successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const filteredGroups = Array.isArray(legalGroups) ? legalGroups.filter((g: any) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.registrationNumber?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    return (
        <StandardPage
            title="Legal Groups"
            description="Manage Corporate Entities and Company Names"
            breadcrumbs={[
                { label: "Company Setup", href: "/company-setup" },
                { label: "Legal Groups" }
            ]}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search legal groups..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Legal Group
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Legal Name / Company Name</TableHead>
                            <TableHead>Registration No.</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5}><TableSkeleton rows={5} /></TableCell></TableRow>
                        ) : filteredGroups.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">No Legal Groups Found</TableCell></TableRow>
                        ) : (
                            filteredGroups.map((g: any) => (
                                <TableRow key={g.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-500" />
                                        {g.name}
                                    </TableCell>
                                    <TableCell>{g.registrationNumber || '-'}</TableCell>
                                    <TableCell>{g.currency}</TableCell>
                                    <TableCell><Badge variant="outline">{g.status}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{g.description || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Legal Group</DialogTitle>
                        <DialogDescription>Add a new registered company or entity to your enterprise structure.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Legal Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., NexusAI Corporation"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Registration No.</Label>
                                <Input
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Base Currency</Label>
                                <Input
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
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
                            disabled={createMutation.isPending || !formData.name}
                        >
                            {createMutation.isPending ? "Saving..." : "Save Legal Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
