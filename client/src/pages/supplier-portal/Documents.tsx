
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, FileText, Calendar, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function SupplierDocuments() {
    const token = localStorage.getItem("supplier_token");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    // Fetch Documents
    const { data: documents, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/documents"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/documents", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch documents");
            return res.json();
        }
    });

    // Upload Mutation
    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/portal/supplier/documents", {
                method: "POST",
                headers: { "x-portal-token": token || "" },
                body: formData
            });
            if (!res.ok) throw new Error("Upload failed");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Document uploaded successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/supplier/documents"] });
            setUploading(false);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
            setUploading(false);
        }
    });

    const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData(e.currentTarget);
        uploadMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Certifications & Documents</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5" />
                            Upload New Document
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="documentType">Document Type</Label>
                                <Select name="documentType" defaultValue="OTHER">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="W-9">W-9 Form</SelectItem>
                                        <SelectItem value="INSURANCE">Insurance Certificate</SelectItem>
                                        <SelectItem value="CERTIFICATION">Industry Certification</SelectItem>
                                        <SelectItem value="OTHER">Other Business Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                                <Input type="date" name="expiryDate" id="expiryDate" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file">File</Label>
                                <Input type="file" name="file" id="file" required />
                            </div>
                            <Button type="submit" className="w-full" disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload Document"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            Compliance Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>To remain an active supplier, please ensure the following documents are up to date:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Valid W-9 or Tax Equivalent</li>
                            <li>General Liability Insurance Certification</li>
                            <li>ISO or relevant Industry Quality Certs</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Repository</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>File Name</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Uploaded</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                            ) : documents?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center">No documents found</TableCell></TableRow>
                            ) : (
                                documents?.map((doc: any) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium underline cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                {doc.documentType}
                                            </div>
                                        </TableCell>
                                        <TableCell>{doc.fileName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {doc.expiryDate ? format(new Date(doc.expiryDate), "MMM dd, yyyy") : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={doc.status === 'ACTIVE' ? "default" : "secondary"}>
                                                {doc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(doc.createdAt), "MMM dd, yyyy")}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
