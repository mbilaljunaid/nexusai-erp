import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, CheckCircle2, Save, Building2, MapPin, Tag, DollarSign, BookOpen, Settings } from "lucide-react";

// Oracle FA: Add Assets — 5-tab form (What/Where/When/How/Books)

const STEP_LABELS = ["What", "Where", "When", "How (Depreciation)", "Books & GL"];
const CATEGORIES = ["IT Equipment", "Furniture & Fixtures", "Vehicles", "Manufacturing Equipment", "Leasehold Improvements", "Lab Equipment", "Buildings", "Land"];
const DEPRN_METHODS = ["STLN", "DB150", "DB200", "SYD", "MACRS", "Units of Production"];
const CONVENTIONS = ["Half-Year", "Mid-Month", "Mid-Quarter", "Full-Month", "Actual Days"];
const BOOKS = ["CORPORATE", "MACRS TAX", "AMT TAX", "UK STATUTORY"];

export function FaAssetAdditionWizard() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [asset, setAsset] = useState({
        // What
        description: "", assetType: "Tangible", category: "", tag: "", serialNumber: "", manufacturer: "", modelNumber: "", inServiceFlag: true,
        // Where
        location: "", assignedTo: "", department: "", costCenter: "",
        // When
        datePlacedInService: new Date().toISOString().split("T")[0], acquisitionDate: new Date().toISOString().split("T")[0], acquisitionType: "New Purchase",
        // How
        deprnMethod: "STLN", lifeMonths: "60", convention: "Half-Year", salvageValue: "0", costCeiling: "", bonusPct: "0",
        trackAsInProgress: false, groupAsset: "",
        // Books
        book: "CORPORATE", originalCost: "", glAccount: "", accDeprnAccount: "", deprExpAccount: "", project: "",
        altBook: "", booked: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const set = (key: string, val: any) => setAsset(p => ({ ...p, [key]: val }));

    const handleSave = async () => {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        const assetNum = `FA-${Date.now().toString().slice(-5)}`;
        toast({ title: `Asset ${assetNum} created`, description: `Now in Pending Depreciation status. Run depreciation to activate.`, className: "bg-green-900 border-green-700 text-white" });
        setSubmitting(false);
        setStep(1);
        setAsset(p => ({ ...p, description: "", tag: "" }));
    };

    const Field = ({ id, label, value, onChange, type = "text", placeholder = "" }: any) => (
        <div>
            <Label htmlFor={id} className="text-xs">{label}</Label>
            <Input id={id} type={type} className="mt-1 h-8 text-xs" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );

    const Sel = ({ id, label, value, onChange, options }: any) => (
        <div>
            <Label htmlFor={id} className="text-xs">{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
        </div>
    );

    return (
        <StandardPage title="Add Asset" description="Create a new fixed asset record (5-step addition form)">
            {/* Step Indicator */}
            <div className="flex items-center mb-6">
                {STEP_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer
                ${i + 1 < step ? "bg-green-600 text-white" : i + 1 === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                onClick={() => i + 1 <= step && setStep(i + 1)}>
                                {i + 1 < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className={`text-xs truncate ${i + 1 === step ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
                        </div>
                        {i < STEP_LABELS.length - 1 && <div className="h-px flex-1 bg-border mx-2 shrink-0" />}
                    </div>
                ))}
            </div>

            <Card>
                <CardContent className="pt-6 pb-6">
                    {/* Step 1: What */}
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-2 mb-4"><Tag className="h-4 w-4 text-primary" /><h3 className="font-semibold">Asset Description</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2"><Field id="desc" label="Asset Description *" value={asset.description} onChange={(v: string) => set("description", v)} placeholder="e.g. Dell PowerEdge R750 Rack Server" /></div>
                                <Field id="tag" label="Asset Tag Number" value={asset.tag} onChange={(v: string) => set("tag", v)} placeholder="e.g. TAG-00892" />
                                <Field id="serial" label="Serial Number" value={asset.serialNumber} onChange={(v: string) => set("serialNumber", v)} />
                                <Field id="mfr" label="Manufacturer" value={asset.manufacturer} onChange={(v: string) => set("manufacturer", v)} />
                                <Field id="model" label="Model Number" value={asset.modelNumber} onChange={(v: string) => set("modelNumber", v)} />
                                <Sel id="cat" label="Asset Category *" value={asset.category || CATEGORIES[0]} onChange={(v: string) => set("category", v)} options={CATEGORIES} />
                                <Sel id="atype" label="Asset Type" value={asset.assetType} onChange={(v: string) => set("assetType", v)} options={["Tangible", "Intangible", "CIP (In Progress)", "Leased"]} />
                            </div>
                        </>
                    )}

                    {/* Step 2: Where */}
                    {step === 2 && (
                        <>
                            <div className="flex items-center gap-2 mb-4"><MapPin className="h-4 w-4 text-primary" /><h3 className="font-semibold">Location &amp; Assignment</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field id="loc" label="Location" value={asset.location} onChange={(v: string) => set("location", v)} placeholder="e.g. Head Office — Floor 3" />
                                <Field id="asn" label="Assigned To (Employee)" value={asset.assignedTo} onChange={(v: string) => set("assignedTo", v)} />
                                <Field id="dept" label="Department" value={asset.department} onChange={(v: string) => set("department", v)} />
                                <Field id="cc" label="Cost Center" value={asset.costCenter} onChange={(v: string) => set("costCenter", v)} />
                            </div>
                        </>
                    )}

                    {/* Step 3: When */}
                    {step === 3 && (
                        <>
                            <div className="flex items-center gap-2 mb-4"><CheckCircle2 className="h-4 w-4 text-primary" /><h3 className="font-semibold">Acquisition Details</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field id="disp" label="Date Placed in Service *" type="date" value={asset.datePlacedInService} onChange={(v: string) => set("datePlacedInService", v)} />
                                <Field id="acqd" label="Acquisition Date" type="date" value={asset.acquisitionDate} onChange={(v: string) => set("acquisitionDate", v)} />
                                <Sel id="acqt" label="Acquisition Type" value={asset.acquisitionType} onChange={(v: string) => set("acquisitionType", v)} options={["New Purchase", "Existing — Not Capitalised", "Finance Lease", "CIP to In-Service", "Like-Kind Exchange", "Mass Addition"]} />
                                <Field id="proj" label="Capital Project / WBS" value={asset.project} onChange={(v: string) => set("project", v)} placeholder="Optional — CIP project reference" />
                            </div>
                        </>
                    )}

                    {/* Step 4: How */}
                    {step === 4 && (
                        <>
                            <div className="flex items-center gap-2 mb-4"><Settings className="h-4 w-4 text-primary" /><h3 className="font-semibold">Depreciation Parameters</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <Sel id="dm" label="Depreciation Method" value={asset.deprnMethod} onChange={(v: string) => set("deprnMethod", v)} options={DEPRN_METHODS} />
                                <Field id="life" label="Useful Life (Months) *" type="number" value={asset.lifeMonths} onChange={(v: string) => set("lifeMonths", v)} />
                                <Sel id="conv" label="Prorate Convention" value={asset.convention} onChange={(v: string) => set("convention", v)} options={CONVENTIONS} />
                                <Field id="salv" label="Salvage Value" type="number" value={asset.salvageValue} onChange={(v: string) => set("salvageValue", v)} placeholder="0.00" />
                                <Field id="bonus" label="Bonus Depreciation %" type="number" value={asset.bonusPct} onChange={(v: string) => set("bonusPct", v)} placeholder="0" />
                                <Field id="ceil" label="Cost Ceiling" type="number" value={asset.costCeiling} onChange={(v: string) => set("costCeiling", v)} placeholder="Optional" />
                            </div>
                        </>
                    )}

                    {/* Step 5: Books & GL */}
                    {step === 5 && (
                        <>
                            <div className="flex items-center gap-2 mb-4"><BookOpen className="h-4 w-4 text-primary" /><h3 className="font-semibold">Books &amp; GL Accounts</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <Sel id="book" label="Corporate Book *" value={asset.book} onChange={(v: string) => set("book", v)} options={BOOKS} />
                                <Field id="cost" label="Original Cost *" type="number" value={asset.originalCost} onChange={(v: string) => set("originalCost", v)} placeholder="0.00" />
                                <Field id="glacc" label="Asset Cost Account" value={asset.glAccount} onChange={(v: string) => set("glAccount", v)} placeholder="e.g. 17100" />
                                <Field id="adacc" label="Accum Depreciation Account" value={asset.accDeprnAccount} onChange={(v: string) => set("accDeprnAccount", v)} placeholder="e.g. 17200" />
                                <Field id="deacc" label="Deprn Expense Account" value={asset.deprExpAccount} onChange={(v: string) => set("deprExpAccount", v)} placeholder="e.g. 71100" />
                                <Sel id="altbook" label="Tax Book (Optional)" value={asset.altBook || "None"} onChange={(v: string) => set("altBook", v === "None" ? "" : v)} options={["None", "MACRS TAX", "AMT TAX", "UK STATUTORY"]} />
                            </div>
                            <Separator className="my-4" />
                            <div className="bg-muted/30 rounded p-3 text-sm space-y-1">
                                <p className="font-medium">Asset Summary</p>
                                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Description</span><span>{asset.description || "—"}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Category</span><span>{asset.category || "—"}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Date in Service</span><span>{asset.datePlacedInService}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Method / Life</span><span>{asset.deprnMethod} / {asset.lifeMonths} months</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Original Cost</span><span>{asset.originalCost ? formatNumber(parseFloat(asset.originalCost)) : "—"}</span></div>
                            </div>
                        </>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />Back
                        </Button>
                        {step < 5 ? (
                            <Button onClick={() => setStep(s => s + 1)}>
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button onClick={handleSave} disabled={submitting}>
                                {submitting ? "Creating..." : <><Save className="h-4 w-4 mr-2" />Create Asset</>}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}

export default FaAssetAdditionWizard;
