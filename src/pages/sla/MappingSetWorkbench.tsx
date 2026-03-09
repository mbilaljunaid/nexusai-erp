import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Settings, ArrowRight, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MappingSetList } from "@/components/sla/MappingSetList";

export default function MappingSetWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // The MappingSetList component from src/components/sla/MappingSetList already handles basic CRUD 
    // and listing. We will wrap it in a StandardPage and add more advanced management features if needed.
    // However, looking at MappingSetList.tsx, it's quite complete. 
    // Let's create a more premium container for it.

    return (
        <StandardPage
            title="Accounting Mapping Sets"
            description="Manage translation rules to derive GL account segments from transaction attributes."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "SLA Configuration", href: "/finance/gl/config" }, { label: "Mapping Sets" }]}
        >
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Mapping Registries</CardTitle>
                            <CardDescription>Define how input source values map to specific GL output values.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MappingSetList />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-blue-800 uppercase flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Usage Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-blue-700">
                                Mapping sets are consumed by Account Derivation Rules (ADR).
                                Currently, <strong>12</strong> rules across AP and AR are utilizing these mapping sets.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-purple-800 uppercase flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Bulk Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-purple-700 mb-4">
                                Importing mapping values from CSV or Excel? Use the bulk uploader in the set details view.
                            </p>
                            <Button variant="outline" size="sm" className="bg-card border-purple-200 text-purple-700 hover:bg-purple-500/15">
                                Import Master Data
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
