import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, BrainCircuit, Lightbulb } from "lucide-react";

interface Props {
    onViewChange: (view: string) => void;
}

export function ProcurementAI({ onViewChange }: Props) {
    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 border-blue-200 dark:border-blue-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="text-indigo-600" /> NexusAI Procurement Agent
                    </CardTitle>
                    <CardDescription>Real-time insights and autonomous suggestions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700">
                        <Lightbulb className="text-yellow-500 w-6 h-6 mt-1" />
                        <div>
                            <h4 className="font-semibold text-sm">Supplier Risk Alert</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Supplier <strong>Acme Corp</strong> has a 15% return rate on recent deliveries. Consider sourcing "Office Chairs" from <strong>Global Supplies Inc</strong> instead used in RFQ-123.
                            </p>
                            <Button size="sm" variant="outline" className="mt-2 text-xs">View Supplier Health</Button>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700">
                        <ShoppingCart className="text-blue-500 w-6 h-6 mt-1" />
                        <div>
                            <h4 className="font-semibold text-sm">Re-order Suggestion</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Inventory for <strong>Laptops (Item-101)</strong> is projected to run out in 14 days based on current consumption. Automated Requisition REQ-992 drafted.
                            </p>
                            <Button size="sm" className="mt-2 text-xs">Review Draft Requisition</Button>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700">
                        <DollarSign className="text-green-500 w-6 h-6 mt-1" />
                        <div>
                            <h4 className="font-semibold text-sm">Early Payment Opportunity</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                You have 3 invoices eligible for <strong>2% discount</strong> if paid by Friday. Potential savings: $450.00.
                            </p>
                            <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => onViewChange('invoices')}>Go to Invoices</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
