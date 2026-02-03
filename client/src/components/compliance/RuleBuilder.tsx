import { useState } from "react";
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
import { Code, Settings2, ShieldCheck, Clock } from "lucide-react";

interface RuleBuilderProps {
    onSave: (logic: any) => void;
    initialLogic?: any;
}

export function RuleBuilder({ onSave, initialLogic }: RuleBuilderProps) {
    const [type, setType] = useState(initialLogic?.type || "REQUIRED_FIELD");
    const [field, setField] = useState(initialLogic?.field || "");
    const [threshold, setThreshold] = useState(initialLogic?.threshold || 18);
    const [dateField, setDateField] = useState(initialLogic?.dateField || "dateStart");
    const [operator, setOperator] = useState(initialLogic?.operator || "GREATER_THAN");
    const [value, setValue] = useState(initialLogic?.value || 90);

    const handleSave = () => {
        let logic: any = { type };
        if (type === "REQUIRED_FIELD") logic.field = field;
        if (type === "MIN_AGE") logic.threshold = threshold;
        if (type === "TIME_TRIGGER") {
            logic.dateField = dateField;
            logic.operator = operator;
            logic.value = value;
        }
        // IDENTIFICATION and GHOST_EMPLOYEE often don't need extra params yet
        onSave(logic);
    };

    return (
        <div className="space-y-6 p-1">
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
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
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
                </div>
            )}

            {(type === "IDENTIFICATION" || type === "GHOST_EMPLOYEE") && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
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
