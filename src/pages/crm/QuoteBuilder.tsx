import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileDown, DollarSign, Search, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from '@/components/ui/DatePicker';

interface Product {
    id: string;
    name: string;
    sku: string;
    listPrice: number;
    category: string;
}

interface QuoteLineItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

interface PriceBook {
    id: string;
    name: string;
    type: "STANDARD" | "PARTNER" | "VOLUME";
    discountRules?: { minQuantity: number; discountPercent: number }[];
}

interface QuoteVersion {
    id: string;
    version: number;
    createdAt: string;
    createdBy: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
}

export default function QuoteBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
    const [selectedPriceBook, setSelectedPriceBook] = useState<string>("standard");
    const [searchTerm, setSearchTerm] = useState("");
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
    const [quoteHeader, setQuoteHeader] = useState({
        customerName: "",
        validUntil: "",
        terms: "Net 30"
    });

    // Fetch products
    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ["products", searchTerm],
        queryFn: async () => {
            const res = await fetch(`/api/crm/products?search=${searchTerm}`);
            return res.json();
        }
    });

    // Fetch price books
    const { data: priceBooks = [] } = useQuery<PriceBook[]>({
        queryKey: ["price-books"],
        queryFn: async () => {
            const res = await fetch("/api/crm/price-books");
            return res.json();
        }
    });

    // Fetch quote history (versions)
    const { data: quoteHistory = [] } = useQuery<QuoteVersion[]>({
        queryKey: ["quote-history"],
        queryFn: async () => {
            const res = await fetch("/api/crm/quotes/history");
            return res.json();
        }
    });

    // Save quote mutation
    const saveQuoteMutation = useMutation({
        mutationFn: async (quote: any) => {
            const res = await fetch("/api/crm/quotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quote)
            });
            if (!res.ok) throw new Error("Failed to save quote");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quote-history"] });
            toast({
                title: "Quote Saved",
                description: "Quote has been saved successfully"
            });
        }
    });

    // Add product to quote
    const addProduct = (product: Product) => {
        const existingItem = lineItems.find(item => item.productId === product.id);

        if (existingItem) {
            // Increment quantity
            setLineItems(lineItems.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice * (1 - item.discount / 100) }
                    : item
            ));
        } else {
            // Add new line item
            const newItem: QuoteLineItem = {
                id: `line-${Date.now()}`,
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                unitPrice: product.listPrice,
                discount: 0,
                total: product.listPrice
            };
            setLineItems([...lineItems, newItem]);
        }
        setIsProductSearchOpen(false);
    };

    // Update line item
    const updateLineItem = (id: string, field: keyof QuoteLineItem, value: number) => {
        setLineItems(lineItems.map(item => {
            if (item.id !== id) return item;

            const updated = { ...item, [field]: value };
            updated.total = updated.quantity * updated.unitPrice * (1 - updated.discount / 100);
            return updated;
        }));
    };

    // Remove line item
    const removeLineItem = (id: string) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Save quote
    const handleSaveQuote = () => {
        const quote = {
            header: quoteHeader,
            priceBookId: selectedPriceBook,
            lineItems,
            subtotal,
            tax,
            total,
            status: "DRAFT"
        };

        saveQuoteMutation.mutate(quote);
    };

    // Export PDF (placeholder)
    const handleExportPDF = () => {
        toast({
            title: "Exporting PDF",
            description: "Quote PDF export in progress..."
        });
        // In production, this would call a PDF generation endpoint
    };

    return (
        <StandardPage
            title="Quote Builder"
            description="Create and manage sales quotes with pricing intelligence"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Quote Builder" }
            ]}
        >
            <div className="space-y-6">
                {/* Quote Header */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Quote Information</CardTitle>
                        <CardDescription>Basic quote details and customer information</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Customer Name *</Label>
                            <Input
                                placeholder="Acme Corporation"
                                value={quoteHeader.customerName}
                                onChange={(e) => setQuoteHeader({ ...quoteHeader, customerName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Valid Until</Label>
                            <DatePicker value={quoteHeader.validUntil} onChange={(v) => setQuoteHeader({ ...quoteHeader, validUntil: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Select value={quoteHeader.terms} onValueChange={(v) => setQuoteHeader({ ...quoteHeader, terms: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                    <SelectItem value="Net 90">Net 90</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Price Book Selection */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Price Book:</label>
                    <Select value={selectedPriceBook} onValueChange={setSelectedPriceBook}>
                        <SelectTrigger className="w-60">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {priceBooks.map((pb) => (
                                <SelectItem key={pb.id} value={pb.id}>
                                    {pb.name} ({pb.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
                        <DialogTrigger asChild>
                            <Button className="ml-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Product Catalog</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product Name</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-right">List Price</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell><code className="text-xs">{product.sku}</code></TableCell>
                                                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                                    <TableCell className="text-right font-mono">${product.listPrice.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" onClick={() => addProduct(product)}>
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Line Items Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quote Line Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Discount %</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No products added. Click "Add Product" to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lineItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell><code className="text-xs">{item.sku}</code></TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value))}
                                                    className="w-20 text-right"
                                                    min="1"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-mono">${item.unitPrice.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    type="number"
                                                    value={item.discount}
                                                    onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value))}
                                                    className="w-20 text-right"
                                                    min="0"
                                                    max="100"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-bold">${item.total.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" onClick={() => removeLineItem(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {lineItems.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <div className="w-80 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span className="font-mono">${subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax (10%):</span>
                                        <span className="font-mono">${tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span className="font-mono text-green-700">${total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button onClick={handleSaveQuote} disabled={lineItems.length === 0 || !quoteHeader.customerName}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Save Quote
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF} disabled={lineItems.length === 0}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <History className="h-4 w-4 mr-2" />
                                Version History ({quoteHistory.length})
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Quote Version History</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                                {quoteHistory.map((version) => (
                                    <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">Version {version.version}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(version.createdAt).toLocaleString()} by {version.createdBy}
                                            </div>
                                        </div>
                                        <Badge>{version.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </StandardPage>
    );
}
