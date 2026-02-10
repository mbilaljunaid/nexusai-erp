
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function LeaseExtractionWizard({ onClose }: { onClose: () => void }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [step, setStep] = useState<"input" | "review">("input");
    const [rawText, setRawText] = useState("");

    // Extracted Data State
    const [data, setData] = useState({
        leaseNumber: "",
        commencementDate: "",
        expirationDate: "",
        monthlyRent: "",
        lessorName: "",
        confidence: 0
    });

    const extractMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/lease/leases/extract", { text: rawText });
            return res.json();
        },
        onSuccess: (result) => {
            setData({
                leaseNumber: result.leaseNumber,
                commencementDate: result.commencementDate,
                expirationDate: result.expirationDate,
                monthlyRent: result.monthlyRent,
                lessorName: result.lessorName,
                confidence: result.confidence
            });
            setStep("review");
            toast({ title: "Analysis Complete", description: "Lease data extracted successfully." });
        },
        onError: (e) => {
            toast({ title: "Extraction Failed", description: e.message, variant: "destructive" });
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            // Create Lease Header
            const res = await apiRequest("POST", "/api/lease/leases", {
                leaseNumber: data.leaseNumber,
                description: `Lease with ${data.lessorName}`,
                vendorId: "vendor-uuid-placeholder", // In real app, would search/create vendor
                commencementDate: data.commencementDate,
                expirationDate: data.expirationDate,
                termMonths: 60, // Simplified calc
                discountRate: 0.05
            });
            const lease = await res.json();

            // Create Payment
            await apiRequest("POST", `/api/lease/leases/${lease.id}/payments`, {
                amount: parseFloat(data.monthlyRent),
                startDate: data.commencementDate,
                endDate: data.expirationDate,
                frequency: "MONTHLY"
            });

            return lease;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leases"] });
            toast({ title: "Success", description: "Lease created from AI extraction." });
            onClose();
        }
    });

    return (
        <Card className="w-full max-w-2xl mx-auto border-2 border-indigo-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <CardTitle>AI Lease Abstraction</CardTitle>
                </div>
                <CardDescription>Paste lease contract text or upload PDF to auto-extract terms.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                {step === "input" && (
                    <div className="space-y-4">
                        <Label>Contract Text</Label>
                        <Textarea
                            placeholder="Paste contract text here..."
                            className="h-64 font-mono text-sm"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={() => extractMutation.mutate()}
                                disabled={!rawText || extractMutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {extractMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                Analyze Contract
                            </Button>
                        </div>
                    </div>
                )}

                {step === "review" && (
                    <div className="space-y-6">
                        <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800 font-medium">Confidence Score: {(data.confidence * 100).toFixed(0)}%</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Lease Number</Label>
                                <Input value={data.leaseNumber} onChange={e => setData({ ...data, leaseNumber: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Lessor</Label>
                                <Input value={data.lessorName} onChange={e => setData({ ...data, lessorName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={data.commencementDate} onChange={e => setData({ ...data, commencementDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" value={data.expirationDate} onChange={e => setData({ ...data, expirationDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Monthly Rent</Label>
                                <Input type="number" value={data.monthlyRent} onChange={e => setData({ ...data, monthlyRent: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep("input")}>Back</Button>
                            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Create Lease
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
