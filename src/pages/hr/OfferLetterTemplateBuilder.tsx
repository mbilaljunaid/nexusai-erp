import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    Save,
    Settings,
    Variable,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    Link,
    Image as ImageIcon,
    Eye
} from "lucide-react";

const AVAILABLE_TOKENS = [
    { id: "CAND_FIRST_NAME", label: "Candidate First Name", category: "Candidate" },
    { id: "CAND_LAST_NAME", label: "Candidate Last Name", category: "Candidate" },
    { id: "JOB_TITLE", label: "Job Title", category: "Job Info" },
    { id: "DEPARTMENT", label: "Department", category: "Job Info" },
    { id: "MANAGER_NAME", label: "Manager Name", category: "Job Info" },
    { id: "START_DATE", label: "Start Date", category: "Offer Details" },
    { id: "OFFER_EXPIRY", label: "Offer Expiry Date", category: "Offer Details" },
    { id: "SALARY_ANNUAL", label: "Annual Base Salary", category: "Compensation" },
    { id: "BONUS_PERCENT", label: "Target Bonus %", category: "Compensation" },
    { id: "SIGN_ON_BONUS", label: "Sign-on Bonus", category: "Compensation" },
    { id: "WORK_LOCATION", label: "Work Location", category: "Job Info" }
];

export default function OfferLetterTemplateBuilder() {
    const { toast } = useToast();
    const [templateName, setTemplateName] = useState("Standard US Software Engineer Offer");
    const [legalEntity, setLegalEntity] = useState("NEXUS_US_CORP");

    const [documentBody, setDocumentBody] = useState(`Dear [[CAND_FIRST_NAME]],

We are thrilled to offer you the position of **[[JOB_TITLE]]** at NexusAI. We were incredibly impressed by your background and believe you will be a fantastic addition to the [[DEPARTMENT]] team, reporting to [[MANAGER_NAME]].

### The Offer Details

*   **Start Date:** [[START_DATE]]
*   **Work Location:** [[WORK_LOCATION]]
*   **Base Salary:** You will receive an annualized base salary of **$[[SALARY_ANNUAL]]**, paid semi-monthly in accordance with our standard payroll schedule.
*   **Performance Bonus:** You will be eligible for an annual target bonus of **[[BONUS_PERCENT]]%** of your base salary, subject to company and individual performance.
*   **Sign-on Bonus:** A one-time sign-on bonus of **$[[SIGN_ON_BONUS]]** will be paid within your first 30 days of employment.

This offer is contingent upon the successful completion of a background check. Please review the attached standard terms and conditions.

To accept this offer, please sign and return this letter by [[OFFER_EXPIRY]].

We look forward to welcoming you aboard!

Sincerely,
The NexusAI Talent Team`);

    // Helper to insert token at cursor (simulated by appending for now)
    const insertToken = (tokenId: string) => {
        setDocumentBody(prev => prev + ` [[${tokenId}]]`);
        toast({
            title: "Token Inserted",
            description: `Inserted [[${tokenId}]] into the document.`,
            variant: "default" // or 'default' if not 'success'
        });
    };

    const handleSave = () => {
        toast({
            title: "Template Saved",
            description: "Offer letter template is ready for generation."
        });
    };

    return (
        <StandardPage
            title="Offer Letter Template Builder"
            description="Create reusable offer letter templates with dynamic data tokens."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Talent Acquisition', href: '/hr/talent' },
                { label: 'Offer Templates' },
                { label: 'Builder' }
            ]}
        >
            <div className="max-w-7xl mx-auto space-y-6 pb-12">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <Input
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                className="text-xl font-bold border-none shadow-none h-auto p-0 focus-visible:ring-0 bg-transparent w-[500px]"
                            />
                            <p className="text-sm text-muted-foreground mt-1">Status: <Badge variant="secondary" className="font-normal border-zinc-200">Draft</Badge></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> Preview with Dummy Data</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700"><Save className="h-4 w-4 mr-2" /> Save Template</Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* Left Sidebar - Data Tokens */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Template Context</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase pb-1 block">Legal Entity</Label>
                                    <EnterpriseContextSwitcher
                                        type="legal-entity"
                                        value={legalEntity || undefined}
                                        onChange={(val) => setLegalEntity(val || "NEXUS_US_CORP")}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Worker Type Restriction</Label>
                                    <Select defaultValue="FULL_TIME">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Regular Full-Time</SelectItem>
                                            <SelectItem value="CONTRACTOR">Independent Contractor</SelectItem>
                                            <SelectItem value="INTERN">Internship</SelectItem>
                                            <SelectItem value="ANY">No Restriction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm flex flex-col h-[500px]">
                            <CardHeader className="pb-3 border-b bg-emerald-50/50 dark:bg-emerald-900/10 shrink-0">
                                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                                    <Variable className="h-4 w-4" /> Data Tokens
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">Click to insert merge fields at the end of the document.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1 overflow-y-auto space-y-6">

                                {["Candidate", "Job Info", "Compensation", "Offer Details"].map(category => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{category}</h4>
                                        <div className="space-y-1.5">
                                            {AVAILABLE_TOKENS.filter(t => t.category === category).map(token => (
                                                <button
                                                    key={token.id}
                                                    onClick={() => insertToken(token.id)}
                                                    className="w-full text-left px-3 py-2 rounded-md text-sm border hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 transition-colors flex justify-between items-center group"
                                                >
                                                    <span className="font-medium text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{token.label}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground opacity-50 group-hover:opacity-100">[[{token.id}]]</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Area - Rich Text Editor Mock */}
                    <div className="col-span-12 lg:col-span-9 flex flex-col">
                        <Card className="flex-1 flex flex-col overflow-hidden border-zinc-300 dark:border-zinc-800 shadow-sm">

                            {/* Rich Text Toolbar */}
                            <div className="border-b bg-muted/40 p-2 flex flex-wrap gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Bold className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Italic className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Underline className="h-4 w-4" /></Button>
                                <div className="w-px h-6 bg-border mx-1 my-auto" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><AlignLeft className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><AlignCenter className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><AlignRight className="h-4 w-4" /></Button>
                                <div className="w-px h-6 bg-border mx-1 my-auto" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><List className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Link className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ImageIcon className="h-4 w-4" /></Button>
                                <div className="flex-1" />
                                <Button variant="outline" size="sm" className="h-8 text-xs bg-white dark:bg-zinc-950">Add E-Signature Block</Button>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-6">
                                <div className="bg-white dark:bg-zinc-950 shadow-sm border h-full rounded-md p-0 overflow-hidden min-h-[600px]">
                                    <Textarea
                                        className="w-full h-full p-8 resize-none border-none font-serif text-base text-zinc-800 dark:text-zinc-200 leading-relaxed focus-visible:ring-0"
                                        value={documentBody}
                                        onChange={e => setDocumentBody(e.target.value)}
                                        placeholder="Begin typing your offer letter template here..."
                                    />
                                </div>
                            </div>

                            <CardFooter className="bg-muted/20 border-t py-3 flex justify-between items-center text-xs text-muted-foreground">
                                <div><span className="font-semibold text-emerald-600">Tip:</span> Use markdown styles (*italic*, **bold**) for formatting in this mock view.</div>
                                <div>Words: {documentBody.split(/\s+/).length}</div>
                            </CardFooter>
                        </Card>
                    </div>

                </div>

            </div>
        </StandardPage>
    );
}
