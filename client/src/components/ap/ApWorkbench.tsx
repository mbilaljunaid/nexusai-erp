
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    FileText,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Link as LinkIcon,
    RefreshCw
} from "lucide-react";
import { ApInvoiceList } from "./ApInvoiceList";
import { useToast } from "@/hooks/use-toast";

export default function ApWorkbench() {
    const [selectedTab, setSelectedTab] = useState("all");
    const { toast } = useToast();

    return (
        <div className="space-y-6">
            <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0 pt-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">Invoice Workbench</CardTitle>
                            <CardDescription>
                                Centralized hub for invoice matching, validation, and hold resolution.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="h-4 w-4" /> Filter
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Search className="h-4 w-4" /> Search
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="all">All Invoices</TabsTrigger>
                            <TabsTrigger value="matching">Matching Required</TabsTrigger>
                            <TabsTrigger value="validation">Needs Validation</TabsTrigger>
                            <TabsTrigger value="holds">On Hold</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            <ApInvoiceList />
                        </TabsContent>

                        <TabsContent value="matching">
                            <FilteredInvoiceList filter="matching" />
                        </TabsContent>

                        <TabsContent value="validation">
                            <FilteredInvoiceList filter="validation" />
                        </TabsContent>

                        <TabsContent value="holds">
                            <FilteredInvoiceList filter="holds" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function FilteredInvoiceList({ filter }: { filter: string }) {
    // This will be a specialized list view eventually
    // For now, it's a placeholder showing how to reuse ApInvoiceList with props if we add them
    return (
        <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/30">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin-slow" />
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                Advanced filtering for {filter} is being implemented in the next sub-chunk.
                Use the "All Invoices" tab to manage your entries.
            </p>
        </div>
    );
}
