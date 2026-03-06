import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, AlertTriangle, ClipboardCheck, Timer, Package, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface WorkOrder {
    id: string;
    orderNumber: string;
    productId: string;
    productName?: string;
    quantity: number;
    status: string;
}

export default function ShopFloorTerminal() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [operator, setOperator] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [isTrxDialogOpen, setIsTrxDialogOpen] = useState(false);
    const [trxType, setTrxType] = useState<"COMPLETE" | "SCRAP">("COMPLETE");
    const [page, setPage] = useState(0);
    const limit = 50;

    const loginSchema = z.object({
        loginId: z.string().min(1, "Operator ID is required")
    });

    const trxSchema = z.object({
        trxQty: z.coerce.number().min(0, "Quantity must be positive")
    });

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { loginId: "" }
    });

    const trxForm = useForm<z.infer<typeof trxSchema>>({
        resolver: zodResolver(trxSchema),
        defaultValues: { trxQty: 0 }
    });

    const { data: woData, isLoading } = useQuery<{ items: WorkOrder[] }>({
        queryKey: ["/api/manufacturing/work-orders", "active", page],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/work-orders?limit=${limit}&offset=${page * limit}`);
            return res.json();
        }
    });

    const activeOrders = woData?.items.filter(o => o.status === "planned" || o.status === "in_progress") || [];

    const trxMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to record transaction");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/work-orders"] });
            setIsTrxDialogOpen(false);
            setSelectedOrder(null);
            trxForm.reset();
            toast({ title: "Recorded", description: "Production transaction saved." });
        }
    });

    const handleStart = (wo: WorkOrder) => {
        trxMutation.mutate({
            productionOrderId: wo.id,
            transactionType: "START",
            quantity: wo.quantity,
            transactionDate: new Date()
        });
    };

    const handleComplete = (wo: WorkOrder, type: "COMPLETE" | "SCRAP") => {
        setTrxType(type);
        trxForm.setValue("trxQty", wo.quantity);
        setSelectedOrder(wo);
        setIsTrxDialogOpen(true);
    };

    const onSubmitTrx = (values: z.infer<typeof trxSchema>) => {
        if (!selectedOrder) return;
        trxMutation.mutate({
            productionOrderId: selectedOrder.id,
            transactionType: trxType,
            quantity: values.trxQty,
            transactionDate: new Date()
        });
    };

    const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
        if (values.loginId.trim()) {
            setOperator(values.loginId);
            toast({ title: "Logged In", description: `Operator ${values.loginId} session active.` });
        }
    };

    if (!operator) {
        return (
            <StandardPage
                title="Shop Floor Terminal"
                breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Execution" }, { label: "Terminal" }]}
            >
                <div className="flex items-center justify-center py-20">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center">
                                <User className="mr-2 h-6 w-6" /> Operator Login
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                    <FormField
                                        control={loginForm.control}
                                        name="loginId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Operator Badge ID / Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter ID or swipe badge..." autoFocus {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full">
                                        Access Terminal
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </StandardPage>
        );
    }

    return (
        <StandardPage
            title={`Shop Floor Terminal - Station #01`}
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Execution" }, { label: "Terminal" }]}
            actions={
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm font-medium bg-secondary px-3 py-1 rounded-full">
                        <User className="mr-2 h-4 w-4" /> {operator}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setOperator(null)}>Logout</Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map(wo => (
                    <Card key={wo.id} className={`border-l-4 ${wo.status === 'in_progress' ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl font-bold">{wo.orderNumber}</CardTitle>
                            <Badge variant={wo.status === 'in_progress' ? 'default' : 'secondary'}>
                                {wo.status?.replace('_', ' ')}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>Product: <strong>{wo.productName || wo.productId}</strong></span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Timer className="mr-2 h-4 w-4" />
                                    <span>Quantity: <strong>{wo.quantity}</strong></span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Session: <strong>{operator}</strong></span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                            {wo.status === 'planned' ? (
                                <Button className="w-full col-span-2" onClick={() => handleStart(wo)}>
                                    <Play className="mr-2 h-4 w-4" /> Start Production
                                </Button>
                            ) : (
                                <>
                                    <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleComplete(wo, "COMPLETE")}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Complete
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleComplete(wo, "SCRAP")}>
                                        <AlertTriangle className="mr-2 h-4 w-4" /> Scrap
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                {activeOrders.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No active work orders</h3>
                        <p className="text-muted-foreground">Check planning to release new orders to the shop floor.</p>
                    </div>
                )}
            </div>

            
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm font-medium mx-4">Page {page} of {1}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => p + 1)} 
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <Dialog open={isTrxDialogOpen} onOpenChange={(open) => { setIsTrxDialogOpen(open); if (!open) trxForm.reset(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record {trxType === "COMPLETE" ? "Production Completion" : "Scrap / Rejection"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Form {...trxForm}>
                            <form onSubmit={trxForm.handleSubmit(onSubmitTrx)} className="space-y-4">
                                <FormField
                                    control={trxForm.control}
                                    name="trxQty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity to {trxType === "COMPLETE" ? "Report" : "Scrap"}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={trxMutation.isPending}>
                                    Confirm Transaction
                                </Button>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
