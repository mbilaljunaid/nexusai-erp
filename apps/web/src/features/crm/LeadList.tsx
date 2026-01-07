import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    email: string;
    status: string;
    potentialValue: number;
    createdAt: string;
}

export function LeadList() {
    const [search, setSearch] = useState("");
    // Hardcoded tenantId for now
    const tenantId = "tenant-1";

    const { data: leads = [], isLoading } = useQuery<Lead[]>({
        queryKey: [`/api/erp/${tenantId}/crm/leads`],
    });

    const createLeadMutation = useMutation({
        mutationFn: async (newLead: Partial<Lead>) => {
            return apiRequest("POST", `/api/erp/${tenantId}/crm/leads`, newLead);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/erp/${tenantId}/crm/leads`] });
        },
    });

    const handleCreateMockLead = () => {
        createLeadMutation.mutate({
            name: `Lead ${Math.floor(Math.random() * 1000)}`,
            email: `lead${Math.floor(Math.random() * 1000)}@example.com`,
            status: "NEW",
            potentialValue: Math.floor(Math.random() * 10000),
        });
    };

    const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">CRM: Leads</h1>
                <Button onClick={handleCreateMockLead} disabled={createLeadMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    add Lead
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={lead.status === 'NEW' ? 'secondary' : 'default'}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${Number(lead.potentialValue).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                            {filteredLeads.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No leads found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
