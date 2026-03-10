import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Save, X, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from '@/lib/formatters';

interface PayAppLine {
    id: string;
    description: string;
    costCodeId?: string;
    scheduledValue: string;
    totalCompletedToDate: string;
    percentageComplete: string;
    workCompletedThisPeriod: string;
    materialsStored: string;
    previousAmount?: string;
}

interface PayAppLineEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    line: PayAppLine | null;
    onSave: (id: string, data: Partial<PayAppLine>) => Promise<void>;
    isReadOnly?: boolean;
}

export function PayAppLineEditor({ open, onOpenChange, line, onSave, isReadOnly }: PayAppLineEditorProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<PayAppLine>>({});
    const [isSaving, setIsSaving] = useState(false);

    if (!line) return null;

    const scheduledValue = Number(line.scheduledValue || 0);
    const totalCompleted = Number(formData.totalCompletedToDate || line.totalCompletedToDate || 0);
    const previousAmount = Number(line.previousAmount || 0);
    const workThisPeriod = totalCompleted - previousAmount;
    const materialsStored = Number(formData.materialsStored || line.materialsStored || 0);
    const percentComplete = scheduledValue > 0 ? (totalCompleted / scheduledValue) * 100 : 0;
    const balance = scheduledValue - totalCompleted;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!line.id || isReadOnly) return;

        setIsSaving(true);
        try {
            await onSave(line.id, {
                ...formData,
                percentageComplete: percentComplete.toString(),
                workCompletedThisPeriod: workThisPeriod.toString()
            });
            toast({ title: "Saved", description: "Pay app line updated successfully." });
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update line.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Edit Pay App Line
                    </DialogTitle>
                    <DialogDescription>{line.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Current vs Previous Comparison */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Progress Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Scheduled Value</div>
                                    <div className="font-mono font-bold">${formatNumber(scheduledValue)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Previous Amount</div>
                                    <div className="font-mono">${formatNumber(previousAmount)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">This Period</div>
                                    <div className="font-mono text-blue-600 font-bold">${formatNumber(workThisPeriod)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">% Complete</div>
                                    <div className="font-bold text-green-600">{percentComplete.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Balance</div>
                                    <div className="font-mono">${formatNumber(balance)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalCompleted">
                                Total Completed to Date *
                            </Label>
                            <Input
                                id="totalCompleted"
                                type="number"
                                step="0.01"
                                defaultValue={line.totalCompletedToDate}
                                onChange={(e) => handleInputChange("totalCompletedToDate", e.target.value)}
                                disabled={isReadOnly}
                                className="font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="materialsStored">
                                Materials Presently Stored
                            </Label>
                            <Input
                                id="materialsStored"
                                type="number"
                                step="0.01"
                                defaultValue={line.materialsStored}
                                onChange={(e) => handleInputChange("materialsStored", e.target.value)}
                                disabled={isReadOnly}
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Line Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add notes about this line item..."
                            rows={3}
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Calculation Details */}
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Work Completed This Period:</span>
                                <span className="font-mono">${formatNumber(totalCompleted)} - ${formatNumber(previousAmount)} = ${formatNumber(workThisPeriod)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Percentage Complete:</span>
                                <span className="font-mono">${formatNumber(totalCompleted)} ÷ ${formatNumber(scheduledValue)} = {percentComplete.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    {!isReadOnly && (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    )}
                    {isReadOnly && (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
