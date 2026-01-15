
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BillingEvent } from "@shared/schema/billing_enterprise";
import { format } from "date-fns";

interface BillingEventDetailSheetProps {
    event: BillingEvent | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BillingEventDetailSheet({ event, open, onOpenChange }: BillingEventDetailSheetProps) {
    if (!event) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Billing Event Details</SheetTitle>
                    <SheetDescription>
                        ID: <span className="font-mono text-xs">{event.id}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Status Section */}
                    <div className="flex justify-between items-center">
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge variant={event.status === 'Pending' ? 'secondary' : event.status === 'Invoiced' ? 'default' : 'outline'}>
                            {event.status}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Main Info */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Amount</Label>
                                <div className="text-2xl font-bold font-mono">
                                    ${Number(event.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    <span className="text-sm text-muted-foreground ml-1">{event.currency || 'USD'}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Date</Label>
                                <div className="font-medium">{event.eventDate ? format(new Date(event.eventDate), 'PPP') : 'N/A'}</div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Customer ID</Label>
                            <div className="font-mono text-sm">{event.customerId}</div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Description</Label>
                            <div className="p-3 bg-muted/50 rounded-md text-sm">
                                {event.description}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Technical Details */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">Source Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Source System:</div>
                            <div className="font-medium">{event.sourceSystem}</div>

                            <div className="text-muted-foreground">Transaction ID:</div>
                            <div className="font-mono text-xs">{event.sourceTransactionId}</div>

                            <div className="text-muted-foreground">Created At:</div>
                            <div className="text-xs">{event.createdAt ? new Date(event.createdAt).toLocaleString() : '-'}</div>

                            {event.invoiceId && (
                                <>
                                    <div className="text-muted-foreground">Invoice ID:</div>
                                    <div className="font-mono text-xs text-primary">{event.invoiceId}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
