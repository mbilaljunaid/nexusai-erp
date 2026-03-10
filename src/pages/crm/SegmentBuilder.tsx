import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter, Users, Save, Play, Plus, X, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface SegmentRule {
    id: string;
    field: string;
    operator: string;
    value: string;
    condition: "AND" | "OR";
}

export default function SegmentBuilder() {
    const { toast } = useToast();

    const [segmentName, setSegmentName] = useState("New Dynamic Segment");
    const [segmentDesc, setSegmentDesc] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [rules, setRules] = useState<SegmentRule[]>([
        { id: "1", field: "industry", operator: "EQUALS", value: "Technology", condition: "AND" }
    ]);

    const fields = [
        { value: "industry", label: "Industry" },
        { value: "jobTitle", label: "Job Title" },
        { value: "companySize", label: "Company Size" },
        { value: "lastActivity", label: "Last Activity Days" },
        { value: "leadScore", label: "Lead Score" },
        { value: "region", label: "Region/State" }
    ];

    const operators = [
        { value: "EQUALS", label: "Equals" },
        { value: "NOT_EQUALS", label: "Not Equals" },
        { value: "CONTAINS", label: "Contains" },
        { value: "GREATER_THAN", label: "Greater Than" },
        { value: "LESS_THAN", label: "Less Than" },
        { value: "IS_EMPTY", label: "Is Empty" }
    ];

    const mockContacts = [
        { id: 1, name: "Emily Chen", company: "Acme Tech", industry: "Technology", score: 85, lastActive: "2 days ago" },
        { id: 2, name: "Michael Ross", company: "Stark Industries", industry: "Manufacturing", score: 92, lastActive: "5 hours ago" },
        { id: 3, name: "Sarah Jenkins", company: "Globex Corp", industry: "Technology", score: 45, lastActive: "12 days ago" }
    ];

    const addRule = () => {
        setRules([...rules, {
            id: Math.random().toString(36).substr(2, 9),
            field: "industry",
            operator: "EQUALS",
            value: "",
            condition: "AND"
        }]);
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const updateRule = (id: string, field: keyof SegmentRule, value: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSave = () => {
        toast({
            title: "Segment Saved",
            description: "Dynamic segment rules have been updated and re-calculating."
        });
    };

    return (
        <StandardPage
            title="Segment Builder"
            description="Create dynamic, rule-based audience segments for targeted campaigns."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Marketing", href: "/crm/marketing" },
                { label: "Segments" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast({ title: "Calculating...", description: "Running rules engine against contact database." })}>
                        <Play className="h-4 w-4 mr-2" /> Preview Audience
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" /> Save Segment
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Rules Builder Column (Col Span 2) */}
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Segment Definition</CardTitle>
                                    <CardDescription>Configure the dynamic rules that define membership.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="active-switch">Active</Label>
                                    <Switch id="active-switch" checked={isActive} onCheckedChange={setIsActive} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Segment Name</Label>
                                    <Input value={segmentName} onChange={(e) => setSegmentName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={segmentDesc} onChange={(e) => setSegmentDesc(e.target.value)} placeholder="e.g. High value prospects in AMER..." />
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-primary" /> Filter Rules
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={addRule}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Rule
                                    </Button>
                                </div>

                                <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-muted/50 transition-all">
                                    {rules.map((rule, index) => (
                                        <div key={rule.id} className="flex items-center gap-3 relative group">

                                            {index > 0 && (
                                                <div className="w-24 shrink-0">
                                                    <Select value={rule.condition} onValueChange={(v) => updateRule(rule.id, "condition", v)}>
                                                        <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="AND">AND</SelectItem>
                                                            <SelectItem value="OR">OR</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            {index === 0 && <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground flex justify-end pr-4">WHERE</div>}

                                            <div className="flex-1 grid grid-cols-3 gap-2">
                                                <Select value={rule.field} onValueChange={(v) => updateRule(rule.id, "field", v)}>
                                                    <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {fields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>

                                                <Select value={rule.operator} onValueChange={(v) => updateRule(rule.id, "operator", v)}>
                                                    <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {operators.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>

                                                <Input
                                                    className="h-9 bg-background"
                                                    placeholder="Value..."
                                                    value={rule.value}
                                                    onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                                                />
                                            </div>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" onClick={() => removeRule(rule.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {rules.length === 0 && (
                                        <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg border-muted">
                                            No rules defined. This segment will include all contacts.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Preview Column (Col Span 1) */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary mb-1">Estimated Audience</p>
                                    <p className="text-4xl font-black text-primary">1,248</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <Activity className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 font-medium">+42 contacts</span> added today
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm flex items-center justify-between">
                                Sample Contacts
                                <Badge variant="secondary" className="font-normal text-xs">Preview</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {mockContacts.map(contact => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="py-2 px-4">
                                                <div className="font-medium text-sm">{contact.name}</div>
                                                <div className="text-xs text-muted-foreground">{contact.company}</div>
                                            </TableCell>
                                            <TableCell className="py-2 px-4 text-right">
                                                <Badge variant="outline" className="text-[10px]">{contact.score} Score</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <div className="p-3 border-t bg-muted/10 text-center">
                            <Button variant="link" size="sm" className="text-xs text-muted-foreground">View All Matching Contacts <ArrowRight className="h-3 w-3 ml-1" /></Button>
                        </div>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
