import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pmService, type PMDefinition as PMDefinitionType } from "@/services/maintenance.service";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Calendar as CalendarIcon,
    Clock,
    Play,
    Settings,
    AlertTriangle,
    CheckCircle2,
    Filter,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { Label } from "@/components/ui/label";

// Using PMDefinition type from service layer (imported as PMDefinitionType above)

interface GeneratedWorkOrder {
    pmDefinitionId: string;
    pmName: string;
    scheduledDate: string;
    assetName: string;
}

export function PMScheduler() {
    const [definitions, setDefinitions] = useState<PMDefinitionType[]>([]);
    const [filteredDefs, setFilteredDefs] = useState<PMDefinitionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

    // Generation settings
    const [generateDate, setGenerateDate] = useState<Date>(new Date());
    const [generatePeriod, setGeneratePeriod] = useState<number>(30); // days
    const [selectedDefs, setSelectedDefs] = useState<string[]>([]);
    const [previewWOs, setPreviewWOs] = useState<GeneratedWorkOrder[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadPMDefinitions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [definitions, searchTerm, statusFilter, frequencyFilter]);

    const loadPMDefinitions = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALL - Get PM definitions from service layer
            const apiDefs = await pmService.getPMDefinitions();
            setDefinitions(apiDefs);
        } catch (error) {
            setDefinitions([]); // Fallback to empty array
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...definitions];

        // Search
        if (searchTerm) {
            filtered = filtered.filter(d =>
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.assetName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status
        if (statusFilter !== "all") {
            filtered = filtered.filter(d => d.status === statusFilter);
        }

        // Frequency
        if (frequencyFilter !== "all") {
            filtered = filtered.filter(d => d.frequency === frequencyFilter);
        }

        setFilteredDefs(filtered);
    };

    const handleGeneratePreview = () => {
        const endDate = addDays(generateDate, generatePeriod);
        const generated: GeneratedWorkOrder[] = [];

        // Select which definitions to generate from
        const defsToGenerate = selectedDefs.length > 0
            ? definitions.filter(d => selectedDefs.includes(d.id))
            : definitions.filter(d => d.status === "ACTIVE");

        defsToGenerate.forEach(def => {
            const nextDueDate = new Date(def.nextDue);

            // If next due is within the generation period, create WO
            if (isAfter(nextDueDate, generateDate) && isBefore(nextDueDate, endDate)) {
                generated.push({
                    pmDefinitionId: def.id,
                    pmName: def.name,
                    scheduledDate: def.nextDue,
                    assetName: def.assetName || ""
                });
            }
        });

        setPreviewWOs(generated);
        setShowPreview(true);
    };

    const handleGeneratePMs = async () => {
        setGenerating(true);
        try {
            // ✅ LIVE API CALL - Generate PM work orders
            const defsToGenerate = selectedDefs.length > 0 ? selectedDefs : definitions.filter(d => d.status === "ACTIVE").map(d => d.id);
            const endDate = addDays(generateDate, generatePeriod);

            const result = await pmService.generatePMs({
                definitionIds: defsToGenerate,
                startDate: format(generateDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd")
            });

            // TODO: Show success toast with count

            setShowPreview(false);
            setSelectedDefs([]);
            await loadPMDefinitions(); // Refresh
        } catch (error) {
            // TODO: Show error toast
        } finally {
            setGenerating(false);
        }
    };

    const toggleSelection = (defId: string) => {
        setSelectedDefs(prev =>
            prev.includes(defId)
                ? prev.filter(id => id !== defId)
                : [...prev, defId]
        );
    };

    const frequencyConfig = {
        DAILY: { label: "Daily", color: "bg-blue-100 text-blue-800" },
        WEEKLY: { label: "Weekly", color: "bg-green-100 text-green-800" },
        MONTHLY: { label: "Monthly", color: "bg-purple-100 text-purple-800" },
        QUARTERLY: { label: "Quarterly", color: "bg-orange-100 text-orange-800" },
        ANNUALLY: { label: "Annually", color: "bg-red-100 text-red-800" }
    };

    const getDueStatus = (nextDue: string) => {
        const dueDate = new Date(nextDue);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) return { label: "Overdue", color: "text-red-600", icon: AlertTriangle };
        if (daysUntilDue <= 7) return { label: "Due Soon", color: "text-orange-600", icon: Clock };
        return { label: "Scheduled", color: "text-green-600", icon: CheckCircle2 };
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">PM Scheduler</h1>
                    <p className="text-muted-foreground">Generate and manage preventive maintenance work orders</p>
                </div>
                <Button onClick={loadPMDefinitions} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Generation Section */}
            <Card className="border-2 border-primary/20">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Generate PM Work Orders
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(generateDate, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar
                                        mode="single"
                                        selected={generateDate}
                                        onSelect={(date) => date && setGenerateDate(date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">Period (Days)</Label>
                            <Input
                                type="number"
                                value={generatePeriod}
                                onChange={(e) => setGeneratePeriod(Number(e.target.value))}
                                min={1}
                                max={365}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleGeneratePreview}
                                className="w-full"
                                variant="default"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Preview Generation
                            </Button>
                        </div>
                    </div>

                    {showPreview && (
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm text-muted-foreground">
                                    {previewWOs.length} work orders will be generated
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPreview(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleGeneratePMs}
                                        disabled={generating || previewWOs.length === 0}
                                    >
                                        {generating ? "Generating..." : `Generate ${previewWOs.length} WOs`}
                                    </Button>
                                </div>
                            </div>

                            {previewWOs.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {previewWOs.map((wo, index) => (
                                        <div key={index} className="text-sm p-2 bg-muted rounded flex justify-between">
                                            <span>{wo.pmName} - {wo.assetName}</span>
                                            <span className="text-muted-foreground">
                                                {format(new Date(wo.scheduledDate), "MMM dd, yyyy")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        PM Definitions ({filteredDefs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Search PM or asset..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Frequencies</SelectItem>
                                <SelectItem value="DAILY">Daily</SelectItem>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                <SelectItem value="ANNUALLY">Annually</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* PM Definitions List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading PM definitions...</div>
                ) : filteredDefs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No PM definitions found</div>
                ) : (
                    filteredDefs.map(def => {
                        const dueStatus = getDueStatus(def.nextDue);
                        const StatusIcon = dueStatus.icon;
                        const freqConfig = frequencyConfig[def.frequency];
                        const isSelected = selectedDefs.includes(def.id);

                        return (
                            <Card
                                key={def.id}
                                className={cn(
                                    "border-2 cursor-pointer transition-all",
                                    isSelected && "border-primary bg-primary/5"
                                )}
                                onClick={() => toggleSelection(def.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg">{def.name}</h3>
                                                <Badge
                                                    variant="outline"
                                                    className={def.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                                >
                                                    {def.status}
                                                </Badge>
                                                <Badge variant="outline" className={freqConfig.color}>
                                                    {freqConfig.label}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-muted-foreground mb-3">
                                                Asset: {def.assetName} • Every {def.frequencyValue} {def.frequency.toLowerCase()}
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Last Generated:</span>
                                                    <div className="font-medium">
                                                        {def.lastGenerated ? format(new Date(def.lastGenerated), "MMM dd, yyyy") : "Never"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Next Due:</span>
                                                    <div className={cn("font-medium flex items-center gap-1", dueStatus.color)}>
                                                        <StatusIcon className="h-4 w-4" />
                                                        {format(new Date(def.nextDue), "MMM dd, yyyy")}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <div className="font-medium">{dueStatus.label}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" aria-label="Settings">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default PMScheduler;
