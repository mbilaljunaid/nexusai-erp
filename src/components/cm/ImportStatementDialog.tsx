import { cn } from "@/lib/utils";
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface Props {
    open: boolean;
    onClose: () => void;
    accountId: string;
}

export default function ImportStatementDialog({ open, onClose, accountId }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState('CSV');
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadMutation = useMutation({
        mutationFn: async (uploadFile: File) => {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('bankAccountId', accountId);
            formData.append('format', format);

            // Use XHR or fetch. apiRequest supports JSON mostly, need to handle FormData carefully.
            // But apiRequest wrapper might strictly set content-type json.
            // Let's use direct fetch for multipart or check apiRequest logic.
            // Assuming we need custom fetch for FormData to let browser set boundary.

            const res = await fetch('/api/cm/statements/upload', {
                method: 'POST',
                body: formData,
                // Do NOT set Content-Type header, browser does it with boundary
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Upload failed');
            }
            return res.json();
        },
        onMutate: () => {
            setUploadProgress(10);
            const interval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);
            return { interval };
        },
        onSuccess: (data, variables, context) => {
            clearInterval((context as any).interval);
            setUploadProgress(100);
            queryClient.invalidateQueries({ queryKey: ['/api/cm/accounts', accountId, 'statement-lines'] }); // Assuming this key
            queryClient.invalidateQueries({ queryKey: ['/api/cm/accounts', accountId, 'transactions'] });

            toast({
                title: 'Import Successful',
                description: `Imported ${data.lines?.length || 0} transaction lines.`
            });
            setTimeout(() => {
                setFile(null);
                setUploadProgress(0);
                onClose();
            }, 1000);
        },
        onError: (error, variables, context) => {
            clearInterval((context as any).interval);
            setUploadProgress(0);
            toast({
                title: 'Import Failed',
                description: error.message,
                variant: 'destructive'
            });
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import Bank Statement</DialogTitle>
                    <DialogClose />
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>File Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CSV">CSV (Generic)</SelectItem>
                                <SelectItem value="MT940">MT940 (Swift)</SelectItem>
                                <SelectItem value="BAI2">BAI2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Statement File</Label>
                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => fileInputRef.current?.click()}>
                        <div
                                                    className={cn(`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                                ${file ? 'border-blue-500 bg-blue-500/10' : 'border-slate-300 hover:border-slate-400'}`)}
                                                >
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept={format === 'CSV' ? '.csv' : '.txt,.sta,.xml'}
                                                        onChange={handleFileChange}
                                                        title="Bank statement file upload"
                                                        aria-label="Bank statement file upload"
                                                    />

                                                    {file ? (
                                                        <>
                                                            <FileText className="w-8 h-8 text-blue-500 mb-2" />
                                                            <p className="text-sm font-medium text-foreground dark:text-slate-200">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                                            <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                                                Change File
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-muted-foreground/70 mb-2" />
                                                            <p className="text-sm font-medium text-foreground dark:text-slate-200">Click to upload</p>
                                                            <p className="text-xs text-muted-foreground">Supported: {format}</p>
                                                        </>
                                                    )}
                                                </div>
                        </Button>
                    </div>

                    {uploadMutation.isPending && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={uploadMutation.isPending}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
                        {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Import
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
