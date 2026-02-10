import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface StatementUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bankAccountId: string;
}

export function StatementUploadDialog({ open, onOpenChange, bankAccountId }: StatementUploadDialogProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState("CSV");
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!file || !bankAccountId) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bankAccountId", bankAccountId);
            formData.append("format", format);

            const res = await fetch("/api/finance/cash/statements/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(await res.text());

            toast({ title: "Bank Statement Uploaded", description: "Transactions have been imported successfully." });
            queryClient.invalidateQueries({ queryKey: [`/api/finance/cash/accounts/${bankAccountId}/statement-lines`] });
            onOpenChange(false);
            setFile(null);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Upload Failed", description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Bank Statement</DialogTitle>
                    <DialogDescription>
                        Select a bank statement file to import into the workbench.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="format" className="text-right">Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CSV">CSV Generic</SelectItem>
                                <SelectItem value="BAI2">BAI2</SelectItem>
                                <SelectItem value="MT940">SWIFT MT940</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">File</Label>
                        <Input
                            id="file"
                            type="file"
                            className="col-span-3"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading || !bankAccountId}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload Statement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
