import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Edit, Trash2, DollarSign, Calendar, Globe } from "lucide-react";

interface SSPBook {
    id: string;
    name: string;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string;
    status: string;
    createdAt: string;
}

interface SSPLine {
    id: string;
    bookId: string;
    itemId?: string;
    itemGroup?: string;
    sspValue: string;
    minQuantity?: string;
    maxQuantity?: string;
    region?: string;
    createdAt: string;
}

export default function RevenueSSPManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedBook, setSelectedBook] = useState<SSPBook | null>(null);
    const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
    const [isLineDialogOpen, setIsLineDialogOpen] = useState(false);
    const [editingLine, setEditingLine] = useState<SSPLine | null>(null);

    // Fetch SSP Books
    const { data: books = [], isLoading: booksLoading } = useQuery<SSPBook[]>({
        queryKey: ["/api/revenue/ssp/books"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/ssp/books");
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Fetch SSP Lines for selected book
    const { data: lines = [], isLoading: linesLoading } = useQuery<SSPLine[]>({
        queryKey: ["/api/revenue/ssp/lines", selectedBook?.id],
        queryFn: async () => {
            if (!selectedBook?.id) return [];
            const res = await fetch(`/api/revenue/ssp/books/${selectedBook.id}/lines`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!selectedBook?.id
    });

    // Create Book Mutation
    const createBookMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/revenue/ssp/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create SSP book");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/revenue/ssp/books"] });
            setIsBookDialogOpen(false);
            toast({ title: "SSP Book Created", description: "New SSP book has been created successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create SSP book.", variant: "destructive" });
        }
    });

    // Create/Update Line Mutation
    const saveLineMutation = useMutation({
        mutationFn: async (data: any) => {
            const url = editingLine
                ? `/api/revenue/ssp/lines/${editingLine.id}`
                : "/api/revenue/ssp/lines";
            const method = editingLine ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, bookId: selectedBook?.id })
            });
            if (!res.ok) throw new Error("Failed to save SSP line");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/revenue/ssp/lines", selectedBook?.id] });
            setIsLineDialogOpen(false);
            setEditingLine(null);
            toast({
                title: editingLine ? "SSP Line Updated" : "SSP Line Created",
                description: "SSP line has been saved successfully."
            });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save SSP line.", variant: "destructive" });
        }
    });

    // Delete Line Mutation
    const deleteLineMutation = useMutation({
        mutationFn: async (lineId: string) => {
            const res = await fetch(`/api/revenue/ssp/lines/${lineId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete SSP line");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/revenue/ssp/lines", selectedBook?.id] });
            toast({ title: "SSP Line Deleted", description: "SSP line has been removed." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete SSP line.", variant: "destructive" });
        }
    });

    const handleBookSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createBookMutation.mutate({
            name: formData.get("name"),
            currency: formData.get("currency"),
            effectiveFrom: formData.get("effectiveFrom"),
            effectiveTo: formData.get("effectiveTo") || null,
            status: "Active"
        });
    };

    const handleLineSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        saveLineMutation.mutate({
            itemId: formData.get("itemId") || null,
            itemGroup: formData.get("itemGroup") || null,
            sspValue: formData.get("sspValue"),
            minQuantity: formData.get("minQuantity") || "0",
            maxQuantity: formData.get("maxQuantity") || null,
            region: formData.get("region") || null
        });
    };

    const openEditLine = (line: SSPLine) => {
        setEditingLine(line);
        setIsLineDialogOpen(true);
    };

    const openNewLine = () => {
        setEditingLine(null);
        setIsLineDialogOpen(true);
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">SSP Manager</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage Standalone Selling Prices for ASC 606 price allocation
                    </p>
                </div>
                <Button onClick={() => setIsBookDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New SSP Book
                </Button>
            </div>

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total SSP Books</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{books.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {books.filter(b => b.status === "Active").length} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SSP Lines</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lines.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {selectedBook ? `In ${selectedBook.name}` : "Select a book"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Book</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">
                            {selectedBook?.name || "None selected"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {selectedBook ? selectedBook.currency : "-"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* SSP Books List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>SSP Books</CardTitle>
                        <CardDescription>Select a book to manage SSP lines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {booksLoading ? (
                            <p className="text-center py-8 text-muted-foreground">Loading...</p>
                        ) : books.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                No SSP books. Create one to get started.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {books.map((book) => (
                                    <div
                                        key={book.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBook?.id === book.id
                                                ? "bg-blue-50 border-blue-300"
                                                : "hover:bg-slate-50"
                                            }`}
                                        onClick={() => setSelectedBook(book)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{book.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {book.currency} • {new Date(book.effectiveFrom).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant={book.status === "Active" ? "default" : "secondary"}>
                                                {book.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* SSP Lines Table */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>SSP Lines</CardTitle>
                                <CardDescription>
                                    {selectedBook
                                        ? `Manage prices for ${selectedBook.name}`
                                        : "Select a book to view lines"}
                                </CardDescription>
                            </div>
                            {selectedBook && (
                                <Button onClick={openNewLine}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Line
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!selectedBook ? (
                            <p className="text-center py-12 text-muted-foreground">
                                ← Select an SSP book from the left to view and manage prices
                            </p>
                        ) : linesLoading ? (
                            <p className="text-center py-12 text-muted-foreground">Loading lines...</p>
                        ) : lines.length === 0 ? (
                            <p className="text-center py-12 text-muted-foreground">
                                No SSP lines defined. Click "Add Line" to create pricing.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item ID</TableHead>
                                        <TableHead>Item Group</TableHead>
                                        <TableHead className="text-right">SSP Value</TableHead>
                                        <TableHead>Min Qty</TableHead>
                                        <TableHead>Region</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell className="font-mono text-sm">
                                                {line.itemId || "-"}
                                            </TableCell>
                                            <TableCell>{line.itemGroup || "-"}</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {selectedBook.currency} {parseFloat(line.sspValue).toFixed(2)}
                                            </TableCell>
                                            <TableCell>{line.minQuantity || "0"}</TableCell>
                                            <TableCell>
                                                {line.region ? (
                                                    <Badge variant="outline">{line.region}</Badge>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditLine(line)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteLineMutation.mutate(line.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Book Dialog */}
            <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create SSP Book</DialogTitle>
                        <DialogDescription>
                            Define a new SSP book for a fiscal year, region, or currency.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBookSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Book Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., FY2026 Global SSP"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency *</Label>
                                <Select name="currency" defaultValue="USD" required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="JPY">JPY</SelectItem>
                                        <SelectItem value="CAD">CAD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="effectiveFrom">Effective From *</Label>
                                    <Input
                                        id="effectiveFrom"
                                        name="effectiveFrom"
                                        type="date"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="effectiveTo">Effective To</Label>
                                    <Input id="effectiveTo" name="effectiveTo" type="date" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsBookDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createBookMutation.isPending}>
                                {createBookMutation.isPending ? "Creating..." : "Create Book"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Line Dialog */}
            <Dialog open={isLineDialogOpen} onOpenChange={setIsLineDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLine ? "Edit" : "Add"} SSP Line</DialogTitle>
                        <DialogDescription>
                            Define the standalone selling price for an item or item group.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLineSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="itemId">Item ID</Label>
                                <Input
                                    id="itemId"
                                    name="itemId"
                                    placeholder="e.g., PROD-001"
                                    defaultValue={editingLine?.itemId || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="itemGroup">Item Group</Label>
                                <Input
                                    id="itemGroup"
                                    name="itemGroup"
                                    placeholder="e.g., Software Licenses"
                                    defaultValue={editingLine?.itemGroup || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sspValue">SSP Value *</Label>
                                <Input
                                    id="sspValue"
                                    name="sspValue"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    defaultValue={editingLine?.sspValue || ""}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minQuantity">Min Quantity</Label>
                                    <Input
                                        id="minQuantity"
                                        name="minQuantity"
                                        type="number"
                                        step="0.01"
                                        defaultValue={editingLine?.minQuantity || "0"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxQuantity">Max Quantity</Label>
                                    <Input
                                        id="maxQuantity"
                                        name="maxQuantity"
                                        type="number"
                                        step="0.01"
                                        defaultValue={editingLine?.maxQuantity || ""}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region">Region</Label>
                                <Select name="region" defaultValue={editingLine?.region || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select region (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Global (All Regions)</SelectItem>
                                        <SelectItem value="AMERICAS">Americas</SelectItem>
                                        <SelectItem value="EMEA">EMEA</SelectItem>
                                        <SelectItem value="APAC">APAC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsLineDialogOpen(false);
                                    setEditingLine(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saveLineMutation.isPending}>
                                {saveLineMutation.isPending
                                    ? "Saving..."
                                    : editingLine
                                        ? "Update Line"
                                        : "Add Line"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
