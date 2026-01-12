
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function JournalWizard() {
    const { toast } = useToast();
    const [pasteData, setPasteData] = useState("");
    const [parsedLines, setParsedLines] = useState<any[]>([]);

    // Parse Tab-Separated Values (Excel Copy/Paste)
    const handleParse = () => {
        if (!pasteData) return;
        const rows = pasteData.trim().split("\n");
        const lines = rows.map((row) => {
            const cols = row.split("\t");
            // Assuming format: Account | Debit | Credit | Description
            return {
                accountId: cols[0], // In real app, would need to resolve segment string to ID
                debit: cols[1] || "0",
                credit: cols[2] || "0",
                description: cols[3] || "Imported Line"
            };
        });
        setParsedLines(lines);
        toast({ title: "Parsed", description: `${lines.length} lines ready for review.` });
    };

    const postMutation = useMutation({
        mutationFn: async () => {
            // Mock submission
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Journal Batch created from Wizard." });
            setParsedLines([]);
            setPasteData("");
        }
    });

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        Journal Wizard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        High-volume entry via Spreadsheet Copy/Paste.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleParse}>Parse Clipboard</Button>
                    <Button onClick={() => postMutation.mutate()} disabled={parsedLines.length === 0 || postMutation.isPending}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Batch
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Paste Data</CardTitle>
                        <CardDescription>Copy from Excel (Account | Debit | Credit | Description) and paste here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className="min-h-[300px] font-mono text-xs"
                            placeholder={`01-100-5000\t100.00\t0.00\tOffice Supplies\n01-000-1100\t0.00\t100.00\tCash Payment`}
                            value={pasteData}
                            onChange={(e) => setPasteData(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Review</CardTitle>
                        <CardDescription>
                            {parsedLines.length > 0 ? `${parsedLines.length} lines parsed.` : "Waiting for data..."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] overflow-auto border rounded-md p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead>Desc</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedLines.map((line, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono text-xs">{line.accountId}</TableCell>
                                        <TableCell className="text-right">{line.debit}</TableCell>
                                        <TableCell className="text-right">{line.credit}</TableCell>
                                        <TableCell className="text-xs truncate max-w-[100px]">{line.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
