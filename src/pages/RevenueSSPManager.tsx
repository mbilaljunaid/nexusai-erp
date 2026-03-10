import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, DollarSign, Calendar } from "lucide-react";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { DatePickerField } from '@/components/forms/DatePickerField';

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

const sspBookSchema = z.object({
    name: z.string().min(1, "Name is required"),
    currency: z.string().min(1, "Currency is required"),
    effectiveFrom: z.string().min(1, "Effective From is required"),
    effectiveTo: z.string().optional()
});

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
            form.reset();
            toast({ title: "SSP Book Created", description: "New SSP book has been created successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create SSP book.", variant: "destructive" });
        }
    });

    const form = useForm<z.infer<typeof sspBookSchema>>({
        resolver: zodResolver(sspBookSchema),
        defaultValues: {
            name: "",
            currency: "USD",
            effectiveFrom: "",
            effectiveTo: ""
        }
    });

    useEffect(() => {
        if (!isBookDialogOpen) {
            form.reset();
        }
    }, [isBookDialogOpen, form]);

    const onBookSubmit = (values: z.infer<typeof sspBookSchema>) => {
        createBookMutation.mutate({
            ...values,
            effectiveTo: values.effectiveTo || null,
            status: "Active"
        });
    };

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



    return (
        <StandardPage
            title="SSP Manager"
            description="Manage Standalone Selling Prices for ASC 606 price allocation"
            actions={
                <Button onClick={() => setIsBookDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New SSP Book
                </Button>
            }
        >

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
                            <TableSkeleton rows={4} />
                        ) : books.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                No SSP books. Create one to get started.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {books.map((book) => (
                                    <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedBook(book)}>
                                    <div
                                                                            key={book.id}
                                                                            className={cn(`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBook?.id === book.id
                                                                                ? "bg-blue-500/10 border-blue-300"
                                                                                : "hover:bg-slate-500/10"
                                                                                }`)}
                                                                        >
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="flex-1">
                                                                                    <p className="font-semibold text-sm">{book.name}</p>
                                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                                        {book.currency} • {formatDate(book.effectiveFrom)}
                                                                                    </p>
                                                                                </div>
                                                                                <Badge variant={book.status === "Active" ? "default" : "secondary"}>
                                                                                    {book.status}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                    </Button>
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
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const newLines: any = [...lines, {
                                                id: `temp-${Date.now()}`,
                                                bookId: selectedBook.id,
                                                itemId: "",
                                                itemGroup: "",
                                                sspValue: "0.00",
                                                minQuantity: "0",
                                                maxQuantity: "",
                                                region: "Global"
                                            }];
                                            queryClient.setQueryData(["/api/revenue/ssp/lines", selectedBook.id], newLines);
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Line
                                    </Button>
                                    <Button
                                        onClick={() => saveLineMutation.mutate(lines)}
                                        disabled={saveLineMutation.isPending}
                                    >
                                        {saveLineMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedBook ? (
                            <div className="p-8 pb-12">
                                <p className="text-center py-12 text-muted-foreground">
                                    ← Select an SSP book from the left to view and manage prices
                                </p>
                            </div>
                        ) : linesLoading ? (
                            <div className="p-8 pb-12">
                                <p className="text-center py-12 text-muted-foreground">Loading lines...</p>
                            </div>
                        ) : (
                            <InteractiveSpreadsheet
                                data={lines}
                                columns={[
                                    {
                                        id: "itemId",
                                        header: "Item ID",
                                        width: "150px",
                                        cell: (row, index, updateRow) => (
                                            <Input
                                                className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                                                value={row.itemId || ''}
                                                onChange={(e) => updateRow("itemId", e.target.value)}
                                                placeholder="e.g. PROD-01"
                                            />
                                        )
                                    },
                                    {
                                        id: "itemGroup",
                                        header: "Item Group",
                                        width: "150px",
                                        cell: (row, index, updateRow) => (
                                            <Input
                                                className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                                                value={row.itemGroup || ''}
                                                onChange={(e) => updateRow("itemGroup", e.target.value)}
                                            />
                                        )
                                    },
                                    {
                                        id: "sspValue",
                                        header: `SSP Value (${selectedBook.currency})`,
                                        width: "140px",
                                        cell: (row, index, updateRow) => (
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right font-mono font-semibold"
                                                value={row.sspValue || ''}
                                                onChange={(e) => updateRow("sspValue", e.target.value)}
                                            />
                                        )
                                    },
                                    {
                                        id: "minQuantity",
                                        header: "Min Qty",
                                        width: "100px",
                                        cell: (row, index, updateRow) => (
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                                                value={row.minQuantity || ''}
                                                onChange={(e) => updateRow("minQuantity", e.target.value)}
                                            />
                                        )
                                    },
                                    {
                                        id: "region",
                                        header: "Region",
                                        width: "150px",
                                        cell: (row, index, updateRow) => (
                                            <Select value={row.region || "Global"} onValueChange={(val) => updateRow("region", val)}>
                                                <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Global">Global</SelectItem>
                                                    <SelectItem value="AMERICAS">AMERICAS</SelectItem>
                                                    <SelectItem value="EMEA">EMEA</SelectItem>
                                                    <SelectItem value="APAC">APAC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )
                                    }
                                ]}
                                onChange={(newData) => {
                                    queryClient.setQueryData(["/api/revenue/ssp/lines", selectedBook.id], newData);
                                }}
                            />
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onBookSubmit)}>
                            <div className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Book Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., FY2026 Global SSP" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency *</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                    <SelectItem value="GBP">GBP</SelectItem>
                                                    <SelectItem value="JPY">JPY</SelectItem>
                                                    <SelectItem value="CAD">CAD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="effectiveFrom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Effective From *</FormLabel>
                                                <FormControl>
                                                    <DatePickerField {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="effectiveTo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Effective To</FormLabel>
                                                <FormControl>
                                                    <DatePickerField {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                    </Form>
                </DialogContent>
            </Dialog>

        </StandardPage>
    );
}
