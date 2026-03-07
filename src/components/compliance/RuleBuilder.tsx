import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Code, Settings2, ShieldCheck, Clock, BookTemplate } from "lucide-react";

interface RuleBuilderProps {
    onSave: (logic: any) => void;
    initialLogic?: any;
    legislationCode?: string;
}

const TEMPLATES: Record<string, any[]> = {
    "US": [
        { label: "I-9 Verification (3 Days)", type: "TIME_TRIGGER", logic: { type: "TIME_TRIGGER", dateField: "effectiveStartDate", operator: "GREATER_THAN", value: 3, remediation: ["Complete Form I-9"] } },
        { label: "FLSA Min Age (14)", type: "MIN_AGE", logic: { type: "MIN_AGE", threshold: 14 } },
        { label: "SSN Validation", type: "IDENTIFICATION", logic: { type: "IDENTIFICATION" } }
    ],
    "UK": [
        { label: "Right to Work Check", type: "REQUIRED_FIELD", logic: { type: "REQUIRED_FIELD", field: "citizenshipDetails" } },
        { label: "NIN Validation", type: "IDENTIFICATION", logic: { type: "IDENTIFICATION" } },
        { label: "Pension Auto-Enrollment (22y)", type: "MIN_AGE", logic: { type: "MIN_AGE", threshold: 22 } }
    ],
    "EU": [
        { label: "GDPR Consent (Annual)", type: "TIME_TRIGGER", logic: { type: "TIME_TRIGGER", dateField: "dateStart", operator: "MODULO", modulus: 365, window: 30, remediation: ["Renew GDPR Consent"] } },
        { label: "Working Time Directive", type: "TIME_TRIGGER", logic: { type: "TIME_TRIGGER", dateField: "effectiveStartDate", operator: "GREATER_THAN", value: 48, remediation: ["Review Weekly Hours"] } }
    ]
};

export function RuleBuilder({ onSave, initialLogic, legislationCode = "GLOBAL" }: RuleBuilderProps) {
    const [type, setType] = useState(initialLogic?.type || "REQUIRED_FIELD");
    const [field, setField] = useState(initialLogic?.field || "");
    const [threshold, setThreshold] = useState(initialLogic?.threshold || 18);
    const [dateField, setDateField] = useState(initialLogic?.dateField || "dateStart");
    const [operator, setOperator] = useState(initialLogic?.operator || "GREATER_THAN");
    const [value, setValue] = useState(initialLogic?.value || 90);
    const [modulus, setModulus] = useState(initialLogic?.modulus || 365);
    const [window, setWindow] = useState(initialLogic?.window || 30);

    // Apply template logic
    const applyTemplate = (templateIndex: string) => {
        const tpl = TEMPLATES[legislationCode]?.[parseInt(templateIndex)];
        if (!tpl) return;

        setType(tpl.type);
        const l = tpl.logic;
        if (l.field) setField(l.field);
        if (l.threshold) setThreshold(l.threshold);
        if (l.dateField) setDateField(l.dateField);
        if (l.operator) setOperator(l.operator);
        if (l.value) setValue(l.value);
        if (l.modulus) setModulus(l.modulus);
        if (l.window) setWindow(l.window);
    };

    const handleSave = () => {
        let logic: any = { type };
        if (type === "REQUIRED_FIELD") logic.field = field;
        if (type === "MIN_AGE") logic.threshold = threshold;
        if (type === "TIME_TRIGGER") {
            logic.dateField = dateField;
            logic.operator = operator;
            if (operator === "MODULO") {
                logic.modulus = modulus;
                logic.window = window;
            } else {
                logic.value = value;
            }
        }
        onSave(logic);
    };

    const availableTemplates = TEMPLATES[legislationCode] || [];

    return (
        <div className="space-y-6 p-1">
            {availableTemplates.length > 0 && (
                <div className="bg-indigo-500/10 border border-indigo-100 p-3 rounded-xl flex items-center gap-4">
                    <BookTemplate className="h-5 w-5 text-indigo-600" />
                    <div className="flex-1">
                        <Label className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1 block">
                            Quick Start: {legislationCode} Templates
                        </Label>
                        <Select onValueChange={applyTemplate}>
                            <SelectTrigger className="h-9 bg-white border-indigo-200">
                                <SelectValue placeholder="Choose a legislative template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTemplates.map((t, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-indigo-500" />
                    Rule Evaluation Strategy
                </Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="REQUIRED_FIELD">Required Field Check</SelectItem>
                        <SelectItem value="MIN_AGE">Minimum Age Validation</SelectItem>
                        <SelectItem value="IDENTIFICATION">Legislation ID Format (SSN/NIN)</SelectItem>
                        <SelectItem value="GHOST_EMPLOYEE">Ghost Employee Discovery</SelectItem>
                        <SelectItem value="TIME_TRIGGER">Time-Based Tenure Trigger</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {type === "REQUIRED_FIELD" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-sm font-bold">Target Field</Label>
                    <Input
                        placeholder="e.g., email, nationalId, departmentId"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="h-11 rounded-xl"
                    />
                </div>
            )}

            {type === "MIN_AGE" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-sm font-bold">Minimum Age Threshold</Label>
                    <Input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value))}
                        className="h-11 rounded-xl"
                    />
                </div>
            )}

            {type === "TIME_TRIGGER" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Reference Date Field</Label>
                            <Select value={dateField} onValueChange={setDateField}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dateStart">Hire Date (WR)</SelectItem>
                                    <SelectItem value="effectiveStartDate">Assignment Start</SelectItem>
                                    <SelectItem value="dateOfBirth">Birth Date</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Operator</Label>
                            <Select value={operator} onValueChange={setOperator}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GREATER_THAN">Greater Than (Past)</SelectItem>
                                    <SelectItem value="LESS_THAN">Less Than (Within)</SelectItem>
                                    <SelectItem value="MODULO">Recurring Every (Modulo)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {operator === "MODULO" ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    Recurrence (Days)
                                </Label>
                                <Input
                                    type="number"
                                    value={modulus}
                                    onChange={(e) => setModulus(parseInt(e.target.value))}
                                    className="h-11 rounded-xl"
                                    placeholder="365"
                                />
                                <p className="text-[10px] text-muted-foreground">e.g. 365 for Annually</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Warning Window (Days)</Label>
                                <Input
                                    type="number"
                                    value={window}
                                    onChange={(e) => setWindow(parseInt(e.target.value))}
                                    className="h-11 rounded-xl"
                                    placeholder="30"
                                />
                                <p className="text-[10px] text-muted-foreground">Trigger if within X days of due date</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-sm font-bold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Threshold (Days)
                            </Label>
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(parseInt(e.target.value))}
                                className="h-11 rounded-xl"
                            />
                        </div>
                    )}
                </div>
            )}

            {(type === "IDENTIFICATION" || type === "GHOST_EMPLOYEE") && (
                <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-slate-800">Dynamic Heuristic Rule</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                            This strategy uses built-in localized logic to validate data based on the
                            Legislation Code and Entity context. No additional parameters are required.
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-4 border-t flex justify-end">
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-xl gap-2 shadow-lg">
                    <Code className="h-4 w-4" />
                    Generate Rule Logic
                </Button>
            </div>
        </div>
    );
}
