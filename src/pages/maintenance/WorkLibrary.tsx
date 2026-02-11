import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    FileText,
    Clock,
    Wrench,
    DollarSign,
    ClipboardList,
    Plus,
    FileCheck,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkDefinition {
    id: string;
    code: string;
    name: string;
    category: string;
    version: number;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    estimatedDuration: number; // hours
    estimatedCost: number;
    operationCount: number;
    materialCount: number;
    skillsRequired: string[];
    lastUsed?: string;
    useCount: number;
}

interface WorkOperation {
    sequence: number;
    description: string;
    duration: number;
    skillRequired: string;
}

interface WorkMaterial {
    itemCode: string;
    description: string;
    quantity: number;
    uom: string;
    estimatedCost: number;
}

interface WorkDefinitionDetail extends WorkDefinition {
    operations: WorkOperation[];
    materials: WorkMaterial[];
    notes?: string;
}

export function WorkLibrary() {
    const [definitions, setDefinitions] = useState<WorkDefinition[]>([]);
    const [selectedDefinition, setSelectedDefinition] = useState<WorkDefinitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [showApplyDialog, setShowApplyDialog] = useState(false);

    useEffect(() => {
        loadDefinitions();
    }, []);

    const loadDefinitions = async () => {
        setLoading(true);
        try {
            // Mock work definitions
            const mockDefinitions: WorkDefinition[] = [
                {
                    id: "wd-001",
                    code: "PM-COMP-MONTHLY",
                    name: "Air Compressor Monthly Service",
                    category: "Preventive Maintenance",
                    version: 3,
                    status: "ACTIVE",
                    estimatedDuration: 2.5,
                    estimatedCost: 450,
                    operationCount: 8,
                    materialCount: 5,
                    skillsRequired: ["Mechanical", "Electrical"],
                    lastUsed: "2026-01-15",
                    useCount: 24
                },
                {
                    id: "wd-002",
                    code: "BRAKE-REPLACE",
                    name: "Forklift Brake System Replacement",
                    category: "Corrective Maintenance",
                    version: 2,
                    status: "ACTIVE",
                    estimatedDuration: 4.0,
                    estimatedCost: 850,
                    operationCount: 12,
                    materialCount: 8,
                    skillsRequired: ["Mechanical", "Hydraulics"],
                    lastUsed: "2026-02-10",
                    useCount: 15
                },
                {
                    id: "wd-003",
                    code: "HVAC-FILTER-CHANGE",
                    name: "HVAC Filter Replacement",
                    category: "Preventive Maintenance",
                    version: 1,
                    status: "ACTIVE",
                    estimatedDuration: 0.5,
                    estimatedCost: 120,
                    operationCount: 3,
                    materialCount: 2,
                    skillsRequired: ["HVAC"],
                    lastUsed: "2026-02-01",
                    useCount: 48
                },
                {
                    id: "wd-004",
                    code: "CONVEYOR-BEARING",
                    name: "Conveyor Belt Bearing Replacement",
                    category: "Corrective Maintenance",
                    version: 2,
                    status: "ACTIVE",
                    estimatedDuration: 3.5,
                    estimatedCost: 680,
                    operationCount: 10,
                    materialCount: 6,
                    skillsRequired: ["Mechanical"],
                    lastUsed: "2025-12-20",
                    useCount: 8
                },
                {
                    id: "wd-005",
                    code: "ANNUAL-SHUTDOWN",
                    name: "Annual Plant Shutdown Inspection",
                    category: "Shutdown Maintenance",
                    version: 1,
                    status: "DRAFT",
                    estimatedDuration: 16.0,
                    estimatedCost: 3500,
                    operationCount: 25,
                    materialCount: 15,
                    skillsRequired: ["Mechanical", "Electrical", "Instrumentation"],
                    useCount: 1
                }
            ];
            setDefinitions(mockDefinitions);
        } catch (error) {
            console.error("Failed to load work definitions:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDefinitionDetail = async (definition: WorkDefinition) => {
        // Mock detailed work definition
        const mockDetail: WorkDefinitionDetail = {
            ...definition,
            operations: [
                { sequence: 1, description: "Isolate equipment and lock out energy sources", duration: 0.25, skillRequired: "Mechanical" },
                { sequence: 2, description: "Drain air from system", duration: 0.25, skillRequired: "Mechanical" },
                { sequence: 3, description: "Remove and inspect air/oil separator", duration: 0.5, skillRequired: "Mechanical" },
                { sequence: 4, description: "Replace oil filter", duration: 0.25, skillRequired: "Mechanical" },
                { sequence: 5, description: "Replace air filter", duration: 0.25, skillRequired: "Mechanical" },
                { sequence: 6, description: "Check and adjust belt tension", duration: 0.5, skillRequired: "Mechanical" },
                { sequence: 7, description: "Inspect electrical connections", duration: 0.25, skillRequired: "Electrical" },
                { sequence: 8, description: "System startup and test", duration: 0.25, skillRequired: "Mechanical" }
            ],
            materials: [
                { itemCode: "FILTER-OIL-123", description: "Oil Filter Cartridge", quantity: 1, uom: "EA", estimatedCost: 45 },
                { itemCode: "FILTER-AIR-456", description: "Air Filter Element", quantity: 1, uom: "EA", estimatedCost: 35 },
                { itemCode: "OIL-COMP-20W50", description: "Compressor Oil 20W-50", quantity: 5, uom: "L", estimatedCost: 150 },
                { itemCode: "SEPARATOR-789", description: "Air/Oil Separator", quantity: 1, uom: "EA", estimatedCost: 180 },
                { itemCode: "GASKET-SET-01", description: "Gasket Set", quantity: 1, uom: "SET", estimatedCost: 40 }
            ],
            notes: "Follow manufacturer lockout/tagout procedure. Ensure oil temperature is below 50°C before draining."
        };

        setSelectedDefinition(mockDetail);
    };

    const handleApplyToWorkOrder = () => {
        // In production: navigate to WO creation with this definition pre-filled
        setShowApplyDialog(true);
    };

    const getStatusConfig = (status: WorkDefinition["status"]) => {
        switch (status) {
            case "ACTIVE":
                return { color: "bg-green-100 text-green-800", label: "Active" };
            case "DRAFT":
                return { color: "bg-yellow-100 text-yellow-800", label: "Draft" };
            case "ARCHIVED":
                return { color: "bg-gray-100 text-gray-800", label: "Archived" };
        }
    };

    const filteredDefinitions = definitions
        .filter(def => categoryFilter === "all" || def.category === categoryFilter)
        .filter(def =>
            searchTerm === "" ||
            def.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            def.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            def.skillsRequired.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Work Library</h1>
                    <p className="text-muted-foreground">Browse and apply standardized work definitions</p>
                </div>
                <Button onClick={() => { }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Definition
                </Button>
            </div>

            <Tabs defaultValue="catalog" className="w-full">
                <TabsList>
                    <TabsTrigger value="catalog">Catalog ({definitions.length})</TabsTrigger>
                    <TabsTrigger value="detail">Definition Detail</TabsTrigger>
                </TabsList>

                <TabsContent value="catalog" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search work definitions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="Filter by category..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Preventive Maintenance">Preventive Maintenance</SelectItem>
                                        <SelectItem value="Corrective Maintenance">Corrective Maintenance</SelectItem>
                                        <SelectItem value="Shutdown Maintenance">Shutdown Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Definition Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredDefinitions.map(definition => {
                            const statusConfig = getStatusConfig(definition.status);

                            return (
                                <Card
                                    key={definition.id}
                                    className="cursor-pointer hover:border-primary transition-all"
                                    onClick={() => loadDefinitionDetail(definition)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm font-bold text-primary">{definition.code}</span>
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        v{definition.version}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1">{definition.name}</h3>
                                                <p className="text-sm text-muted-foreground">{definition.category}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{definition.estimatedDuration} hrs</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span>${definition.estimatedCost}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                                <span>{definition.operationCount} operations</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>{definition.materialCount} materials</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {definition.skillsRequired.map((skill, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    <Wrench className="h-3 w-3 mr-1" />
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>

                                        {definition.lastUsed && (
                                            <div className="text-xs text-muted-foreground border-t pt-2">
                                                Last used: {definition.lastUsed} • Used {definition.useCount} times
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="detail">
                    {selectedDefinition ? (
                        <div className="space-y-4">
                            {/* Header */}
                            <Card className="border-2 border-primary">
                                <CardHeader className="bg-primary/5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono font-bold text-primary">{selectedDefinition.code}</span>
                                                <Badge variant="outline" className={getStatusConfig(selectedDefinition.status).color}>
                                                    {getStatusConfig(selectedDefinition.status).label}
                                                </Badge>
                                                <Badge variant="outline">Version {selectedDefinition.version}</Badge>
                                            </div>
                                            <CardTitle className="text-2xl mb-1">{selectedDefinition.name}</CardTitle>
                                            <p className="text-muted-foreground">{selectedDefinition.category}</p>
                                        </div>
                                        <Button onClick={handleApplyToWorkOrder}>
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Apply to Work Order
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-primary">{selectedDefinition.estimatedDuration}</div>
                                            <div className="text-xs text-muted-foreground">Hours</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">${selectedDefinition.estimatedCost}</div>
                                            <div className="text-xs text-muted-foreground">Est. Cost</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{selectedDefinition.operationCount}</div>
                                            <div className="text-xs text-muted-foreground">Operations</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{selectedDefinition.materialCount}</div>
                                            <div className="text-xs text-muted-foreground">Materials</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Operations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Operations Sequence</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {selectedDefinition.operations.map((op, index) => (
                                            <div key={index} className="flex items-start gap-4 border-l-4 border-primary/20 pl-4 py-2">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                                                    {op.sequence}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium mb-1">{op.description}</div>
                                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {op.duration} hrs
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Wrench className="h-3 w-3" />
                                                            {op.skillRequired}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Materials */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Required Materials</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {selectedDefinition.materials.map((material, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                                                <div className="flex-1">
                                                    <div className="font-medium">{material.description}</div>
                                                    <div className="text-sm text-muted-foreground">Code: {material.itemCode}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">
                                                        {material.quantity} {material.uom}
                                                    </div>
                                                    <div className="text-sm text-green-600">${material.estimatedCost}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="border-t pt-3 flex justify-between font-bold">
                                            <span>Total Materials Cost:</span>
                                            <span className="text-green-600">
                                                ${selectedDefinition.materials.reduce((sum, m) => sum + m.estimatedCost, 0)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {selectedDefinition.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Notes & Special Instructions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                            <p className="text-sm">{selectedDefinition.notes}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="pt-20 pb-20 text-center text-muted-foreground">
                                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <div>No definition selected</div>
                                <div className="text-sm">Select a definition from the Catalog tab to view details</div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default WorkLibrary;
