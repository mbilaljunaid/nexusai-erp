
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Megaphone, Target, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CampaignDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", type: "Email", budgetedCost: "" });

    const { data: campaigns, isLoading } = useQuery<any>({
        queryKey: ["/api/crm/campaigns"],
        queryFn: async () => {
            const res = await fetch("/api/crm/campaigns");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/campaigns"] });
            setIsCreateOpen(false);
            setNewItem({ name: "", type: "Email", budgetedCost: "" });
            toast({ title: "Campaign Created" });
        }
    });

    const activeCount = campaigns?.filter((c: any) => c.status === 'In Progress' || c.status === 'Planned').length || 0;
    const totalBudget = campaigns?.reduce((sum: number, c: any) => sum + Number(c.budgetedCost || 0), 0) || 0;

    return (
        <StandardPage
            title="Campaign Management"
            description="Track marketing initiatives and ROI."
            actions={
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Campaign
                </Button>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generated Revenue</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">$ --</div>
                        <p className="text-xs text-muted-foreground">See Detail View for ROI</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-4">Loading...</TableCell></TableRow>
                            ) : campaigns?.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No campaigns found.</TableCell></TableRow>
                            ) : (
                                campaigns?.map((c: any) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.status === 'In Progress' ? 'default' : 'secondary'}>
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${Number(c.budgetedCost).toLocaleString()}</TableCell>
                                        <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/crm/campaigns/${c.id}`}>
                                                <Button variant="ghost" size="sm">View Stats</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Input value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} placeholder="Webinar, Email, etc." />
                        </div>
                        <div className="space-y-2">
                            <Label>Budget Cost</Label>
                            <Input type="number" value={newItem.budgetedCost} onChange={e => setNewItem({ ...newItem, budgetedCost: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(newItem)}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
