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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface ROUAssetCreatorProps {
    leaseId: string;
    leaseName: string;
    rouValue: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ROUAssetCreatorModal({
    leaseId,
    leaseName,
    rouValue,
    isOpen,
    onClose,
    onSuccess
}: ROUAssetCreatorProps) {
    const queryClient = useQueryClient();
    const [assetCategory, setAssetCategory] = useState("LEASEHOLD_IMPROVEMENTS");
    const [depreciationMethod, setDepreciationMethod] = useState("STRAIGHT_LINE");
    const [assetBook, setAssetBook] = useState("CORPORATE");
    const [usefulLife, setUsefulLife] = useState("60"); // months

    const createAssetMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/create-asset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: assetCategory,
                    depreciationMethod,
                    book: assetBook,
                    usefulLifeMonths: parseInt(usefulLife)
                })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create ROU asset");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "ROU Asset Created",
                description: `Asset ${data.assetNumber} capitalized in Fixed Assets module`
            });
            queryClient.invalidateQueries({ queryKey: ["lease", leaseId] });
            onSuccess();
            onClose();
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Asset Creation Failed",
                description: error.message
            });
        }
    });

    const handleCreate = () => {
        createAssetMutation.mutate();
    };

    const monthlyDepreciation = rouValue / parseInt(usefulLife);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create ROU Asset from Lease</DialogTitle>
                    <DialogDescription>
                        Capitalize Right-of-Use asset and integrate with Fixed Assets module
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Asset Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Asset Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Source Lease:</span>
                                <span className="font-medium">{leaseName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ROU Asset Value:</span>
                                <span className="font-bold text-lg text-blue-600">
                                    ${rouValue.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Asset Type:</span>
                                <span className="font-medium">Right-of-Use Asset</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuration */}
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="category">Asset Category</Label>
                            <Select value={assetCategory} onValueChange={setAssetCategory}>
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LEASEHOLD_IMPROVEMENTS">Leasehold Improvements</SelectItem>
                                    <SelectItem value="EQUIPMENT">Equipment (ROU)</SelectItem>
                                    <SelectItem value="VEHICLES">Vehicles (ROU)</SelectItem>
                                    <SelectItem value="PROPERTY">Property (ROU)</SelectItem>
                                    <SelectItem value="OTHER_ROU">Other ROU Assets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="book">Asset Book</Label>
                            <Select value={assetBook} onValueChange={setAssetBook}>
                                <SelectTrigger id="book">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CORPORATE">Corporate Book</SelectItem>
                                    <SelectItem value="TAX">Tax Book</SelectItem>
                                    <SelectItem value="IFRS">IFRS Book</SelectItem>
                                    <SelectItem value="GAAP">GAAP Book</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="method">Depreciation Method</Label>
                            <Select value={depreciationMethod} onValueChange={setDepreciationMethod}>
                                <SelectTrigger id="method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STRAIGHT_LINE">Straight Line</SelectItem>
                                    <SelectItem value="DECLINING_BALANCE">Declining Balance</SelectItem>
                                    <SelectItem value="UNITS_OF_PRODUCTION">Units of Production</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="usefulLife">Useful Life (Months)</Label>
                            <Input
                                id="usefulLife"
                                type="number"
                                value={usefulLife}
                                onChange={(e) => setUsefulLife(e.target.value)}
                                placeholder="60"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Typically matches lease term
                            </p>
                        </div>
                    </div>

                    {/* Depreciation Preview */}
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-sm">Depreciation Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Monthly Depreciation:</span>
                                    <span className="font-mono font-medium">
                                        ${monthlyDepreciation.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Annual Depreciation:</span>
                                    <span className="font-mono font-medium">
                                        ${(monthlyDepreciation * 12).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Method:</span>
                                    <span>{depreciationMethod.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-blue-900">
                            <p className="font-medium">Integration Note</p>
                            <p className="text-xs mt-1">
                                This will create a Fixed Asset record linked to this lease.
                                Depreciation will be tracked separately in the Fixed Assets module.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={createAssetMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createAssetMutation.isPending}>
                        {createAssetMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Asset...
                            </>
                        ) : (
                            "Create ROU Asset"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
