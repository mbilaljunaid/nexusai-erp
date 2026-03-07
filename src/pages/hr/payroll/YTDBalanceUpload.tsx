import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    UploadCloud,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Download,
    RefreshCw,
    Database,
    ListChecks
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function YTDBalanceUpload() {
    const { toast } = useToast();
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'validating' | 'review' | 'importing' | 'complete'>('idle');
    const [progress, setProgress] = useState(0);

    const handleUpload = () => {
        setUploadState('uploading');
        let current = 0;
        const interval = setInterval(() => {
            current += 10;
            setProgress(current);
            if (current >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setUploadState('review');
                    setProgress(0);
                }, 500);
            }
        }, 150);
    };

    const handleImport = () => {
        setUploadState('importing');
        let current = 0;
        const interval = setInterval(() => {
            current += 5;
            setProgress(current);
            if (current >= 100) {
                clearInterval(interval);
                setUploadState('complete');
                toast({
                    title: "Import Successful",
                    description: "YTD Balances have been initialized for 428 employees.",
                });
            }
        }, 200);
    };

    const reset = () => {
        setUploadState('idle');
        setProgress(0);
    };

    return (
        <StandardPage
            title="Balance Initialization"
            description="Upload mid-year YTD balances for new implementations or legal entity transfers."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Payroll', href: '/hr/payroll/workbench' },
                { label: 'Balance Upload' }
            ]}
        >
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Information Header */}
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-sm text-blue-900 dark:text-blue-200">
                    <Database className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <p className="font-semibold mb-1">Legacy System Cutover</p>
                        <p className="text-xs leading-relaxed">
                            Use this utility to load Year-to-Date (YTD), Quarter-to-Date (QTD), and Inception-to-Date (ITD) balances from your legacy payroll provider prior to your first live run in NexusAI. Values loaded here will trigger tax cap limits.
                        </p>
                    </div>
                </div>

                {uploadState === 'idle' && (
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
                                <FileSpreadsheet className="h-8 w-8 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Upload Balance File (.csv)</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Ensure your file formatting matches the NexusAI standard template. Maximum file size 50MB.</p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button variant="outline" className="border-teal-500/30 text-teal-700 hover:bg-teal-500/10">
                                    <Download className="mr-2 h-4 w-4" /> Download Template
                                </Button>
                                <Button className="bg-teal-600 hover:bg-teal-700 cursor-pointer relative overflow-hidden" onClick={handleUpload}>
                                    <UploadCloud className="mr-2 h-4 w-4" /> Select File
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(uploadState === 'uploading' || uploadState === 'validating' || uploadState === 'importing') && (
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardContent className="p-8 text-center space-y-6">
                            <RefreshCw className="h-12 w-12 text-teal-600 animate-spin mx-auto" />
                            <div>
                                <h3 className="text-lg font-bold">
                                    {uploadState === 'uploading' ? 'Uploading File...' :
                                        uploadState === 'validating' ? 'Validating Records...' : 'Importing Balances...'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">Please do not close this window.</p>
                            </div>
                            <Progress value={progress} className="h-2 w-full max-w-md mx-auto" />
                        </CardContent>
                    </Card>
                )}

                {uploadState === 'review' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-amber-500/30 shadow-sm bg-gradient-to-br from-white to-orange-50/30 dark:from-zinc-950 dark:to-orange-950/10">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ListChecks className="h-5 w-5 text-amber-600" /> Data Validation Summary
                                </CardTitle>
                                <CardDescription>Review the analysis of your uploaded file before committing to the database.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="p-4 bg-card dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm text-center">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Rows</p>
                                        <p className="text-3xl font-black">1,452</p>
                                    </div>
                                    <div className="p-4 bg-card dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm text-center">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Employees</p>
                                        <p className="text-3xl font-black">428</p>
                                    </div>
                                    <div className="p-4 bg-green-500/10 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900/50 shadow-sm text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <p className="text-sm font-semibold text-green-700 dark:text-green-500 uppercase tracking-wider mb-1">Valid Records</p>
                                        <p className="text-3xl font-black text-green-700 dark:text-green-400">1,449</p>
                                    </div>
                                    <div className="p-4 bg-red-500/10 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                        <p className="text-sm font-semibold text-red-700 dark:text-red-500 uppercase tracking-wider mb-1">Errors</p>
                                        <p className="text-3xl font-black text-red-700 dark:text-red-400">3</p>
                                    </div>
                                </div>

                                <h4 className="font-semibold text-sm mb-3">Identified Exceptions</h4>
                                <div className="bg-card dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg overflow-hidden flex flex-col">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <div className="col-span-1">Row</div>
                                        <div className="col-span-2">Emp ID</div>
                                        <div className="col-span-4">Element Mapping</div>
                                        <div className="col-span-5">Error Reason</div>
                                    </div>
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                                        <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-zinc-500/10 dark:hover:bg-zinc-800/50">
                                            <div className="col-span-1 text-muted-foreground">42</div>
                                            <div className="col-span-2 font-mono">N1102</div>
                                            <div className="col-span-4">Legacy_401k_Catchup</div>
                                            <div className="col-span-5 text-red-600 flex items-center gap-1.5"><XCircle className="h-4 w-4 shrink-0" /> Element does not exist in target system.</div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-zinc-500/10 dark:hover:bg-zinc-800/50">
                                            <div className="col-span-1 text-muted-foreground">185</div>
                                            <div className="col-span-2 font-mono">N0899</div>
                                            <div className="col-span-4">Regular Salary</div>
                                            <div className="col-span-5 text-amber-600 flex items-center gap-1.5"><AlertCircle className="h-4 w-4 shrink-0" /> Employee is terminated. Warning only.</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t bg-muted/10 pt-6">
                                <Button variant="outline" onClick={reset}>Cancel / Upload New File</Button>
                                <Button className="bg-teal-600 hover:bg-teal-700 shadow-md" onClick={handleImport}>
                                    Import 1,449 Valid Records
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {uploadState === 'complete' && (
                    <Card className="border-green-500/30 bg-green-500/10 dark:bg-green-950/20 text-center py-12">
                        <CardContent className="space-y-4">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">Initialization Complete</h2>
                            <p className="text-green-700 dark:text-green-300 max-w-sm mx-auto">
                                Balances successfully committed to the database. You can view these under individual employee tax cards.
                            </p>
                            <div className="pt-6">
                                <Button variant="outline" className="border-green-600/30 text-green-700 hover:bg-green-500/15 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/50" onClick={reset}>
                                    Upload Another File
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </StandardPage>
    );
}
