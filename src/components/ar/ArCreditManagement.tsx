import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatNumber } from '@/lib/formatters';
import {
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Users,
    Ban,
    Search,
    CheckCircle2,
    XCircle
} from "lucide-react";

// Types (should eventually be moved to erp-types.ts)
interface CreditMetric {
    totalExposure: number;
    highRiskCount: number;
    blockedOrdersCount: number;
    avgCreditScore: number;
}

interface CreditReviewTask {
    id: string;
    accountId: string;
    accountName: string;
    type: "Limit Increase" | "Credit Hold" | "Periodic Review";
    status: "Pending" | "Approved" | "Rejected";
    requestedAmount?: number;
    currentLimit: number;
    priority: "High" | "Medium" | "Low";
    createdAt: string;
}

export function ArCreditManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CreditReviewTask | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");

    // Mock Data (Replace with API calls later)
    const metrics: CreditMetric = {
        totalExposure: 1250000,
        highRiskCount: 15,
        blockedOrdersCount: 8,
        avgCreditScore: 72
    };

    const reviewQueue: CreditReviewTask[] = [
        { id: "1", accountId: "ACC-001", accountName: "Acme Corp", type: "Limit Increase", status: "Pending", requestedAmount: 50000, currentLimit: 25000, priority: "High", createdAt: "2024-02-10" },
        { id: "2", accountId: "ACC-005", accountName: "Global Tech", type: "Credit Hold", status: "Pending", currentLimit: 100000, priority: "Medium", createdAt: "2024-02-09" },
        { id: "3", accountId: "ACC-012", accountName: "StartUp Inc", type: "Periodic Review", status: "Pending", currentLimit: 10000, priority: "Low", createdAt: "2024-02-08" },
    ];

    const handleApprove = () => {
        toast({ title: "Approved", description: `Request for ${selectedTask?.accountName} approved.` });
        setReviewDialogOpen(false);
    };

    const handleReject = () => {
        toast({ title: "Rejected", description: `Request for ${selectedTask?.accountName} rejected.` });
        setReviewDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exposure</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(metrics.totalExposure)}</div>
                        <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Accounts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metrics.highRiskCount}</div>
                        <p className="text-xs text-muted-foreground">Score &lt; 50</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blocked Orders</CardTitle>
                        <Ban className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{metrics.blockedOrdersCount}</div>
                        <p className="text-xs text-muted-foreground">Due to credit hold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Credit Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{metrics.avgCreditScore}</div>
                        <p className="text-xs text-muted-foreground">Portfolio healthy</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search accounts..." className="pl-8" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Policy Settings
                    </Button>
                </div>
            </div>

            {/* Credit Review Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Credit Review Queue</CardTitle>
                    <CardDescription>Pending requests for credit limit increases and hold releases.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Current Limit</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviewQueue.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.accountName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{task.type}</Badge>
                                    </TableCell>
                                    <TableCell>${formatNumber(task.currentLimit)}</TableCell>
                                    <TableCell>
                                        {task.requestedAmount ? (
                                            <span className="text-emerald-600 font-medium">
                                                ${formatNumber(task.requestedAmount)}
                                            </span>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={task.priority === "High" ? "destructive" : "secondary"}
                                            className={task.priority === "High" ? "bg-red-100 text-red-800" : ""}
                                        >
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{task.createdAt}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setSelectedTask(task); setReviewDialogOpen(true); }}
                                        >
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Credit Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Account</Label>
                                <div className="font-medium">{selectedTask?.accountName}</div>
                            </div>
                            <div>
                                <Label>Request Type</Label>
                                <div className="font-medium">{selectedTask?.type}</div>
                            </div>
                            <div>
                                <Label>Current Limit</Label>
                                <div className="font-medium">${formatNumber(selectedTask?.currentLimit)}</div>
                            </div>
                            {selectedTask?.requestedAmount && (
                                <div>
                                    <Label>Requested Amount</Label>
                                    <div className="font-medium text-emerald-600">${formatNumber(selectedTask.requestedAmount)}</div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Review Notes</Label>
                            <Textarea
                                placeholder="Enter justification..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} className="mr-2">Reject</Button>
                        <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
