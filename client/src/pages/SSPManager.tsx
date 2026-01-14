import { useState } from "react";
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
import { StandardTable, type ColumnDef } from "@/components/ui/StandardTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Book, FileText } from "lucide-react";
import type { RevenueSspBook, RevenueSspLine } from "@shared/schema/revenue";
import { useToast } from "@/hooks/use-toast";

// Type-safe interfaces matching backend schema
interface SSPBook extends RevenueSspBook {
    // Add UI-specific fields if needed
}

interface SSPLine extends RevenueSspLine {
    itemName?: string;
}

export default function SSPManager() {
    const queryClient = useQueryClient();
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBookName, setNewBookName] = useState("");

    const { data: sspBooks, isLoading: booksLoading } = useQuery({
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

    const { data: sspLines, isLoading: linesLoading } = useQuery({
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

    const bookColumns: ColumnDef<SSPBook>[] = [
        {
            header: "Book Name",
            accessorKey: "name",
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: "Currency",
            accessorKey: "currency",
            cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>
        },
        {
            header: "Effective From",
            accessorKey: "effectiveFrom",
            cell: (info) => new Date(info.getValue()).toLocaleDateString()
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info) => <Badge>{info.getValue()}</Badge>
        },
        {
            header: "Actions",
            id: "actions",
            cell: (info) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedBook(info.row.original.id)}>
                    View Lines
                </Button>
            )
        }
    ];

    const lineColumns: ColumnDef<SSPLine>[] = [
        {
            header: "Item Name",
            accessorKey: "itemName",
            cell: (info) => info.getValue() || <span className="text-muted-foreground font-mono">{info.row.original.itemId}</span>
        },
        {
            header: "SSP Value",
            accessorKey: "sspValue",
            cell: (info) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(info.getValue()))
        },
        {
            header: "Min Quantity",
            accessorKey: "minQuantity"
        }
    ];

    if (booksLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SSP Manager</h1>
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
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* List of Books */}
                <div className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>SSP Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StandardTable data={sspBooks || []} columns={bookColumns} />
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
                            {selectedBook && <Button variant="outline" size="sm">+ Add Line</Button>}
                        </CardHeader>
                        <CardContent>
                            {selectedBook ? (
                                linesLoading ? <Skeleton className="h-32" /> : (
                                    <StandardTable data={sspLines || []} columns={lineColumns} />
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
        </div>
    );
}
