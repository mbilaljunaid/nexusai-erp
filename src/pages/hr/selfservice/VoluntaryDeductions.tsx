import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { i18n } from "@/lib/i18n";
import {
    Wallet,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    ArrowUpRight,
    TrendingDown,
    TrendingUp,
    History,
    AlertCircle,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VoluntaryDeduction {
    id: string;
    elementId: string;
    amount: string;
    frequency: string;
    startDate: string;
    endDate: string | null;
    status: string;
}

interface PayElement {
    id: string;
    name: string;
    classification: string;
}

interface RetroPayResult {
    id: string;
    elementName: string;
    amount: string;
    periodName: string;
    createdAt: string;
}

export default function VoluntaryDeductions() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [elementId, setElementId] = useState("");
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState("MONTHLY");

    const { data: deductions, isLoading: isDeductionsLoading } = useQuery<VoluntaryDeduction[]>({
        queryKey: ["/api/hr-self-service/me/payroll/deductions"],
    });

    const { data: retroPay, isLoading: isRetroLoading } = useQuery<RetroPayResult[]>({
        queryKey: ["/api/hr-self-service/me/payroll/retro-pay"],
    });

    const { data: elements } = useQuery<PayElement[]>({
        queryKey: ["/api/hr-self-service/payroll/eligible-elements"],
    });

    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/hr-self-service/me/payroll/deductions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to add deduction");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr-self-service/me/payroll/deductions"] });
            toast({ title: "Success", description: "Deduction preference saved." });
            setIsAddDialogOpen(false);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/hr-self-service/me/payroll/deductions/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to remove deduction");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr-self-service/me/payroll/deductions"] });
            toast({ title: "Removed", description: "Deduction has been deactivated." });
        },
    });

    const resetForm = () => {
        setElementId("");
        setAmount("");
        setFrequency("MONTHLY");
    };

    const handleAdd = () => {
        if (!elementId || !amount) {
            toast({ variant: "destructive", title: "Error", description: "Required fields missing." });
            return;
        }
        addMutation.mutate({
            elementId,
            amount,
            frequency,
            startDate: new Date(),
            status: "ACTIVE"
        });
    };

    const deductionColumns: Column<VoluntaryDeduction>[] = [
        {
            key: "elementId",
            header: "Element",
            render: (val: any) => elements?.find(e => e.id === val)?.name || val
        },
        {
            key: "amount",
            header: "Amount",
            render: (val: any) => (
                <span className="font-mono font-medium text-destructive">
                    -{Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "frequency",
            header: "Frequency",
            render: (val: any) => <Badge variant="outline">{val}</Badge>
        },
        {
            key: "startDate",
            header: "Effective From",
            render: (val: any) => format(new Date(val), "PPP")
        },
        {
            key: "id",
            header: "Actions",
            render: (id: any) => (
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            )
        }
    ];

    const retroColumns: Column<RetroPayResult>[] = [
        {
            key: "periodName",
            header: "Adjusted Period",
        },
        {
            key: "elementName",
            header: "Pay Element",
        },
        {
            key: "amount",
            header: "Amount",
            render: (val: any) => {
                const isPositive = Number(val) > 0;
                return (
                    <div className="flex items-center gap-1 font-mono font-medium">
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span className={isPositive ? "text-green-600" : "text-destructive"}>
                            {isPositive ? "+" : ""}{Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "createdAt",
            header: "Processed On",
            render: (val: any) => format(new Date(val), "PPP")
        }
    ];

    return (
        <StandardPage
            title="Payroll Preferences"
            subtitle="Manage voluntary deductions and view adjustment history"
            icon={<Wallet className="w-8 h-8 text-primary" />}
        >
            <Tabs defaultValue="deductions" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="deductions">Voluntary Deductions</TabsTrigger>
                    <TabsTrigger value="retro">Retro Pay History</TabsTrigger>
                </TabsList>

                <TabsContent value="deductions">
                    <Card className="vanguard-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Active Deductions</CardTitle>
                                <CardDescription>Non-mandatory deductions from your periodic pay</CardDescription>
                            </div>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="vanguard-button">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Deduction
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Deduction Preference</DialogTitle>
                                        <DialogDescription>
                                            Changes will be effective from the next open payroll cycle.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Pay Element</Label>
                                            <Select value={elementId} onValueChange={setElementId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select element..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {elements?.map(e => (
                                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Amount</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Frequency</Label>
                                            <Select value={frequency} onValueChange={setFrequency}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    <SelectItem value="FORTNIGHTLY">Fortnightly</SelectItem>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg flex gap-2">
                                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-muted-foreground">
                                                Voluntary deductions are processed after statutory taxes. Ensure your net pay covers the requested amount.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAdd} disabled={addMutation.isPending}>
                                            {addMutation.isPending ? "Processing..." : "Save Preference"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={deductions || []}
                                columns={deductionColumns}
                                isLoading={isDeductionsLoading}
                            />
                            {deductions?.length === 0 && !isDeductionsLoading && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <ArrowUpRight className="w-12 h-12 mb-4 opacity-20 text-green-500" />
                                    <p>No active voluntary deductions. You are taking home your full net pay!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="retro">
                    <Card className="vanguard-card">
                        <CardHeader>
                            <CardTitle>Retro Pay History</CardTitle>
                            <CardDescription>Adjustments made to your pay from previous periods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={retroPay || []}
                                columns={retroColumns}
                                isLoading={isRetroLoading}
                            />
                            {retroPay?.length === 0 && !isRetroLoading && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <History className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No retro-pay adjustments found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
