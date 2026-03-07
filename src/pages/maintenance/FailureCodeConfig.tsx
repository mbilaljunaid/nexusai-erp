import { useState, useMemo} from"react";
import { useQuery, useMutation, useQueryClient} from"@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from"@/components/ui/card";
import { Button} from"@/components/ui/button";
import { FolderTree, AlertTriangle, Loader2} from"lucide-react";
import { useToast} from"@/hooks/use-toast";
import { InteractiveSpreadsheet} from"@/components/ui/InteractiveSpreadsheet";
import { StandardPage} from"@/components/layout/StandardPage";

export default function FailureCodeConfig() {
    const { toast} = useToast();
    const queryClient = useQueryClient();

    // Filters
    const [selectedType, setSelectedType] = useState<string>("PROBLEM");
    const [selectedParent, setSelectedParent] = useState<string | null>(null);

    // 1. Fetch Tree
    const { data: tree} = useQuery<any>({
        queryKey: ["/api/maintenance/failure-codes/tree"],
        queryFn: async () => {
            const res = await fetch("/api/maintenance/failure-codes/tree");
            if (!res.ok) return [];
            return res.json();
       }
   });

    // 2. Fetch Flat List (for table)
    const { data: list = [], isLoading} = useQuery<any>({
        queryKey: ["/api/maintenance/failure-codes", selectedType, selectedParent],
        queryFn: async () => {
            const res = await fetch(`/api/maintenance/failure-codes?type=${selectedType}${selectedParent ?`&parentId=${selectedParent}` :''}`);
            if (!res.ok) return [];
            return res.json();
       }
   });

    // 3. Update Mutation
    const updateMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Simulated bulk update
            return new Promise(resolve => setTimeout(resolve, 500));
       },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/failure-codes"]});
            toast({ title:"Codes Updated", description:"Failure codes have been successfully saved."});
       }
   });

    const columns = useMemo(() => [
        { id:"code", label:"Unique Code", type:"text" as const, required: true},
        { id:"name", label:"Display Name", type:"text" as const, required: true},
        { id:"description", label:"Description", type:"text" as const},
        { id:"active", label:"Active Status", type:"boolean" as const, defaultValue: true}
    ], []);

    return (
        <StandardPage
            title="Failure Analysis Codes"
            description="Standardize reliability reporting hierarchies: Problem > Cause > Remedy."
        >
            <div className="grid grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="col-span-1 border rounded-lg p-4 bg-slate-500/10 h-[600px] overflow-auto">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FolderTree className="h-4 w-4" /> Library Structure
                    </h3>
                    <div className="space-y-1">
                        <Button
                            variant={selectedType ==='PROBLEM' ?"secondary" :"ghost"}
                            className="w-full justify-start font-medium"
                            onClick={() => { setSelectedType("PROBLEM"); setSelectedParent(null);}}
                        >
                            Problems (Roots)
                        </Button>
                        {/* Mock Tree for Navigation */}
                        {tree?.map((problem: any) => (
                            <div key={problem.id} className="ml-2">
                                <Button
                                    variant={selectedType ==='CAUSE' && selectedParent === problem.id ?"secondary" :"ghost"}
                                    size="sm"
                                    className="w-full justify-start text-xs h-8 text-foreground/90"
                                    onClick={() => { setSelectedType("CAUSE"); setSelectedParent(problem.id);}}
                                >
                                    <AlertTriangle className="h-3 w-3 mr-2" /> {problem.name}
                                </Button>
                                {problem.children?.map((cause: any) => (
                                    <Button
                                        key={cause.id}
                                        variant={selectedType ==='REMEDY' && selectedParent === cause.id ?"secondary" :"ghost"}
                                        size="sm"
                                        className="w-full justify-start text-xs h-8 ml-4 text-muted-foreground"
                                        onClick={() => { setSelectedType("REMEDY"); setSelectedParent(cause.id);}}
                                    >
                                        ↳ {cause.name}
                                    </Button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main List Grid */}
                <Card className="col-span-3 border-t-4 border-t-blue-500 rounded-lg overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {selectedType} Codes
                            {selectedParent && <span className="text-muted-foreground font-normal text-sm ml-2 bg-muted px-2 py-0.5 rounded-full">(Filtered Context)</span>}
                        </CardTitle>
                        <CardDescription>Manage standardized taxonomy nodes for reliability tracking inline.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-card/50">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : (
                            <div className="h-[500px]">
                                <InteractiveSpreadsheet
                                    data={list}
                                    columns={columns}
                                    onSave={(data) => updateMutation.mutate(data.map(d => ({ ...d, type: selectedType, parentId: selectedParent})))}
                                    isSaving={updateMutation.isPending}
                                    containerHeight="100%"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
