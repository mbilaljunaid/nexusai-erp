import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface EliminationJournal {
    id: string;
    journalNumber: string;
    runId: string;
    description: string;
    totalDebit: number;
    totalCredit: number;
    status: "Posted" | "Draft";
    appliedRule: string;
    lines: JournalLine[];
}

interface JournalLine {
    account: string;
    debit: number;
    credit: number;
    description: string;
}

export default function EliminationJournalReview() {
    // Fetch elimination journals
    const { data: journals = [] } = useQuery<EliminationJournal[]>({
        queryKey: ["elimination-journals"],
        queryFn: async () => {
            // Mock - replace with API
            return [
                {
                    id: "1",
                    journalNumber: "ELIM-20260211-001",
                    runId: "RUN-123",
                    description: "Auto-Elimination: IC Payables (Net $1,000,000)",
                    totalDebit: 1000000,
                    totalCredit: 1000000,
                    status: "Posted",
                    appliedRule: "IC Payables Elimination",
                    lines: [
                        { account: "200-00-2000 (IC Payables)", debit: 1000000, credit: 0, description: "Elimination of IC Payables Elimination" },
                        { account: "100-00-1000 (IC Receivables)", debit: 0, credit: 1000000, description: "Offset for IC Payables Elimination" }
                    ]
                }
            ];
        }
    });

    const totalPosted = journals.filter(j => j.status === "Posted").length;
    const totalDraft = journals.filter(j => j.status === "Draft").length;

    return (
        <StandardPage
            title="Elimination Journal Review"
            description="Review auto-generated elimination journals from consolidation runs."
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation", href: "/finance/gl/consolidation" },
                { label: "Journals" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Journals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{journals.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Posted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{totalPosted}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800uppercase">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{totalDraft}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Journal List */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Elimination Journals
                        </CardTitle>
                        <CardDescription>Auto-generated journals from consolidation runs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {journals.map((journal) => (
                                <Card key={journal.id} className="bg-muted/30">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm mb-1">{journal.journalNumber}</CardTitle>
                                                <CardDescription className="text-xs">{journal.description}</CardDescription>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">Run: {journal.runId}</Badge>
                                                    <Badge variant="secondary" className="text-xs">{journal.appliedRule}</Badge>
                                                    <StatusBadge status={journal.status} />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">Amount</div>
                                                <div className="text-lg font-bold">${journal.totalDebit.toFixed(0)}</div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Account</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead className="text-right">Debit</TableHead>
                                                    <TableHead className="text-right">Credit</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {journal.lines.map((line, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-mono text-xs">{line.account}</TableCell>
                                                        <TableCell className="text-xs">{line.description}</TableCell>
                                                        <TableCell className="text-right font-mono">{line.debit > 0 ? `$${line.debit.toFixed(0)}` : "—"}</TableCell>
                                                        <TableCell className="text-right font-mono">{line.credit > 0 ? `$${line.credit.toFixed(0)}` : "—"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
