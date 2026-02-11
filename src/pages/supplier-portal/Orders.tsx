
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Package, Search, Download, Filter, ArrowUpDown, ArrowUp, ArrowDown, Calendar as CalendarIcon, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { POAcknowledgeModal } from "@/components/supplier-portal/POAcknowledgeModal";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function SupplierOrders() {
    const token = localStorage.getItem("supplier_token");
    const queryClient = useQueryClient();
    const [selectedPo, setSelectedPo] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

    // Fetch Orders
    const { data: orders, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/orders"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/orders", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        }
    });

    // Acknowledge Mutation
    // Acknowledge Mutation
    const acknowledgeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/portal/supplier/orders/${id}/acknowledge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-portal-token": token || ""
                }
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Order Acknowledged",
                description: "The purchase order has been confirmed.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/supplier/orders"] });
            setSelectedPo(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SENT": return <Badge variant="secondary">New</Badge>;
            case "OPEN": return <Badge variant="outline" className="border-green-500 text-green-600">Acknowledged</Badge>;
            case "COMPLETED": return <Badge className="bg-green-600">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const createInvoiceMutation = useMutation({
        mutationFn: async (po: any) => {
            const payload = {
                invoiceNumber: `INV-${po.poNumber}-${Date.now()}`,
                items: [
                    // Mock item for MVP parity - simulating billing for the remaining amount
                    { poLineId: "mock-line", quantity: 1, unitPrice: Number(po.totalAmount) }
                ]
            };

            const res = await fetch(`/api/portal/supplier/orders/${po.id}/invoice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-portal-token": token || ""
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Invoice Created", description: "Invoice submitted to AP successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleCreateInvoice = (po: any) => {
        if (confirm(`Create invoice for PO ${po.poNumber}?`)) {
            createInvoiceMutation.mutate(po);
        }
    };

    // Filter and sort orders
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        let filtered = orders.filter((po: any) => {
            const matchesStatus = statusFilter === "all" || po.status === statusFilter;
            const matchesSearch = !searchQuery ||
                po.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                po.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());

            // Date range filter
            const matchesDate = !dateRange.from || !po.orderDate || (
                new Date(po.orderDate) >= dateRange.from &&
                (!dateRange.to || new Date(po.orderDate) <= dateRange.to)
            );

            return matchesStatus && matchesSearch && matchesDate;
        });

        // Sorting
        if (sortField) {
            filtered.sort((a: any, b: any) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === 'orderDate') {
                    aVal = new Date(aVal).getTime();
                    bVal = new Date(bVal).getTime();
                } else if (sortField === 'totalAmount') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                }

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [orders, statusFilter, searchQuery, dateRange, sortField, sortDirection]);

    // CSV Export function
    const handleExportCSV = () => {
        if (!filteredOrders || filteredOrders.length === 0) {
            toast({ title: "No Data", description: "No orders to export", variant: "destructive" });
            return;
        }

        const headers = ["PO Number", "Date", "Status", "Total Amount", "Currency"];
        const rows = filteredOrders.map((po: any) => [
            po.poNumber || po.orderNumber,
            po.orderDate ? format(new Date(po.orderDate), 'yyyy-MM-dd') : '',
            po.status,
            Number(po.totalAmount).toFixed(2),
            po.currency || 'USD'
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `supplier-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({ title: "Export Successful", description: `${filteredOrders.length} orders exported` });
    };

    const toggleOrderSelection = (orderId: string) => {
        const newSelection = new Set(selectedOrders);
        if (newSelection.has(orderId)) {
            newSelection.delete(orderId);
        } else {
            newSelection.add(orderId);
        }
        setSelectedOrders(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedOrders.size === filteredOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(filteredOrders.map((o: any) => o.id)));
        }
    };

    const bulkAcknowledge = () => {
        if (selectedOrders.size === 0) {
            toast({ title: "No Selection", description: "Please select orders to acknowledge", variant: "destructive" });
            return;
        }

        if (confirm(`Acknowledge ${selectedOrders.size} selected orders?`)) {
            // Here you would call the bulk acknowledge API
            toast({ title: "Bulk Acknowledge", description: `${selectedOrders.size} orders acknowledged` });
            setSelectedOrders(new Set());
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                        {selectedOrders.size > 0 && ` • ${selectedOrders.size} selected`}
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedOrders.size > 0 && (
                        <>
                            <Button onClick={bulkAcknowledge} variant="default" className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Acknowledge ({selectedOrders.size})
                            </Button>
                            <Button onClick={() => setSelectedOrders(new Set())} variant="ghost" size="icon">
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {selectedOrders.size > 0 ? `Export Selected (${selectedOrders.size})` : 'Export CSV'}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by PO number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="w-48">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="SENT">New (SENT)</SelectItem>
                            <SelectItem value="OPEN">Acknowledged</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-48">
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from && dateRange.to ?
                                    `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}` :
                                    dateRange.from ? format(dateRange.from, 'MMM d, yyyy') :
                                        'Select dates'
                                }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                {(dateRange.from || dateRange.to) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateRange({ from: undefined, to: undefined })}
                        className="self-end"
                    >
                        Clear Date
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('poNumber')}>
                                    <div className="flex items-center gap-2">
                                        PO Number
                                        {getSortIcon('poNumber')}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('orderDate')}>
                                    <div className="flex items-center gap-2">
                                        Date
                                        {getSortIcon('orderDate')}
                                    </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('totalAmount')}>
                                    <div className="flex items-center gap-2 justify-end">
                                        Total Amount
                                        {getSortIcon('totalAmount')}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-32">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Package className="h-12 w-12 opacity-20" />
                                            <p className="font-medium">
                                                {searchQuery || statusFilter !== "all"
                                                    ? "No orders match your filters"
                                                    : "No orders found"}
                                            </p>
                                            {(searchQuery || statusFilter !== "all") && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setStatusFilter("all");
                                                    }}
                                                >
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((po: any) => (
                                    <TableRow key={po.id} className={selectedOrders.has(po.id) ? 'bg-blue-50' : ''}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedOrders.has(po.id)}
                                                onCheckedChange={() => toggleOrderSelection(po.id)}
                                                aria-label={`Select order ${po.poNumber}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                                        <TableCell>{po.orderDate ? format(new Date(po.orderDate), 'MMM d, yyyy') : '-'}</TableCell>
                                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: po.currency || 'USD' }).format(Number(po.totalAmount))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {po.status === 'SENT' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedPo(po)}
                                                    >
                                                        Acknowledge
                                                    </Button>
                                                )}
                                                {po.status === 'OPEN' && (
                                                    <>
                                                        <div className="flex items-center text-sm text-green-600 mr-2">
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Confirmed
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleCreateInvoice(po)}
                                                            disabled={createInvoiceMutation.isPending}
                                                        >
                                                            Create Invoice
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <POAcknowledgeModal
                isOpen={!!selectedPo}
                onClose={() => setSelectedPo(null)}
                onConfirm={() => selectedPo && acknowledgeMutation.mutate(selectedPo.id)}
                isLoading={acknowledgeMutation.isPending}
                poNumber={selectedPo?.poNumber}
            />
        </div>
    );
}
