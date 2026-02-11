import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { costService } from "@/services/maintenance.service";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    FileCheck,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

interface WorkOrderCost {
    id: string;
    woNumber: string;
    assetName: string;
    description: string;
    actualLabor: number;
    actualMaterial: number;
    actualOther: number;
    totalActual: number;
    budgetLabor: number;
    budgetMaterial: number;
    budgetOther: number;
    totalBudget: number;
    variance: number;
    variancePercent: number;
    status: "PENDING_APPROVAL" | "APPROVED" | "POSTED_TO_GL" | "TRANSFERRED";
    completedDate?: string;
    approvedBy?: string;
    glPostDate?: string;
    projectId?: string;
}

interface GLPostingQueue {
    id: string;
    woId: string;
    woNumber: string;
    amount: number;
    glAccount: string;
    costCenter: string;
    status: "QUEUED" | "PROCESSING" | "POSTED" | "FAILED";
    queuedDate: string;
    postedDate?: string;
    errorMessage?: string;
}

interface VarianceAnalysis {
    category: string;
    budget: number;
    actual: number;
    variance: number;
    variancePercent: number;
}

export function CostManagementHub() {
    const [workOrderCosts, setWorkOrderCosts] = useState<WorkOrderCost[]>([]);
    const [glQueue, setGlQueue] = useState<GLPostingQueue[]>([]);
    const [varianceData, setVarianceData] = useState<VarianceAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        loadCostData();
    }, []);

    const loadCostData = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALL - Get work order costs
            const [apiCosts, apiGLQueue, apiVariance] = await Promise.all([
                costService.getWorkOrderCosts(),
                costService.getGLQueue(),
                costService.getVarianceAnalysis()
            ]);

            setWorkOrderCosts(apiCosts);
            setGlQueue(apiGLQueue);

            // Map variance API response to component format
            const varianceArray = apiVariance.categories || [
                { category: "Labor", budget: 0, actual: 0, variance: 0, variancePercent: 0 },
                { category: "Materials", budget: 0, actual: 0, variance: 0, variancePercent: 0 },
                { category: "Other", budget: 0, actual: 0, variance: 0, variancePercent: 0 }
            ];
            setVarianceData(varianceArray);
        } catch (error) {
            console.error("Failed to load cost data:", error);
            setWorkOrderCosts([]);
            setGlQueue([]);
            setVarianceData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCost = async (costId: string) => {
        try {
            // ✅ LIVE API CALL - Approve work order cost
            await costService.approveCosts(costId);

            // Refresh data after approval
            await loadCostData();

            // TODO: Show success toast
        } catch (error) {
            console.error("Failed to approve cost:", error);
            // TODO: Show error toast
        }
    };

    const handlePostToGL = async (costId: string) => {
        const cost = workOrderCosts.find(c => c.id === costId);
        if (!cost) return;

        try {
            // ✅ LIVE API CALL - Post to GL
            await costService.postToGL(costId, "5200-100", "MAINT-001");

            // Refresh data after posting
            await loadCostData();

            // TODO: Show success toast
        } catch (error) {
            console.error("Failed to post to GL:", error);
            // TODO: Show error toast
        }
    };

    const handleTransferToProject = async (costId: string) => {
        try {
            // ✅ LIVE API CALL - Transfer to project
            // TODO: collect projectId from user input/dialog
            const projectId = "PROJ-2026-001"; // Placeholder
            await costService.transferToProject(costId, projectId);

            // Refresh data after transfer
            await loadCostData();

            // TODO: Show success toast
        } catch (error) {
            console.error("Failed to transfer to project:", error);
            // TODO: Show error toast
        }
    };

    const getStatusConfig = (status: WorkOrderCost["status"]) => {
        switch (status) {
            case "POSTED_TO_GL":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Posted to GL" };
            case "APPROVED":
                return { color: "bg-blue-100 text-blue-800", icon: FileCheck, label: "Approved" };
            case "PENDING_APPROVAL":
                return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending Approval" };
            case "TRANSFERRED":
                return { color: "bg-purple-100 text-purple-800", icon: Building2, label: "Transferred to Project" };
        }
    };

    const filteredCosts = workOrderCosts.filter(cost =>
        statusFilter === "all" || cost.status === statusFilter
    );

    const totalBudget = workOrderCosts.reduce((sum, c) => sum + c.totalBudget, 0);
    const totalActual = workOrderCosts.reduce((sum, c) => sum + c.totalActual, 0);
    const totalVariance = totalActual - totalBudget;
    const totalVariancePercent = totalBudget > 0 ? ((totalVariance / totalBudget) * 100) : 0;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Cost Management Hub</h1>
                <p className="text-muted-foreground">Manage work order costs, GL posting, and variance analysis</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Total Budget</div>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Total Actual</div>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold">${totalActual.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Variance</div>
                            {totalVariance < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                        </div>
                        <div className={cn("text-3xl font-bold", totalVariance < 0 ? "text-red-600" : "text-green-600")}>
                            ${Math.abs(totalVariance).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {totalVariancePercent > 0 ? "+" : ""}{totalVariancePercent.toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Pending Approval</div>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="text-3xl font-bold">
                            {workOrderCosts.filter(c => c.status === "PENDING_APPROVAL").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="costs" className="w-full">
                <TabsList>
                    <TabsTrigger value="costs">Work Order Costs</TabsTrigger>
                    <TabsTrigger value="gl-queue">GL Posting Queue</TabsTrigger>
                    <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="costs" className="space-y-4">
                    {/* Filter */}
                    <Card>
                        <CardContent className="pt-6">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Filter by status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="POSTED_TO_GL">Posted to GL</SelectItem>
                                    <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Cost Cards */}
                    <div className="space-y-4">
                        {filteredCosts.map(cost => {
                            const statusConfig = getStatusConfig(cost.status);
                            const StatusIcon = statusConfig.icon;
                            const isOverBudget = cost.variance < 0;

                            return (
                                <Card key={cost.id} className={cn(isOverBudget && "border-l-4 border-l-red-500")}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono font-bold">{cost.woNumber}</span>
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                    {cost.projectId && (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-800">
                                                            Project: {cost.projectId}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg mb-1">{cost.assetName}</div>
                                                <div className="text-sm text-muted-foreground">{cost.description}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">Total Variance</div>
                                                <div className={cn("text-2xl font-bold", isOverBudget ? "text-red-600" : "text-green-600")}>
                                                    {cost.variance < 0 ? "-" : "+"}${Math.abs(cost.variance)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {cost.variancePercent > 0 ? "+" : ""}{cost.variancePercent.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost Breakdown */}
                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div className="text-sm">
                                                <div className="font-medium mb-1">Labor</div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Budget:</span>
                                                    <span>${cost.budgetLabor}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Actual:</span>
                                                    <span className="font-bold">${cost.actualLabor}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <div className="font-medium mb-1">Materials</div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Budget:</span>
                                                    <span>${cost.budgetMaterial}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Actual:</span>
                                                    <span className="font-bold">${cost.actualMaterial}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <div className="font-medium mb-1">Other</div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Budget:</span>
                                                    <span>${cost.budgetOther}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Actual:</span>
                                                    <span className="font-bold">${cost.actualOther}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm border-t pt-3">
                                            <div className="text-muted-foreground">
                                                Completed: {cost.completedDate}
                                                {cost.approvedBy && ` • Approved by: ${cost.approvedBy}`}
                                            </div>
                                            <div className="flex gap-2">
                                                {cost.status === "PENDING_APPROVAL" && (
                                                    <Button size="sm" onClick={() => handleApproveCost(cost.id)}>
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                )}
                                                {cost.status === "APPROVED" && (
                                                    <>
                                                        <Button size="sm" onClick={() => handlePostToGL(cost.id)}>
                                                            <ArrowRight className="h-4 w-4 mr-1" />
                                                            Post to GL
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleTransferToProject(cost.id)}>
                                                            <Building2 className="h-4 w-4 mr-1" />
                                                            Transfer to Project
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="gl-queue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">GL Posting Queue ({glQueue.length} items)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {glQueue.map(item => (
                                    <div key={item.id} className="border rounded p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold">{item.woNumber}</span>
                                                <Badge variant="outline" className={
                                                    item.status === "POSTED" ? "bg-green-100 text-green-800" :
                                                        item.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                                                            item.status === "FAILED" ? "bg-red-100 text-red-800" :
                                                                "bg-yellow-100 text-yellow-800"
                                                }>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <div className="text-2xl font-bold">${item.amount.toLocaleString()}</div>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">GL Account:</span> {item.glAccount}
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Cost Center:</span> {item.costCenter}
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Queued:</span> {new Date(item.queuedDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {item.postedDate && (
                                            <div className="text-xs text-green-600 mt-2">
                                                Posted: {new Date(item.postedDate).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="variance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Budget vs. Actual by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={varianceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <ReferenceLine y={0} stroke="#000" />
                                    <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                                    <Bar dataKey="actual" fill="#22c55e" name="Actual" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-4">
                        {varianceData.map(variance => (
                            <Card key={variance.category}>
                                <CardContent className="pt-6">
                                    <h3 className="font-bold mb-3">{variance.category}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Budget:</span>
                                            <span>${variance.budget.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Actual:</span>
                                            <span className="font-bold">${variance.actual.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">Variance:</span>
                                            <span className={cn("font-bold", variance.variance < 0 ? "text-red-600" : "text-green-600")}>
                                                ${Math.abs(variance.variance).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right">
                                            {variance.variancePercent > 0 ? "+" : ""}{variance.variancePercent.toFixed(1)}%
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default CostManagementHub;
