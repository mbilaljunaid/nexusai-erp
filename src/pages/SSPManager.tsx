import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Book, FileText } from "lucide-react";
import type { RevenueSspBook, RevenueSspLine } from "@/types/erp-types";
import { useToast } from "@/hooks/use-toast";

interface SSPBook extends RevenueSspBook { }

interface SSPLine extends RevenueSspLine {
    itemName?: string;
}

export default function SSPManager() {
    const queryClient = useQueryClient();
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBookName, setNewBookName] = useState("");

    const { data: sspBooks, isLoading: booksLoading } = useQuery<any>({
        queryKey: ["sspBooks"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/ssp/books");
            if (!res.ok) {
                toast({ title: "Error", description: "Failed to fetch SSP books", variant: "destructive" });
                throw new Error("Failed to fetch SSP books");
            }
            return res.json();
        }
    });

    const { data: sspLines, isLoading: linesLoading } = useQuery<any>({
        queryKey: ["sspLines", selectedBook],
        queryFn: async () => {
            if (!selectedBook) return [];
            const res = await fetch(`/api/revenue/ssp/books/${selectedBook}/lines`);
            if (!res.ok) {
                toast({ title: "Error", description: "Failed to fetch lines", variant: "destructive" });
                throw new Error("Failed to fetch SSP lines");
            }
            return res.json();
        },
        enabled: !!selectedBook
    });

    const createBookMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch("/api/revenue/ssp/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, currency: "USD", effectiveFrom: new Date() })
            });
            if (!res.ok) throw new Error("Failed to create book");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "SSP Book created successfully." });
            queryClient.invalidateQueries({ queryKey: ["sspBooks"] });
            setIsDialogOpen(false);
            setNewBookName("");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create book", variant: "destructive" });
        }
    });

    const bookColumns: SpreadsheetColumn<SSPBook>[] = [
        {
            id: "bookName", header: "Book Name", width: "250px", cell: (item) => (
                <div className="flex items-center gap-2 p-2">
                    <Book className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{item.name}</span>
                </div>
            )
        },
        {
            id: "currency", header: "Currency", width: "120px", cell: (item) => <div className="p-2"><Badge variant="outline">{item.currency}</Badge></div>
        },
        {
            id: "effectiveFrom", header: "Effective From", width: "150px", cell: (item) => <div className="p-2">{new Date(item.effectiveFrom).toLocaleDateString()}</div>
        },
        {
            id: "status", header: "Status", width: "120px", cell: (item) => <div className="p-2"><Badge>{item.status}</Badge></div>
        },
        {
            id: "actions", header: "Actions", width: "150px", cell: (item) => (
                <div className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBook(item.id)}>
                        View Lines
                    </Button>
                </div>
            )
        }
    ];

    const lineColumns: SpreadsheetColumn<SSPLine>[] = [
        {
            id: "itemName", header: "Item Name", width: "300px", cell: (item) => <div className="p-2">{item.itemName || <span className="text-muted-foreground font-mono">{item.itemId}</span>}</div>
        },
        {
            id: "sspValue", header: "SSP Value", width: "150px", cell: (item) => <div className="p-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.sspValue))}</div>
        },
        {
            id: "minQuantity", header: "Min Quantity", width: "150px", cell: (item) => <div className="p-2">{item.minQuantity}</div>
        }
    ];

    const [isLineDialogOpen, setIsLineDialogOpen] = useState(false);
    const [newLineData, setNewLineData] = useState({ itemId: "", sspValue: "", minQuantity: "0" });

    const createLineMutation = useMutation({
        mutationFn: async (data: typeof newLineData) => {
            if (!selectedBook) throw new Error("No book selected");
            const res = await fetch("/api/revenue/ssp/lines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookId: selectedBook,
                    itemId: data.itemId,
                    sspValue: data.sspValue,
                    minQuantity: data.minQuantity
                })
            });
            if (!res.ok) throw new Error("Failed to add line");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "SSP Line added successfully." });
            queryClient.invalidateQueries({ queryKey: ["sspLines", selectedBook] });
            setIsLineDialogOpen(false);
            setNewLineData({ itemId: "", sspValue: "", minQuantity: "0" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to add SSP line", variant: "destructive" });
        }
    });

    if (booksLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

    return (
        <StandardPage
            title="SSP Manager"
            description="Manage Standalone Selling Prices for Allocations."
            className="space-y-6"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">SSP Manager</h1>
                    <p className="text-muted-foreground mt-1">Manage Standalone Selling Prices for Allocations.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New SSP Book</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New SSP Book</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Book Name</Label>
                                <Input
                                    value={newBookName}
                                    onChange={(e) => setNewBookName(e.target.value)}
                                    placeholder="e.g. FY2026 Standard SSP"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => createBookMutation.mutate(newBookName)}>Create Book</Button>
                        </div>
                    </DialogContent >
                </Dialog >
            </div >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* List of Books */}
                <div className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>SSP Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet data={sspBooks || []} columns={bookColumns} onChange={() => { }} virtualized={true} containerHeight="400px" />
                        </CardContent>
                    </Card>
                </div>

                {/* Lines for Selected Book */}
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                {selectedBook
                                    ? `Lines for ${sspBooks?.find((b: any) => b.id === selectedBook)?.name}`
                                    : "Select a Book to View Lines"}
                            </CardTitle>
                            {selectedBook && (
                                <Dialog open={isLineDialogOpen} onOpenChange={setIsLineDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">+ Add Line</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add SSP Line</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Item ID</Label>
                                                <Input
                                                    value={newLineData.itemId}
                                                    onChange={(e) => setNewLineData({ ...newLineData, itemId: e.target.value })}
                                                    placeholder="Product UUID or SKU"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SSP Value ($)</Label>
                                                <Input
                                                    type="number"
                                                    value={newLineData.sspValue}
                                                    onChange={(e) => setNewLineData({ ...newLineData, sspValue: e.target.value })}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Min Quantity</Label>
                                                <Input
                                                    type="number"
                                                    value={newLineData.minQuantity}
                                                    onChange={(e) => setNewLineData({ ...newLineData, minQuantity: e.target.value })}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={() => createLineMutation.mutate(newLineData)}>Add Line</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardHeader>
                        <CardContent>
                            {selectedBook ? (
                                linesLoading ? <Skeleton className="h-32" /> : (
                                    <InteractiveSpreadsheet data={sspLines || []} columns={lineColumns} onChange={() => { }} virtualized={true} containerHeight="400px" />
                                )
                            ) : (
                                <div className="h-32 flex items-center justify-center text-muted-foreground">
                                    Select a book from the left to manage its prices.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage >
    );
}
