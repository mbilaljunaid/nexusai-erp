
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { Badge } from "@/components/ui/badge";
import type { Quote } from "@shared/schema";
import { useLocation } from "wouter";

interface OpportunityQuoteListProps {
    opportunityId: string;
}

export function OpportunityQuoteList({ opportunityId }: OpportunityQuoteListProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [_location, setLocation] = useLocation();

    const { data: quotes = [], isLoading } = useQuery<Quote[]>({
        queryKey: [`/api/crm/quotes?opportunityId=${opportunityId}`],
    });

    const formatCurrency = (val: number | string | null | undefined) => {
        if (!val) return "$0";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(val));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quotes ({quotes.length})</h3>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" /> New Quote
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                        {/* Wrap form in a scrollable div just in case */}
                        <div className="py-2">
                            <QuoteForm opportunityId={opportunityId} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading quotes...</div>
                ) : quotes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                        No quotes created yet. Create one to send a proposal.
                    </div>
                ) : (
                    quotes.map(quote => (
                        <Card key={quote.id} className="hover:bg-muted/40 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${quote.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{quote.name}</h4>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <span>#{quote.quoteNumber?.slice(0, 8) || 'DRAFT'}</span>
                                            <span>• {new Date(quote.createdAt || new Date()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="font-medium text-sm">{formatCurrency(quote.totalAmount)}</p>
                                    </div>
                                    <Badge variant={quote.status === "Accepted" ? "default" : "secondary"}>
                                        {quote.status}
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={() => setLocation?.(`/crm/quotes`)}>
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
