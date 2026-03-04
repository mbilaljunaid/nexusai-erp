import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Step = "upload" | "map" | "validate" | "import" | "complete";

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export default function BulkImportWizard() {
    const [currentStep, setCurrentStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [importType, setImportType] = useState<"party" | "item">("party");
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [importProgress, setImportProgress] = useState(0);
    const [importedCount, setImportedCount] = useState(0);

    // Import mutation
    const importMutation = useMutation({
        mutationFn: async () => {
            if (!file) throw new Error("No file selected");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("mapping", JSON.stringify(fieldMapping));

            const res = await fetch(`/api/mdm/bulk/import/${importType}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Import failed");
            return res.json();
        },
        onSuccess: (data) => {
            setImportedCount(data.imported || 0);
            setCurrentStep("complete");
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setCurrentStep("map");
        }
    };

    const handleValidate = () => {
        // Mock validation
        const errors: ValidationError[] = [
            { row: 5, field: "email", message: "Invalid email format" },
            { row: 12, field: "phone", message: "Phone number required" },
        ];
        setValidationErrors(errors);
        setCurrentStep("validate");
    };

    const handleImport = () => {
        setCurrentStep("import");

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setImportProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                importMutation.mutate();
            }
        }, 200);
    };

    const steps = [
        { id: "upload", label: "Upload File" },
        { id: "map", label: "Map Fields" },
        { id: "validate", label: "Validate" },
        { id: "import", label: "Import" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

    return (
        <StandardPage title="Bulk Import Wizard">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Import master data from CSV files
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${idx <= currentStepIndex
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted bg-background"
                                }`}
                        >
                            {idx < currentStepIndex ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <span>{idx + 1}</span>
                            )}
                        </div>
                        <span className="ml-2 text-sm font-medium">{step.label}</span>
                        {idx < steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            {currentStep === "upload" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Upload File</CardTitle>
                        <CardDescription>Select a CSV file to import</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="importType" className="block text-sm font-medium mb-2">
                                Import Type
                            </label>
                            <Select value={importType} onValueChange={(v: "party" | "item") => setImportType(v)}>
                                <SelectTrigger id="importType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="party">Party (Customers/Suppliers)</SelectItem>
                                    <SelectItem value="item">Item (Products)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-2 border-dashed rounded-lg p-12 text-center">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Button variant="outline" asChild>
                                    <span>Choose CSV File</span>
                                </Button>
                            </label>
                            <p className="text-sm text-muted-foreground mt-2">
                                Upload a CSV file with master data
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === "map" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Map Fields</CardTitle>
                        <CardDescription>Map CSV columns to database fields</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <FileText className="w-4 h-4" />
                            <AlertDescription>
                                File: <strong>{file?.name}</strong> ({(file?.size || 0) / 1024} KB)
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            {["name", "email", "phone", "address"].map((field) => (
                                <div key={field} className="grid grid-cols-2 gap-4 items-center">
                                    <label className="text-sm font-medium capitalize">{field}</label>
                                    <Select
                                        value={fieldMapping[field] || ""}
                                        onValueChange={(v) => setFieldMapping({ ...fieldMapping, [field]: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="col_a">Column A</SelectItem>
                                            <SelectItem value="col_b">Column B</SelectItem>
                                            <SelectItem value="col_c">Column C</SelectItem>
                                            <SelectItem value="col_d">Column D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        <Button onClick={handleValidate} className="w-full">
                            Next: Validate Data
                        </Button>
                    </CardContent>
                </Card>
            )}

            {currentStep === "validate" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Validation Results</CardTitle>
                        <CardDescription>Review validation errors before importing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {validationErrors.length === 0 ? (
                            <Alert>
                                <CheckCircle className="w-4 h-4" />
                                <AlertDescription>
                                    All records passed validation. Ready to import!
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                <Alert variant="destructive">
                                    <AlertTriangle className="w-4 h-4" />
                                    <AlertDescription>
                                        Found {validationErrors.length} validation errors
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    {validationErrors.map((error, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Row {error.row}</Badge>
                                                <span className="text-sm font-medium">{error.field}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={handleImport} className="flex-1">
                                Proceed with Import
                            </Button>
                            <Button variant="outline" onClick={() => setCurrentStep("map")}>
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === "import" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 4: Importing...</CardTitle>
                        <CardDescription>Please wait while data is being imported</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={importProgress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground">
                            {importProgress}% complete
                        </p>
                    </CardContent>
                </Card>
            )}

            {currentStep === "complete" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Complete!</CardTitle>
                        <CardDescription>Your data has been successfully imported</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <CheckCircle className="w-4 h-4" />
                            <AlertDescription>
                                Successfully imported <strong>{importedCount}</strong> records
                            </AlertDescription>
                        </Alert>

                        <Button onClick={() => window.location.reload()} className="w-full">
                            Import Another File
                        </Button>
                    </CardContent>
                </Card>
            )}
        </StandardPage>
    );
}
