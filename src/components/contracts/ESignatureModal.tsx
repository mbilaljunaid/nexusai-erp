import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ESignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId?: string;
    contractNumber?: string;
}

export function ESignatureModal({ isOpen, onClose, contractId, contractNumber }: ESignatureModalProps) {
    const queryClient = useQueryClient();
    const [signers, setSigners] = useState([{ name: "", email: "" }]);
    const [notes, setNotes] = useState("");

    // Send for e-signature mutation
    const esignMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/contract-portal/contracts/${contractId}/esign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signers, notes })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Sent for Signature",
                description: `Contract sent for e-signature. Envelope ID: ${data.contract?.esignEnvelopeId || 'N/A'}`
            });
            queryClient.invalidateQueries({ queryKey: [`/api/contract-portal/contracts/${contractId}`] });
            onClose();
            // Reset form
            setSigners([{ name: "", email: "" }]);
            setNotes("");
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const addSigner = () => {
        setSigners([...signers, { name: "", email: "" }]);
    };

    const updateSigner = (index: number, field: "name" | "email", value: string) => {
        const updated = [...signers];
        updated[index][field] = value;
        setSigners(updated);
    };

    const removeSigner = (index: number) => {
        setSigners(signers.filter((_, i) => i !== index));
    };

    const canSubmit = signers.every(s => s.name && s.email);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send for E-Signature
                    </DialogTitle>
                    <DialogDescription>
                        Send contract <strong>{contractNumber}</strong> for electronic signature
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Signers */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Signers</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSigner}>
                                Add Signer
                            </Button>
                        </div>

                        {signers.map((signer, index) => (
                            <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Name</Label>
                                        <Input
                                            placeholder="Full name"
                                            value={signer.name}
                                            onChange={(e) => updateSigner(index, "name", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={signer.email}
                                            onChange={(e) => updateSigner(index, "email", e.target.value)}
                                        />
                                    </div>
                                </div>
                                {signers.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSigner(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Message to Signers (Optional)</Label>
                        <Textarea
                            placeholder="Add a message for the signers..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <div className="flex gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">E-Signature Provider</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    This will create an envelope using the configured e-signature service.
                                    Signers will receive an email with signing instructions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => esignMutation.mutate()}
                        disabled={!canSubmit || esignMutation.isPending}
                        className="gap-2"
                    >
                        {esignMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Send for Signature
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
