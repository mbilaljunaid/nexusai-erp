import { formatDate } from "@/lib/dateUtils";

import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, LifeBuoy, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CaseDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ subject: "", description: "", priority: "Medium", origin: "Web" });

    const { data: cases, isLoading } = useQuery<any>({
        queryKey: ["/api/crm/cases"],
        queryFn: async () => {
            const res = await fetch("/api/crm/cases");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/cases"] });
            setIsCreateOpen(false);
            setNewItem({ subject: "", description: "", priority: "Medium", origin: "Web" });
            toast({ title: "Ticket Created" });
        }
    });

    const openCount = cases?.filter((c: any) => c.status !== 'Closed').length || 0;
    const highPriorityCount = cases?.filter((c: any) => c.priority === 'High' && c.status !== 'Closed').length || 0;

    return (
        <StandardPage
            title="Service Console"
            description="Manage customer support tickets."
            actions={
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Ticket
                </Button>
            }
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <LifeBuoy className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highPriorityCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Origin</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-4"><TableSkeleton rows={4} /></TableCell></TableRow>
                            ) : cases?.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No tickets found.</TableCell></TableRow>
                            ) : (
                                cases?.map((c: any) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.status === 'Closed' ? 'secondary' : c.status === 'New' ? 'default' : 'outline'}>
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={c.priority === 'High' ? 'text-red-600 font-bold' : ''}>{c.priority}</span>
                                        </TableCell>
                                        <TableCell>{c.origin}</TableCell>
                                        <TableCell>{formatDate(c.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/crm/cases/${c.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <MessageSquare className="h-4 w-4 mr-1" /> Open
                                                </Button>
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
                        <DialogTitle>New Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input value={newItem.subject} onChange={e => setNewItem({ ...newItem, subject: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={newItem.priority} onValueChange={v => setNewItem({ ...newItem, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Origin</Label>
                                <Select value={newItem.origin} onValueChange={v => setNewItem({ ...newItem, origin: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Web">Web</SelectItem>
                                        <SelectItem value="Email">Email</SelectItem>
                                        <SelectItem value="Phone">Phone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
