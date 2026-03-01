import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2, PlayCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JournalImport() {
    const { toast } = useToast();
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: imports, isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/imports"],
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/gl/imports/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to upload file");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/imports"] });
            toast({ title: "Import Successful", description: "Journal data has been staged for processing." });
            setIsImportOpen(false);
            setSelectedFile(null);
        },
        onError: (error: any) => {
            toast({ title: "Import Failed", description: error.message, variant: "destructive" });
        }
    });

    const processMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/gl/imports/${id}/process`, {
                method: "POST",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to process import");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/imports"] });
            toast({ title: "Processing Started", description: "The imported journals are now being processed." });
        },
        onError: (error: any) => {
            toast({ title: "Processing Failed", description: error.message, variant: "destructive" });
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) return;
        uploadMutation.mutate(selectedFile);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Journal Imports</h1>
                        <p className="text-muted-foreground">Upload, validate, and process flat-file journal entries</p>
                    </div>
                </div>
                <Button onClick={() => setIsImportOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Upload className="h-4 w-4" /> Upload File
                </Button>
            </div>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Journals</DialogTitle>
                        <DialogDescription>
                            Upload a CSV or Excel file containing journal entries.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="file">Select File</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Download the standard <a href="/templates/journal_import_template.csv" className="text-blue-500 underline">CSV template</a>.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload & Validate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="border-none shadow-lg">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle>Import History</CardTitle>
                    <CardDescription>Track the status of uploaded journal files.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {(!imports || imports.length === 0) ? (
                        <div className="text-center p-8 text-muted-foreground flex flex-col items-center gap-3">
                            <Upload className="h-10 w-10 opacity-20" />
                            <p>No import history found. Start by uploading a file.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">File Name</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Ledger</TableHead>
                                    <TableHead>Lines</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {imports.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="pl-6 font-medium">{job.fileName}</TableCell>
                                        <TableCell>{job.source}</TableCell>
                                        <TableCell>{job.ledgerId}</TableCell>
                                        <TableCell>{job.totalLines || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                job.status === "Processed" ? "bg-green-100 text-green-800" :
                                                    job.status === "Error" ? "bg-red-100 text-red-800" :
                                                        job.status === "Validated" ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                            }>
                                                {job.status === "Processed" && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                                                {job.status === "Error" && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(job.createdAt), "MMM d, yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {job.status === 'Validated' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                    onClick={() => processMutation.mutate(job.id)}
                                                    disabled={processMutation.isPending}
                                                >
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Process
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
