import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, PlayCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OffCyclePayment() {
    const tenantId = "default-tenant";
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        personId: "EMP-10042",
        reason: "CORRECTION",
        grossAmount: "",
        paymentDate: new Date().toISOString().split("T")[0]
    });

    const [simulation, setSimulation] = useState<any>(null);

    const simulateMut = useMutation({
        mutationFn: async () => {
            // Mock simulation
            await new Promise(r => setTimeout(r, 600));
            return {
                gross: parseFloat(form.grossAmount) || 0,
                taxes: (parseFloat(form.grossAmount) || 0) * 0.22,
                deductions: 0,
                net: (parseFloat(form.grossAmount) || 0) * 0.78
            };
        },
        onSuccess: (data) => setSimulation(data)
    });

    const processMut = useMutation({
        mutationFn: async () => {
            await new Promise(r => setTimeout(r, 800));
            return { success: true };
        },
        onSuccess: () => {
            toast({ title: "Payment Processed", description: "Off-cycle payment initiated for ACH transfer." });
            setForm({ ...form, grossAmount: "" });
            setSimulation(null);
        }
    });

    return (
        <StandardPage title="Off-Cycle Payment Run">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Process ad-hoc payments outside the regular payroll cycle.</p>
                <Badge variant="outline" className="gap-2"><Clock className="h-4 w-4" /> Next Regular Cycle: Friday</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>Select employee and ad-hoc payment reason.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Employee ID</Label>
                            <Input value={form.personId} onChange={e => setForm(p => ({ ...p, personId: e.target.value }))} placeholder="Search employee..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Reason</Label>
                            <Select value={form.reason} onValueChange={v => setForm(p => ({ ...p, reason: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CORRECTION">Correction (Underpayment)</SelectItem>
                                    <SelectItem value="ADVANCE">Salary Advance</SelectItem>
                                    <SelectItem value="BONUS">Spot Bonus</SelectItem>
                                    <SelectItem value="TERMINATION">Termination (Final Pay)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Gross Amount (USD)</Label>
                                <Input type="number" value={form.grossAmount} onChange={e => setForm(p => ({ ...p, grossAmount: e.target.value }))} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Payment Date</Label>
                                <Input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} />
                            </div>
                        </div>
                        <Button
                            className="w-full gap-2 mt-2"
                            variant="secondary"
                            disabled={!form.grossAmount || simulateMut.isPending}
                            onClick={() => simulateMut.mutate()}
                        >
                            <Calculator className="h-4 w-4" /> Calculate Gross-to-Net
                        </Button>
                    </CardContent>
                </Card>

                {simulation ? (
                    <Card className="border-emerald-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Gross-to-Net Summary</CardTitle>
                            <CardDescription>Simulated payslip result for the off-cycle run.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between pb-2 border-b">
                                    <span className="text-muted-foreground">Gross Earnings</span>
                                    <span>${simulation.gross.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Estimated Taxes (22%)</span>
                                    <span>-${simulation.taxes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600 pb-2 border-b">
                                    <span>Other Deductions</span>
                                    <span>-${simulation.deductions.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-emerald-600 pt-2">
                                    <span>Net Direct Deposit</span>
                                    <span>${simulation.net.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                className="w-full gap-2 mt-6"
                                disabled={processMut.isPending}
                                onClick={() => processMut.mutate()}
                            >
                                <PlayCircle className="h-4 w-4" /> Process Payment
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="border border-dashed rounded-xl flex items-center justify-center p-8 text-muted-foreground h-full min-h-[300px]">
                        Calculate Gross-to-Net to preview the payment.
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
