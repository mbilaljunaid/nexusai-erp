import React, { useState } from "react";
import { Wizard, WizardStep } from "@/components/layout/Wizard";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JournalWizard() {
    const { toast } = useToast();
    const [headerData, setHeaderData] = useState({
        journalName: "",
        ledger: "Primary US Ledger",
        period: "JAN-26",
        category: "Manual",
        currency: "USD"
    });

    const [lines, setLines] = useState([
        { id: 1, account: "", debit: 0, credit: 0, description: "" },
        { id: 2, account: "", debit: 0, credit: 0, description: "" }
    ]);

    // Step 1: Journal Header
    const Step1 = (
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
                <Label>Journal Name</Label>
                <Input
                    value={headerData.journalName}
                    onChange={(e) => setHeaderData({ ...headerData, journalName: e.target.value })}
                    placeholder="e.g., Monthly Accrual"
                />
            </div>
            <div className="space-y-2">
                <Label>Ledger</Label>
                <Select value={headerData.ledger} onValueChange={(v) => setHeaderData({ ...headerData, ledger: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Primary US Ledger">Primary US Ledger</SelectItem>
                        <SelectItem value="Primary UK Ledger">Primary UK Ledger</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Accounting Period</Label>
                <Select value={headerData.period} onValueChange={(v) => setHeaderData({ ...headerData, period: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="JAN-26">JAN-26</SelectItem>
                        <SelectItem value="FEB-26">FEB-26</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Category</Label>
                <Select value={headerData.category} onValueChange={(v) => setHeaderData({ ...headerData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Accrual">Accrual</SelectItem>
                        <SelectItem value="Adjustment">Adjustment</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    // Step 2: Journal Lines
    const handleLineChange = (id: number, field: string, value: any) => {
        setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const addLine = () => {
        setLines([...lines, { id: lines.length + 1, account: "", debit: 0, credit: 0, description: "" }]);
    };

    const removeLine = (id: number) => {
        setLines(lines.filter(l => l.id !== id));
    };

    const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit), 0);
    const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit), 0);

    const Step2 = (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div className="space-x-8 text-sm">
                    <span>Total Debit: <strong>{totalDebit.toFixed(2)}</strong></span>
                    <span>Total Credit: <strong>{totalCredit.toFixed(2)}</strong></span>
                    <span className={totalDebit !== totalCredit ? "text-destructive font-bold" : "text-green-600 font-bold"}>
                        Variance: {Math.abs(totalDebit - totalCredit).toFixed(2)}
                    </span>
                </div>
                <Button variant="outline" size="sm" onClick={addLine}><Plus className="w-4 h-4 mr-2" /> Add Line</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Account</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lines.map((line) => (
                        <TableRow key={line.id}>
                            <TableCell>
                                <Input
                                    value={line.account}
                                    onChange={(e) => handleLineChange(line.id, "account", e.target.value)}
                                    placeholder="01-000-1110-0000-000"
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={line.debit}
                                    onChange={(e) => handleLineChange(line.id, "debit", Number(e.target.value))}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={line.credit}
                                    onChange={(e) => handleLineChange(line.id, "credit", Number(e.target.value))}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={line.description}
                                    onChange={(e) => handleLineChange(line.id, "description", e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)}>
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    // Step 3: Review
    const Step3 = (
        <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-lg">
                <div>
                    <span className="text-muted-foreground block">Journal Name</span>
                    <span className="font-medium">{headerData.journalName}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block">Ledger</span>
                    <span className="font-medium">{headerData.ledger}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block">Period</span>
                    <span className="font-medium">{headerData.period}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block">Category</span>
                    <span className="font-medium">{headerData.category}</span>
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-2">Lines Summary</h3>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell className="font-mono text-xs">{line.account}</TableCell>
                                    <TableCell className="text-right">{line.debit.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{line.credit.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right">{totalDebit.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{totalCredit.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );

    const steps: WizardStep[] = [
        {
            id: "header",
            label: "Batch Header",
            component: Step1,
            validationFn: () => {
                if (!headerData.journalName) {
                    toast({ title: "Validation Error", description: "Journal Name is required", variant: "destructive" });
                    return false;
                }
                return true;
            }
        },
        {
            id: "lines",
            label: "Journal Lines",
            component: Step2,
            validationFn: () => {
                if (Math.abs(totalDebit - totalCredit) > 0.01) {
                    toast({ title: "Validation Error", description: "Journal must be balanced", variant: "destructive" });
                    return false;
                }
                if (lines.length === 0) {
                    toast({ title: "Validation Error", description: "At least one line is required", variant: "destructive" });
                    return false;
                }
                return true;
            }
        },
        {
            id: "review",
            label: "Review & Submit",
            component: Step3
        }
    ];

    const handleComplete = () => {
        toast({ title: "Success", description: "Journal Entry Created Successfully" });
        // Navigate away or reset
    };

    return (
        <StandardPage title="Create Journal (Wizard)">
            <p className="text-muted-foreground mb-4">Create a new journal entry using the guided wizard.</p>
            <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[600px]">
                <Wizard
                    steps={steps}
                    onComplete={handleComplete}
                />
            </div>
        </StandardPage>
    );
}
