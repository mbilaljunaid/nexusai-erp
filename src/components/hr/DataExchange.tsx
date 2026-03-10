import { formatDateTime } from "@/lib/dateUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileUp, AlertCircle, CheckCircle } from "lucide-react";

export function DataExchange() {
    const [csvContent, setCsvContent] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: imports, isLoading } = useQuery({
        queryKey: ["hr-hdl-history"],
        queryFn: () => api.hr.hdl.getHistory()
    });

    const importMutation = useMutation({
        mutationFn: (csv: string) => api.hr.hdl.importWorkers(csv),
        onSuccess: () => {
            toast({ title: "Import Processed", description: "Worker data has been processed." });
            setCsvContent("");
            queryClient.invalidateQueries({ queryKey: ["hr-hdl-history"] });
            queryClient.invalidateQueries({ queryKey: ["hr-persons-search"] }); // Refresh main list
        },
        onError: (err: any) => {
            toast({ title: "Import Failed", description: err.message, variant: "destructive" });
        }
    });

    const handleImport = () => {
        if (!csvContent.trim()) {
            toast({ title: "Error", description: "Please enter CSV content", variant: "destructive" });
            return;
        }
        importMutation.mutate(csvContent);
    };

    const template = `PersonNumber,FirstName,LastName,Email,DateOfBirth,NationalId,LegalEmployer,WorkerType,StartDate,JobCode,DeptName,Location
EMP001,John,Doe,john.doe@example.com,1990-01-01,123456,1,EMPLOYEE,2024-01-01,DEV_01,Engineering,New York`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Data Exchange (HDL Lite)</h2>
                    <p className="text-muted-foreground">Bulk load worker data using CSV format.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Import Area */}
                <Card>
                    <CardHeader>
                        <CardTitle>Import Workers</CardTitle>
                        <CardDescription>Paste CSV data below. Header row is required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs text-muted-foreground bg-slate-500/10 p-2 rounded border font-mono whitespace-pre-wrap">
                            Template:<br />
                            {template}
                        </div>
                        <Textarea
                            placeholder="Paste CSV content here..."
                            className="h-64 font-mono text-sm"
                            value={csvContent}
                            onChange={(e) => setCsvContent(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleImport} disabled={importMutation.isPending}>
                                {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <FileUp className="mr-2 h-4 w-4" /> Import Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History Area */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Imports</CardTitle>
                        <CardDescription>Status of last 10 jobs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Lines</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {imports?.length === 0 && <TableRow><TableCell colSpan={3}>No history found.</TableCell></TableRow>}
                                    {imports?.map((job: any) => (
                                        <TableRow key={job.id}>
                                            <TableCell>{formatDateTime(job.createdAt)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    job.status === "COMPLETED" ? "default" :
                                                        job.status === "FAILED" ? "destructive" :
                                                            "secondary"
                                                }>
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {job.successLines}</span>
                                                    {Number(job.failedLines) > 0 && (
                                                        <span className="text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {job.failedLines}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
