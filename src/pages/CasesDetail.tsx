
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    Plus, Search, Filter,
    MoreHorizontal, FileText,
    MessageSquare, LayoutGrid, List as ListIcon,
    AlertCircle, CheckCircle2, Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { CaseForm } from "@/components/forms/CaseForm";
import { CaseComments } from "@/components/forms/CaseComments";
import type { Case } from "@shared/schema";

export default function CasesDetail() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Fetch Cases
    const { data: cases = [], isLoading } = useQuery<Case[]>({
        queryKey: ['/api/crm/cases'],
    });

    const filteredCases = cases.filter(c =>
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'Working': return 'bg-yellow-100 text-yellow-800';
            case 'Escalated': return 'bg-red-100 text-red-800';
            case 'Closed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityIcon = (priority: string | null) => {
        switch (priority) {
            case 'High': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'Low': return <Clock className="h-4 w-4 text-green-500" />;
            default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const openNewCase = () => {
        setSelectedCase(null);
        setIsSheetOpen(true);
    };

    const openEditCase = (c: Case) => {
        setSelectedCase(c);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Service Cases</h2>
                    <p className="text-muted-foreground">Manage customer support tickets and inquiries.</p>
                </div>
                <div className="flex gap-2">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button onClick={openNewCase}>
                                <Plus className="mr-2 h-4 w-4" /> New Case
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-2xl overflow-y-auto w-[600px]">
                            <SheetHeader>
                                <SheetTitle>{selectedCase ? `Case ${selectedCase.id.slice(0, 8)}` : "Create New Case"}</SheetTitle>
                                <SheetDescription>
                                    {selectedCase ? "View details, update status, and add comments." : "Fill in the details to create a new support ticket."}
                                </SheetDescription>
                            </SheetHeader>

                            {selectedCase ? (
                                <Tabs defaultValue="details" className="mt-6">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="comments">Comments</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="details" className="mt-4">
                                        <CaseForm
                                            caseId={selectedCase.id}
                                            defaultValues={selectedCase as any}
                                            onSuccess={() => setIsSheetOpen(false)}
                                        />
                                    </TabsContent>
                                    <TabsContent value="comments" className="mt-4">
                                        <CaseComments caseId={selectedCase.id} />
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <div className="mt-6">
                                    <CaseForm onSuccess={() => setIsSheetOpen(false)} />
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search cases..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
                <div className="border rounded-md flex p-1 bg-muted/20">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        className="px-2"
                        onClick={() => setViewMode("list")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        className="px-2"
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Cases List */}
            {isLoading ? (
                <div>Loading cases...</div>
            ) : filteredCases.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No cases found.</div>
            ) : viewMode === "list" ? (
                <div className="border rounded-md">
                    <div className="grid grid-cols-12 p-3 bg-muted font-medium text-sm">
                        <div className="col-span-4">Subject</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-2">Origin</div>
                        <div className="col-span-2">Created</div>
                    </div>
                    {filteredCases.map(c => (
                        <div key={c.id} className="grid grid-cols-12 p-3 border-t text-sm items-center hover:bg-muted/50 cursor-pointer" onClick={() => openEditCase(c)}>
                            <div className="col-span-4 font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {c.subject}
                            </div>
                            <div className="col-span-2">
                                <Badge variant="outline" className={getStatusColor(c.status)}>{c.status}</Badge>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                {getPriorityIcon(c.priority)}
                                {c.priority}
                            </div>
                            <div className="col-span-2">{c.origin}</div>
                            <div className="col-span-2 text-muted-foreground">
                                {new Date(c.createdAt!).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCases.map(c => (
                        <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEditCase(c)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className={getStatusColor(c.status)}>{c.status}</Badge>
                                    <div className="flex gap-1">{getPriorityIcon(c.priority)}</div>
                                </div>
                                <CardTitle className="text-base line-clamp-1">{c.subject}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                    {c.description || "No description provided."}
                                </p>
                                <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                                    <span>{c.origin}</span>
                                    <span>{new Date(c.createdAt!).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
