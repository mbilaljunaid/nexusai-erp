
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, CheckCircle, XCircle, Clock, FileCode, Globe } from "lucide-react";

export function PaymentTransmissionHub() {
    // Mock data for Phase 5 visualization
    const transmissionMessages = [
        { id: 'msg-1', type: 'pain.001', ref: 'NEX-PAY-001', status: 'ACCEPTED', timestamp: '2026-01-15T10:00:00Z', bank: 'J.P. Morgan' },
        { id: 'msg-2', type: 'pain.001', ref: 'NEX-PAY-002', status: 'SENT', timestamp: '2026-01-16T08:30:00Z', bank: 'HSBC' },
        { id: 'msg-3', type: 'pain.001', ref: 'NEX-PAY-003', status: 'REJECTED', timestamp: '2026-01-16T09:15:00Z', bank: 'Deutsche Bank', error: 'Invalid BIC Code' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-500" />
                <div>
                    <h2 className="text-xl font-bold">Payment Transmission Hub</h2>
                    <p className="text-sm text-muted-foreground">Global SWIFT gpi & ISO 20022 message orchestration.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider text-muted-foreground mr-2">ACK/Accepted</p>
                                <h3 className="text-2xl font-bold mt-1">1,240</h3>
                            </div>
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider text-muted-foreground mr-2">In Transit</p>
                                <h3 className="text-2xl font-bold mt-1">12</h3>
                            </div>
                            <Clock className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-destructive uppercase tracking-wider text-muted-foreground mr-2">Rejected</p>
                                <h3 className="text-2xl font-bold mt-1">1</h3>
                            </div>
                            <XCircle className="w-8 h-8 text-destructive" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Real-time Message Ledger</CardTitle>
                    <Button variant="outline" size="sm">
                        <FileCode className="w-4 h-4 mr-2" />
                        Download logs
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transmissionMessages.map((msg) => (
                                <TableRow key={msg.id}>
                                    <TableCell className="font-medium">{msg.ref}</TableCell>
                                    <TableCell className="text-xs font-mono">{msg.type}</TableCell>
                                    <TableCell className="text-sm">{msg.bank}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            msg.status === 'ACCEPTED' ? 'success' :
                                                msg.status === 'REJECTED' ? 'destructive' : 'secondary'
                                        }>
                                            {msg.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">View XML</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* SWIFT gpi Tracking Simulation */}
            <Card className="bg-slate-900 text-slate-100 border-none">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-400" />
                        Active SWIFT gpi Tracking: NEX-PAY-002
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative pt-10 pb-4">
                        <div className="absolute top-0 left-0 w-full flex justify-between px-2">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">1</div>
                                <span className="text-[10px] mt-2">Sent</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">2</div>
                                <span className="text-[10px] mt-2">HSBC (UK)</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">3</div>
                                <span className="text-[10px] mt-2">Int. Bank (DE)</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">4</div>
                                <span className="text-[10px] mt-2">Beneficiary</span>
                            </div>
                        </div>
                        <div className="h-0.5 w-full bg-slate-700 mt-3 relative">
                            <div className="h-full bg-blue-500 w-[45%]" />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 italic text-center">
                        Currently at HSM UK. Estimated time to final credit: 2h 15m
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
