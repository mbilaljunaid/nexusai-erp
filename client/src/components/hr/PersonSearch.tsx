import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, UserPlus, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HireWorkerWizard } from "./HireWorkerWizard";
import { EmploymentProfile } from "./EmploymentProfile";
import { TerminateWorkerDialog } from "./TerminateWorkerDialog";
import { AuditLogView } from "./AuditLogView";
import { DataQualityDashboard } from "./DataQualityDashboard";
import { FileText, BarChart3 } from "lucide-react";

export function PersonSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isHireOpen, setIsHireOpen] = useState(false);
    const [isTerminateOpen, setIsTerminateOpen] = useState(false);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: result, isLoading } = useQuery({
        queryKey: ["hr-persons-search", debouncedSearch, page, limit, effectiveDate.toISOString().split('T')[0]],
        queryFn: () => api.hr.persons.search(debouncedSearch, page, limit, effectiveDate.toISOString().split('T')[0]),
        placeholderData: (prev) => prev
    });

    const persons = result?.data || [];
    const totalCount = result?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const columns = [
        { key: "personNumber", header: "Person Number", sortable: true },
        {
            key: "lastName",
            header: "Name",
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-primary cursor-pointer hover:underline">{row.lastName}, {row.firstName}</span>
                    <span className="text-xs text-muted-foreground">{row.email}</span>
                </div>
            )
        },
        { key: "department", header: "Department", sortable: true },
        { key: "job", header: "Job", sortable: true },
        {
            key: "actions",
            header: "",
            render: (_: any, row: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPersonId(row.id)}>
                        View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                        setSelectedPersonId(row.id);
                        setIsTerminateOpen(true);
                    }}>
                        Terminate
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Person Management</h2>
                    <p className="text-muted-foreground">Search and manage person records.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md border text-sm">
                        <span className="pl-2 text-muted-foreground">As Of:</span>
                        <input
                            type="date"
                            aria-label="As Of Date"
                            className="bg-transparent border-none p-1 focus:ring-0 text-sm"
                            value={effectiveDate.toISOString().split('T')[0]}
                            onChange={(e) => setEffectiveDate(new Date(e.target.value))}
                        />
                    </div>
                    <Button onClick={() => setIsHireOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Hire Worker
                    </Button>
                </div>
            </div>

            <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
                <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                    <AuditLogView />
                </DialogContent>
            </Dialog>

            <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
                <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                    <DataQualityDashboard />
                </DialogContent>
            </Dialog>

            <Dialog open={isHireOpen} onOpenChange={setIsHireOpen}>
                <DialogContent className="max-w-3xl">
                    <HireWorkerWizard onClose={() => setIsHireOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedPersonId && !isTerminateOpen} onOpenChange={(open) => !open && setSelectedPersonId(null)}>
                <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                    {selectedPersonId && <EmploymentProfile personId={selectedPersonId} />}
                </DialogContent>
            </Dialog>

            {selectedPersonId && (
                <TerminateWorkerDialog
                    personId={selectedPersonId}
                    isOpen={isTerminateOpen}
                    onClose={() => { setIsTerminateOpen(false); setSelectedPersonId(null); }}
                />
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Search Criteria</CardTitle>
                    <CardDescription>Find people by name, number, or email.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or ID..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Advanced
                        </Button>
                        <Button variant="ghost" onClick={() => setIsAuditOpen(true)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Audit Log
                        </Button>
                        <Button variant="ghost" onClick={() => setIsAnalyticsOpen(true)}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        data={persons}
                        columns={columns}
                        isLoading={isLoading}
                        manualPagination={true}
                        pageCount={totalPages}
                        rowCount={totalCount}
                        pageIndex={page}
                        pageSize={limit}
                        onPageChange={setPage}
                        onPageSizeChange={setLimit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
