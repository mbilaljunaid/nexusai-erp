
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { QuoteForm } from "@/components/forms/QuoteForm";
import type { Quote } from "@shared/schema";

export default function QuotesDetail() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    const { data: quotes = [], isLoading } = useQuery<Quote[]>({
        queryKey: ["/api/crm/quotes"],
    });

    const filteredQuotes = quotes.filter(q =>
        q.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalValue = quotes.reduce((acc, q) => acc + Number(q.totalAmount || 0), 0);

    // Helper to format currency
    const formatCurrency = (val: number | string | null | undefined) => {
        if (!val) return "$0";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(val));
    };

    return (
        <div className="space-y-6 flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-semibold">Quotes</h1>
                        <p className="text-muted-foreground text-sm">
                            Total Value: <strong className="text-foreground">{formatCurrency(totalValue)}</strong> • Count: {quotes.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 items-center shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search quotes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No quotes found. Create one from an Opportunity.
                    </div>
                ) : (
                    filteredQuotes.map((quote) => (
                        <Card
                            key={quote.id}
                            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedQuote(quote)}
                        >
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${quote.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{quote.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <span>{quote.quoteNumber || 'No Number'}</span>
                                            {quote.expirationDate && (
                                                <span>• Exp: {new Date(quote.expirationDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Status</p>
                                        <Badge variant={quote.status === "Accepted" ? "default" : "secondary"}>
                                            {quote.status}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-muted-foreground text-xs">Total Amount</p>
                                        <p className="font-medium">{formatCurrency(quote.totalAmount)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="pt-6 border-t mt-4">
                <h2 className="text-xl font-semibold mb-4">+ New Standalone Quote</h2>
                <div className="bg-card border rounded-lg p-6">
                    <QuoteForm />
                </div>
            </div>

            {/* Detail Sheet */}
            <Sheet open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
                <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            {selectedQuote?.name}
                        </SheetTitle>
                        <SheetDescription>
                            {selectedQuote?.id}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedQuote && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant={selectedQuote.status === "Accepted" ? "default" : "secondary"}>
                                        {selectedQuote.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Expiration</p>
                                    <p className="font-medium">{selectedQuote.expirationDate ? new Date(selectedQuote.expirationDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedQuote.totalAmount)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {selectedQuote.description || "No description provided."}
                                </p>
                            </div>

                            {/* Placeholder for Line Items in Detail View - could add List here later */}
                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full">Generate PDF</Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
