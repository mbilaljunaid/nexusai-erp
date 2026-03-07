import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { qualityService, type InspectionItem } from "@/services/maintenance.service";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    ClipboardCheck,
    Camera,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Plus,
    FileText,
    ChevronRight,
    Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface InspectionTemplate {
    id: string;
    name: string;
    category: string;
    itemCount: number;
    estimatedDuration: number; // minutes
    requiresPhotos: boolean;
    requiresSignature: boolean;
}

interface Inspection {
    id: string;
    templateId: string;
    templateName: string;
    workOrderId?: string;
    assetId?: string;
    assetName?: string;
    status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    inspectorId: string;
    inspectorName: string;
    scheduledDate: string;
    completedDate?: string;
    overallResult?: "PASS" | "FAIL";
    defectCount?: number;
}

interface InspectionResult {
    itemId: string;
    value: any;
    passed: boolean;
    notes?: string;
    photoUrls?: string[];
}

export function InspectionWorkflow() {
    const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
    const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
    const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
    const [results, setResults] = useState<InspectionResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
        loadInspections();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALL - Get inspection templates from service layer
            const apiTemplates = await qualityService.getTemplates();

            // Map API response to component format
            // API provides: id, name, category, itemCount
            // Component needs: + estimatedDuration, requiresPhotos, requiresSignature
            const mappedTemplates: InspectionTemplate[] = apiTemplates.map(t => ({
                ...t,
                estimatedDuration: 30, // Default 30 mins, can be enhanced with backend data later
                requiresPhotos: t.category === 'SAFETY' || t.category === 'COMPLIANCE', // Photos for safety/compliance
                requiresSignature: true // All inspections require signature
            }));

            setTemplates(mappedTemplates);
        } catch (error) {
            setTemplates([]); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const loadInspections = async () => {
        try {
            // ✅ LIVE API CALL - Get inspection history from service layer
            const apiInspections = await qualityService.getInspections();

            // Map API response to component format (add missing fields)
            const mappedInspections = apiInspections.map((inspection: any) => ({
                ...inspection,
                inspectorId: inspection.inspector?.id || inspection.createdBy || "unknown",
                inspectorName: inspection.inspector?.name || "Unknown Inspector",
                scheduledDate: inspection.scheduledDate || inspection.createdAt || new Date().toISOString()
            }));

            setInspections(mappedInspections);
        } catch (error) {
            setInspections([]); // Fallback
        }
    };

    const handleStartInspection = async (template: InspectionTemplate) => {
        try {
            const items = await qualityService.getTemplateItems(template.id);
            setInspectionItems(items);
        } catch (e) {
            setInspectionItems([]);
        }
        setSelectedTemplate(template);

        // Create new inspection
        const newInspection: Inspection = {
            id: `insp-${Date.now()}`,
            templateId: template.id,
            templateName: template.name,
            status: "IN_PROGRESS",
            inspectorId: "current-user",
            inspectorName: "Current User",
            scheduledDate: new Date().toISOString()
        };
        setCurrentInspection(newInspection);
        setResults([]);
    };

    const handleRecordResult = (itemId: string, value: any, passed: boolean) => {
        setResults(prev => {
            const existing = prev.find(r => r.itemId === itemId);
            if (existing) {
                return prev.map(r => r.itemId === itemId ? { ...r, value, passed } : r);
            }
            return [...prev, { itemId, value, passed }];
        });
    };

    const handleSubmitInspection = async () => {
        if (!currentInspection) return;

        try {
            // Calculate overall result
            const failedItems = results.filter(r => !r.passed);
            const overallResult = failedItems.length === 0 ? "PASS" : "FAIL";

            // ✅ LIVE API CALL - Submit inspection results
            // Note: submitInspection creates a new inspection record, not updates an existing one
            // This works for completing an in-progress inspection
            await qualityService.submitInspection({
                assetId: currentInspection.assetId || "",
                templateId: currentInspection.templateId,
                woId: currentInspection.workOrderId,
                results: results.map(r => ({
                    itemId: r.itemId,
                    value: r.value,
                    passed: r.passed,
                    notes: r.notes
                }))
            });

            // TODO: Show success toast

            // Reset
            setCurrentInspection(null);
            setSelectedTemplate(null);
            setInspectionItems([]);
            setResults([]);
            await loadInspections();
        } catch (error) {
            // TODO: Show error toast
        }
    };

    const getStatusConfig = (status: Inspection["status"]) => {
        switch (status) {
            case "COMPLETED":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2 };
            case "FAILED":
                return { color: "bg-red-100 text-red-800", icon: XCircle };
            case "IN_PROGRESS":
                return { color: "bg-blue-100 text-blue-800", icon: ClipboardCheck };
            default:
                return { color: "bg-muted text-foreground", icon: FileText };
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Quality Inspections</h1>
                <p className="text-muted-foreground">Manage inspection templates and perform quality checks</p>
            </div>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList>
                    <TabsTrigger value="templates">Inspection Templates</TabsTrigger>
                    <TabsTrigger value="active">Active Inspection</TabsTrigger>
                    <TabsTrigger value="history">Inspection History</TabsTrigger>
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(template => (
                            <Card key={template.id} className="hover:border-primary transition-all cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                                                <p className="text-sm text-muted-foreground">{template.category}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Items:</span>
                                                <div className="font-medium">{template.itemCount}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Duration:</span>
                                                <div className="font-medium">{template.estimatedDuration} min</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {template.requiresPhotos && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Camera className="h-3 w-3 mr-1" />
                                                    Photos
                                                </Badge>
                                            )}
                                            {template.requiresSignature && (
                                                <Badge variant="outline" className="text-xs">
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    Signature
                                                </Badge>
                                            )}
                                        </div>

                                        <Button
                                            onClick={() => handleStartInspection(template)}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Start Inspection
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Active Inspection Tab */}
                <TabsContent value="active">
                    {currentInspection ? (
                        <div className="space-y-4">
                            <Card className="border-2 border-primary">
                                <CardHeader className="bg-primary/5">
                                    <CardTitle className="text-base">
                                        {selectedTemplate?.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {inspectionItems.map((item, index) => {
                                            const result = results.find(r => r.itemId === item.id);

                                            return (
                                                <div key={item.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                                                            {item.sequence}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium mb-1">
                                                                {item.description}
                                                                {item.required && <span className="text-red-600 ml-1">*</span>}
                                                            </div>

                                                            {item.type === "PASS_FAIL" && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <Button
                                                                        variant={result?.passed === true ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => handleRecordResult(item.id, "PASS", true)}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                        Pass
                                                                    </Button>
                                                                    <Button
                                                                        variant={result?.passed === false ? "destructive" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => handleRecordResult(item.id, "FAIL", false)}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Fail
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {item.type === "YES_NO" && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <Button
                                                                        variant={result?.value === "YES" ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => handleRecordResult(item.id, "YES", true)}
                                                                    >
                                                                        Yes
                                                                    </Button>
                                                                    <Button
                                                                        variant={result?.value === "NO" ? "outline" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => handleRecordResult(item.id, "NO", false)}
                                                                    >
                                                                        No
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {item.type === "NUMERIC" && (
                                                                <div className="mt-2">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder={`Enter value ${item.acceptableLimits ? `(${item.acceptableLimits.min}-${item.acceptableLimits.max})` : ''}`}
                                                                        value={result?.value || ""}
                                                                        onChange={(e) => {
                                                                            const value = Number(e.target.value);
                                                                            const passed = item.acceptableLimits
                                                                                ? value >= (item.acceptableLimits.min || 0) && value <= (item.acceptableLimits.max || Infinity)
                                                                                : true;
                                                                            handleRecordResult(item.id, value, passed);
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {item.type === "TEXT" && (
                                                                <div className="mt-2">
                                                                    <Textarea
                                                                        placeholder="Enter observations..."
                                                                        value={result?.value || ""}
                                                                        onChange={(e) => handleRecordResult(item.id, e.target.value, true)}
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                            )}

                                                            {result && !result.passed && (
                                                                <div className="mt-2 p-2 bg-red-500/10 rounded flex items-start gap-2">
                                                                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                                                    <div className="flex-1">
                                                                        <div className="text-sm font-medium text-red-900 dark:text-red-200">Defect Noted</div>
                                                                        <Textarea
                                                                            placeholder="Describe the issue..."
                                                                            className="mt-1 text-sm"
                                                                            rows={2}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {selectedTemplate?.requiresPhotos && (
                                                        <Button variant="outline" size="sm" className="w-full mt-2">
                                                            <Camera className="h-4 w-4 mr-2" />
                                                            Add Photo
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setCurrentInspection(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                onClick={handleSubmitInspection}
                                                disabled={results.length < inspectionItems.filter(i => i.required).length}
                                            >
                                                Submit Inspection
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="pt-20 pb-20 text-center text-muted-foreground">
                                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <div>No active inspection</div>
                                <div className="text-sm">Start an inspection from the Templates tab</div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    {inspections.map(insp => {
                        const statusConfig = getStatusConfig(insp.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <Card key={insp.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg">{insp.templateName}</h3>
                                                <Badge variant="outline" className={statusConfig.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {insp.status}
                                                </Badge>
                                                {insp.overallResult && (
                                                    <Badge
                                                        variant="outline"
                                                        className={insp.overallResult === "PASS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                                    >
                                                        {insp.overallResult}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="text-sm text-muted-foreground mb-3">
                                                {insp.assetName && `Asset: ${insp.assetName} • `}
                                                Inspector: {insp.inspectorName}
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Scheduled:</span>
                                                    <div className="font-medium">{format(new Date(insp.scheduledDate), "MMM dd, yyyy HH:mm")}</div>
                                                </div>
                                                {insp.completedDate && (
                                                    <div>
                                                        <span className="text-muted-foreground">Completed:</span>
                                                        <div className="font-medium">{format(new Date(insp.completedDate), "MMM dd, yyyy HH:mm")}</div>
                                                    </div>
                                                )}
                                                {insp.defectCount !== undefined && (
                                                    <div>
                                                        <span className="text-muted-foreground">Defects:</span>
                                                        <div className={cn("font-medium", insp.defectCount > 0 ? "text-red-600" : "text-green-600")}>
                                                            {insp.defectCount}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" aria-label="Next">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default InspectionWorkflow;
