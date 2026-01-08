
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { QuoteForm } from "@/components/forms/QuoteForm";
import type { Quote } from "@shared/schema";
import { Plus, CheckCircle2, Clock, Calendar, DollarSign, FileText, ArrowRight } from "lucide-react";

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

    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted');
    const pendingQuotes = quotes.filter(q => q.status !== 'Accepted');

    return (
        <div className="space-y-6 flex flex-col flex-1 overflow-y-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4 border-b">
                <div className="flex items-center gap-2">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sales Quotes</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 italic">
                            Manage and track active sales proposals
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="shad-primary-btn group transition-all duration-300">
                                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                Add Quote
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-xl w-[90vw]">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-2xl font-bold">Issue New Quote</SheetTitle>
                                <SheetDescription>Generate a standalone sales proposal for your client.</SheetDescription>
                            </SheetHeader>
                            <div className="mt-4">
                                <QuoteForm />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900 overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <DollarSign className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Pipeline Value</p>
                        <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900 overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <CheckCircle2 className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Accepted Quotes</p>
                        <p className="text-3xl font-bold">{acceptedQuotes.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900 overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <Clock className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Pending/Open</p>
                        <p className="text-3xl font-bold">{pendingQuotes.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Area */}
            <div className="flex gap-4 items-center shrink-0">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by quote name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 border-muted-foreground/20 focus-visible:ring-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border-2 border-dashed bg-muted/20">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold">No quotes found</h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            {searchQuery ? `No quotes matching "${searchQuery}"` : "You haven't generated any standalone quotes yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredQuotes.map((quote) => (
                            <Card
                                key={quote.id}
                                className="group shadow-sm hover:shadow-xl hover:-translate-y-1 border-muted-foreground/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full bg-card"
                                onClick={() => setSelectedQuote(quote)}
                            >
                                <div className={`h-1.5 w-full ${quote.status === 'Accepted' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-muted'}`} />
                                <CardContent className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl transition-colors duration-300 ${quote.status === 'Accepted' ? 'bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <Badge variant={quote.status === "Accepted" ? "default" : "secondary"} className="font-medium px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                            {quote.status}
                                        </Badge>
                                    </div>

                                    <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{quote.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-4 font-mono uppercase tracking-widest">{quote.quoteNumber || 'Q-PENDING'}</p>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-2xl font-bold">{formatCurrency(quote.totalAmount)}</span>
                                    </div>

                                    <div className="pt-4 border-t border-muted/20 flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            Exp: {quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            Manage <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="bg-muted/30 border-none shadow-none">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-background shadow-sm">
                                            <DollarSign className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Value</p>
                                            <p className="font-bold text-lg">{formatCurrency(selectedQuote.totalAmount)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-muted/30 border-none shadow-none">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-background shadow-sm">
                                            {selectedQuote.status === 'Accepted' ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-amber-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</p>
                                            <Badge variant={selectedQuote.status === "Accepted" ? "default" : "secondary"}>
                                                {selectedQuote.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-muted-foreground">Quote Number</p>
                                    <p className="font-mono">{selectedQuote.quoteNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Expiration Date</p>
                                    <p className="font-medium">{selectedQuote.expirationDate ? new Date(selectedQuote.expirationDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Proposal Description
                                </h3>
                                <div className="p-6 rounded-xl bg-card border shadow-sm min-h-[100px]">
                                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap italic">
                                        {selectedQuote.description || "No description provided for this proposal."}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t flex flex-col gap-3">
                                <Button className="w-full">Generate PDF Proposal</Button>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1">Mark as Accepted</Button>
                                    <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">Void Quote</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
