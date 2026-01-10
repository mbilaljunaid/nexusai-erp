import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  Download
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { GLMetrics } from "./gl/components/GLMetrics";
import { JournalSideSheet } from "./gl/components/JournalSideSheet";
import { format } from "date-fns";

export default function JournalEntries() {
  const [, setLocation] = useLocation();
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: journals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/finance/gl/journals"],
  });

  const filteredJournals = journals.filter(j =>
    j.journalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (journal: any) => {
    setSelectedJournal(journal);
    setIsSideSheetOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Posted": return "default";
      case "Draft": return "secondary";
      case "Error": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Action-centric Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            Journal Batches
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create, monitor, and audit general ledger transactions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-600">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setLocation("/gl/journals/new")} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-6">
            <Plus className="h-4 w-4 mr-2" /> Create Journal
          </Button>
        </div>
      </div>

      {/* Premium Metrics Summary */}
      <GLMetrics />

      {/* Premium Table Card */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 py-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Recent Transactions</CardTitle>
              <CardDescription className="text-slate-400 mt-1">Audit-ready journal entries from all ledger sources.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search batches..."
                  className="pl-9 w-64 bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-full h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-400 hover:text-indigo-600">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="w-[100px] text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-6">ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Period</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Effective Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 animate-pulse font-medium italic">Synchronizing with Ledger...</TableCell>
                </TableRow>
              ) : filteredJournals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-medium italic">No journal batches found in this criteria.</TableCell>
                </TableRow>
              ) : (
                filteredJournals.map((journal) => (
                  <TableRow
                    key={journal.id}
                    className="group cursor-pointer border-b border-slate-50 hover:bg-indigo-50/30 transition-colors"
                    onClick={() => handleRowClick(journal)}
                  >
                    <TableCell className="font-mono text-xs text-slate-400 pl-6">#{journal.id.split('-')[0]}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{journal.journalName}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{journal.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-100 rounded-md font-bold text-[10px]">
                        {journal.periodId || 'JAN-26'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 font-medium">
                      {format(new Date(journal.accountingDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(journal.status)} className="px-2 py-0 text-[10px] font-bold tracking-tight">
                        {journal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Side Sheet for Viewing Journal */}
      <JournalSideSheet
        isOpen={isSideSheetOpen}
        onClose={() => setIsSideSheetOpen(false)}
        journal={selectedJournal}
      />
    </div>
  );
}
