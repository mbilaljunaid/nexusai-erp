import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Plus, Truck, Search, Download, ArrowUpDown, ArrowUp, ArrowDown, Calendar as CalendarIcon, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { CreateASNModal } from "@/components/supplier-portal/CreateASNModal";
import { toast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { ExportButton } from "@/components/ExportButton";


export default function SupplierASNs() {
    const token = localStorage.getItem("supplier_token");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
    const [selectedAsns, setSelectedAsns] = useState<Set<string>>(new Set());

    const { data: asns, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/asns"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/asns", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch ASNs");
            return res.json();
        }
    });

    // Filter and sort ASNs
    const filteredAsns = useMemo(() => {
        if (!asns) return [];

        let filtered = asns.filter((asn: any) => {
            const matchesSearch = !searchQuery ||
                asn.asnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asn.poNumber?.toLowerCase().includes(searchQuery.toLowerCase());

            // Date range filter
            const matchesDate = !dateRange.from || !asn.shippedDate || (
                new Date(asn.shippedDate) >= dateRange.from &&
                (!dateRange.to || new Date(asn.shippedDate) <= dateRange.to)
            );

            return matchesSearch && matchesDate;
        });

        // Sorting
        if (sortField) {
            filtered.sort((a: any, b: any) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === 'shippedDate') {
                    aVal = new Date(aVal).getTime();
                    bVal = new Date(bVal).getTime();
                }

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [asns, searchQuery, dateRange, sortField, sortDirection]);

    // Data mapping for export
    const exportData = (selectedAsns.size > 0 ? filteredAsns.filter((asn: any) => selectedAsns.has(asn.id)) : filteredAsns).map((asn: any) => ({
        "ASN Number": asn.asnNumber,
        "PO Number": asn.poNumber,
        "Shipped Date": asn.shippedDate ? format(new Date(asn.shippedDate), 'yyyy-MM-dd') : '',
        "Status": asn.status
    }));

    const toggleAsnSelection = (asnId: string) => {
        const newSelection = new Set(selectedAsns);
        if (newSelection.has(asnId)) {
            newSelection.delete(asnId);
        } else {
            newSelection.add(asnId);
        }
        setSelectedAsns(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedAsns.size === filteredAsns.length) {
            setSelectedAsns(new Set());
        } else {
            setSelectedAsns(new Set(filteredAsns.map((asn: any) => asn.id)));
        }
    };

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

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    return (
        <StandardPage title="Shipments (ASN)">
            <div className="flex items-center justify-between">
                <div>

                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredAsns.length} {filteredAsns.length === 1 ? 'shipment' : 'shipments'} found
                        {selectedAsns.size > 0 && ` • ${selectedAsns.size} selected`}
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedAsns.size > 0 && (
                        <Button onClick={() => setSelectedAsns(new Set())} variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <ExportButton
                        data={exportData}
                        filename={`supplier-asns-${format(new Date(), 'yyyy-MM-dd')}`}
                    />
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create ASN
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
                            placeholder="Search by ASN or PO number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="w-48">
                    <label className="text-sm font-medium mb-2 block">Shipped Date Range</label>
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
                        <Truck className="h-5 w-5" />
                        Shipment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedAsns.size === filteredAsns.length && filteredAsns.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('asnNumber')}>
                                    <div className="flex items-center gap-2">
                                        ASN Number
                                        {getSortIcon('asnNumber')}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('poNumber')}>
                                    <div className="flex items-center gap-2">
                                        PO Number
                                        {getSortIcon('poNumber')}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('shippedDate')}>
                                    <div className="flex items-center gap-2">
                                        Shipped Date
                                        {getSortIcon('shippedDate')}
                                    </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAsns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-32">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Truck className="h-12 w-12 opacity-20" />
                                            <p className="font-medium">
                                                {searchQuery ? "No shipments match your search" : "No shipments found"}
                                            </p>
                                            {searchQuery && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSearchQuery("")}
                                                >
                                                    Clear Search
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAsns.map((asn: any) => (
                                    <TableRow key={asn.id} className={selectedAsns.has(asn.id) ? 'bg-blue-50' : ''}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedAsns.has(asn.id)}
                                                onCheckedChange={() => toggleAsnSelection(asn.id)}
                                                aria-label={`Select ASN ${asn.asnNumber}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{asn.asnNumber}</TableCell>
                                        <TableCell>{asn.poNumber}</TableCell>
                                        <TableCell>{asn.shippedDate ? format(new Date(asn.shippedDate), 'MMM d, yyyy') : '-'}</TableCell>
                                        <TableCell><Badge variant="secondary">{asn.status}</Badge></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateASNModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </StandardPage>
    );
}
