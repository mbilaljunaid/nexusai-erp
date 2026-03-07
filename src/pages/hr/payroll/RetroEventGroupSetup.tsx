import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Activity,
    Save,
    Plus,
    Trash2,
    Database,
    Zap,
    History,
    Search,
    ChevronDown,
    ChevronRight,
    Cylinder
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type EventType = "INSERT" | "UPDATE" | "DELETE" | "LOGICAL";

type MonitoredField = {
    id: string;
    entityName: string; // e.g. 'Person Assignment'
    attributeName: string; // e.g. 'Salary Amount'
    eventType: EventType;
    triggerRetro: boolean;
    triggerProration: boolean;
};

type EventGroup = {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    fields: MonitoredField[];
};

export default function RetroEventGroupSetup() {
    const { toast } = useToast();

    // Default system event group for RetroPay
    const [eventGroup, setEventGroup] = useState<EventGroup>({
        id: "eg_retropay_standard",
        name: "Standard RetroPay Triggers",
        description: "Core HCM data changes that trigger retroactive payroll recalculation.",
        isActive: true,
        fields: [
            { id: "f1", entityName: "Element Entry", attributeName: "Screen Entry Value", eventType: "UPDATE", triggerRetro: true, triggerProration: false },
            { id: "f2", entityName: "Person Assignment", attributeName: "Grade ID", eventType: "UPDATE", triggerRetro: true, triggerProration: true },
            { id: "f3", entityName: "Salary Proposal", attributeName: "Salary Amount", eventType: "INSERT", triggerRetro: true, triggerProration: true },
            { id: "f4", entityName: "Absence Record", attributeName: "Duration", eventType: "UPDATE", triggerRetro: true, triggerProration: false },
        ]
    });

    const entities = ["Element Entry", "Person Assignment", "Salary Proposal", "Absence Record", "Calculation Card"];
    const eventTypes: EventType[] = ["INSERT", "UPDATE", "DELETE", "LOGICAL"];

    const addField = () => {
        const newField: MonitoredField = {
            id: `f${Date.now()}`,
            entityName: "Person Assignment",
            attributeName: "New Attribute",
            eventType: "UPDATE",
            triggerRetro: true,
            triggerProration: false
        };
        setEventGroup({ ...eventGroup, fields: [...eventGroup.fields, newField] });
    };

    const removeField = (id: string) => {
        setEventGroup({ ...eventGroup, fields: eventGroup.fields.filter(f => f.id !== id) });
    };

    const updateField = (id: string, key: keyof MonitoredField, value: any) => {
        setEventGroup({
            ...eventGroup,
            fields: eventGroup.fields.map(f => f.id === id ? { ...f, [key]: value } : f)
        });
    };

    const handleSave = () => {
        toast({
            title: "Event Group Saved",
            description: "Retroactive triggers have been successfully updated in the database."
        });
    };

    return (
        <StandardPage
            title="Retroactive Event Groups"
            description="Configure which database table changes automatically generate retro-notifications for payroll recalculation."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Payroll Setup', href: '/hr/payroll/setup/elements' },
                { label: 'Event Groups' }
            ]}
        >
            <div className="max-w-6xl mx-auto pb-12 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Manage Event Groups</h2>
                            <p className="text-sm text-muted-foreground mt-1">Map HCM datetrack updates to Payroll engine triggers.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline"><History className="h-4 w-4 mr-2" /> View Trigger History</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4 mr-2" /> Save Configuration</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Panel: Group Details */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-indigo-500" /> Group Context</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Group Name</Label>
                                    <Input value={eventGroup.name} onChange={(e) => setEventGroup({ ...eventGroup, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={eventGroup.description} onChange={(e) => setEventGroup({ ...eventGroup, description: e.target.value })} />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="active" checked={eventGroup.isActive} onCheckedChange={(val) => setEventGroup({ ...eventGroup, isActive: !!val })} />
                                    <label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Activate Triggers for Engine
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-indigo-500/10 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800">
                            <CardContent className="p-4 py-5">
                                <div className="flex items-start gap-3">
                                    <Activity className="h-5 w-5 text-indigo-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">How it works</h4>
                                        <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                                            When an HR user updates a field listed here with an effective date in the past, the system automatically writes a <strong>Retro-Notification</strong> record. The next payroll run will detect this and recalculate the difference.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Monitored Fields Table */}
                    <div className="md:col-span-2">
                        <Card className="h-full flex flex-col shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                                <div>
                                    <CardTitle className="text-base">Monitored Data Entities</CardTitle>
                                    <CardDescription>Specific tables and columns generating retro-events.</CardDescription>
                                </div>
                                <Button size="sm" variant="secondary" onClick={addField}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Entity
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto">
                                <Table>
                                    <TableHeader className="bg-zinc-500/10 dark:bg-zinc-900/50">
                                        <TableRow>
                                            <TableHead className="w-44">Database Entity</TableHead>
                                            <TableHead className="w-44">Attribute (Column)</TableHead>
                                            <TableHead className="w-28">Event Type</TableHead>
                                            <TableHead className="text-center w-24">Retro?</TableHead>
                                            <TableHead className="text-center w-24">Prorate?</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {eventGroup.fields.map((field) => (
                                            <TableRow key={field.id} className="group">
                                                <TableCell>
                                                    <Select value={field.entityName} onValueChange={(v) => updateField(field.id, 'entityName', v)}>
                                                        <SelectTrigger className="h-8 text-xs bg-transparent border-0 px-2 focus:ring-1"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {entities.map(e => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={field.attributeName}
                                                        onChange={(e) => updateField(field.id, 'attributeName', e.target.value)}
                                                        className="h-8 text-xs bg-transparent border-0 px-2 focus-visible:ring-1"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={field.eventType} onValueChange={(v) => updateField(field.id, 'eventType', v as EventType)}>
                                                        <SelectTrigger className="h-8 text-[11px] font-mono bg-transparent border-0 px-2 focus:ring-1"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {eventTypes.map(e => <SelectItem key={e} value={e} className="text-[11px] font-mono">{e}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Checkbox checked={field.triggerRetro} onCheckedChange={(v) => updateField(field.id, 'triggerRetro', !!v)} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Checkbox checked={field.triggerProration} onCheckedChange={(v) => updateField(field.id, 'triggerProration', !!v)} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeField(field.id)} aria-label="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {eventGroup.fields.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground border-t border-dashed">
                                        <Cylinder className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No data entities are currently monitored.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </StandardPage>
    );
}
