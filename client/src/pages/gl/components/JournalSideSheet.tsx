import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    History,
    AlertCircle,
    ExternalLink,
    Clock,
    User,
    Shield,
    Database
} from "lucide-react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface JournalSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
    journal: any; // Using any for now to simplify, ideally GlJournal & { lines: GlJournalLine[] }
}

export function JournalSideSheet({ isOpen, onClose, journal }: JournalSideSheetProps) {
    if (!journal) return null;

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Posted": return "default"; // emerald in custom theme
            case "Error": return "destructive";
            case "Draft": return "secondary";
            default: return "outline";
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl p-0 border-l border-slate-200">
                <div className="flex flex-col h-full bg-slate-50/30">
                    {/* Premium Header */}
                    <div className="p-6 bg-white border-b border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{journal.journalName}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={getStatusVariant(journal.status)} className="rounded-full px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                                            {journal.status}
                                        </Badge>
                                        <span className="text-xs text-slate-400 font-medium">#{journal.id.split('-')[0]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Effective Date
                                </p>
                                <p className="text-sm font-semibold text-slate-700">
                                    {format(new Date(journal.accountingDate), "PPP")}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Database className="h-3 w-3" /> Ledger
                                </p>
                                <p className="text-sm font-semibold text-slate-700">{journal.ledgerId}</p>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="lines" className="flex-1 flex flex-col">
                        <div className="px-6 bg-white border-b border-slate-100">
                            <TabsList className="bg-transparent h-12 w-full justify-start gap-8 rounded-none">
                                <TabsTrigger value="lines" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none text-slate-500 font-medium tracking-tight">
                                    Journal Lines
                                </TabsTrigger>
                                <TabsTrigger value="audit" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none text-slate-500 font-medium tracking-tight">
                                    Audit Trail
                                </TabsTrigger>
                                <TabsTrigger value="errors" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none text-slate-500 font-medium tracking-tight flex gap-2">
                                    Validations {journal.status === "Error" && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <TabsContent value="lines" className="m-0 space-y-4">
                                <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="border-b border-slate-100">
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Debit</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Credit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {journal.lines?.map((line: any, idx: number) => (
                                                <TableRow key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="font-medium text-slate-700 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{line.accountCode || 'MISSING_CODE'}</span>
                                                            <span className="text-[10px] text-slate-400 font-normal">{line.description}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-slate-900">{line.enteredDr > 0 ? line.enteredDr.toLocaleString() : '-'}</TableCell>
                                                    <TableCell className="text-right font-semibold text-slate-900">{line.enteredCr > 0 ? line.enteredCr.toLocaleString() : '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            <TabsContent value="audit" className="m-0 space-y-6">
                                <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1.5 p-1 bg-white border border-emerald-100 rounded-full shadow-sm">
                                            <Shield className="h-3 w-3 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-slate-700">Journal Posted Digitally</p>
                                                <span className="text-[10px] text-slate-400">2 mins ago</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <User className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-medium text-slate-500">mbjunaid@example.com</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1.5 p-1 bg-white border border-indigo-100 rounded-full shadow-sm">
                                            <AlertCircle className="h-3 w-3 text-indigo-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-slate-700">Created from Manual Batch</p>
                                                <span className="text-[10px] text-slate-400">1 hour ago</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Database className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-medium text-slate-500">Source: ERP_WEB_PORTAL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="errors" className="m-0">
                                {journal.status === "Error" ? (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-900 underline decoration-red-200">Processing Failure (CVR_02)</h4>
                                            <p className="text-[10px] text-red-700/80 mt-1 leading-relaxed">
                                                The account combination [01-100-5000] violates the cross-ordination rule for departmental cost centers. Inter-departmental postings are restricted in the current fiscal period.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                                        <div className="p-4 bg-emerald-50 rounded-full">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">Validation Perfect</h4>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Post integrity verified</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
