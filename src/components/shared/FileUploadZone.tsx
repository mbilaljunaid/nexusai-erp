import { useCallback, useState } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    onValidationError?: (msg: string) => void;
    acceptedFormats?: string[];
    maxSizeMB?: number;
    className?: string;
    disabled?: boolean;
    currentFile?: File | null;
    uploadStatus?: "idle" | "uploading" | "success" | "error";
    errorMessage?: string;
}

export function FileUploadZone({
    onFileSelect,
    onFileRemove,
    onValidationError,
    acceptedFormats = [".csv", ".xlsx", ".xls", ".ofx", ".bai2", ".pdf"],
    maxSizeMB = 10,
    className,
    disabled = false,
    currentFile,
    uploadStatus = "idle",
    errorMessage
}: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File): string | null => {
        // Check file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            return `File size exceeds ${maxSizeMB}MB limit`;
        }

        // Check file format
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        if (acceptedFormats.length > 0 && !acceptedFormats.includes(extension)) {
            return `Invalid file format. Accepted: ${acceptedFormats.join(", ")}`;
        }

        return null;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const file = files[0];
            const error = validateFile(file);
            if (error) {
                setValidationError(error);
                onValidationError?.(error);
                return;
            }
            setValidationError(null);
            onFileSelect(file);
        }
    }, [disabled, onFileSelect, maxSizeMB, acceptedFormats]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const error = validateFile(file);
            if (error) {
                setValidationError(error);
                onValidationError?.(error);
                return;
            }
            setValidationError(null);
            onFileSelect(file);
        }
    }, [onFileSelect, maxSizeMB, acceptedFormats]);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className={cn("w-full", className)}>
            {!currentFile ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                        isDragging && !disabled && "border-primary bg-primary/5 scale-[1.02]",
                        !isDragging && "border-muted-foreground/25 hover:border-primary/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Upload className={cn(
                        "mx-auto h-12 w-12 mb-4",
                        isDragging ? "text-primary" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium mb-1">
                        {isDragging ? "Drop file here" : "Drag and drop file here"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                        or click to browse
                    </p>
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept={acceptedFormats.join(",")}
                        onChange={handleFileInput}
                        disabled={disabled}
                    />
                    <Label htmlFor="file-upload">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            Select File
                        </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-3">
                        Accepted formats: {acceptedFormats.join(", ")} • Max size: {maxSizeMB}MB
                    </p>
                    {validationError && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {validationError}
                        </p>
                    )}
                </div>
            ) : (
                <div className={cn(
                    "border rounded-lg p-4",
                    uploadStatus === "success" && "border-green-500 bg-green-500/10 dark:bg-green-950/20",
                    uploadStatus === "error" && "border-red-500 bg-red-500/10 dark:bg-red-950/20",
                    uploadStatus === "uploading" && "border-blue-500 bg-blue-500/10 dark:bg-blue-950/20"
                )}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            <File className={cn(
                                "h-10 w-10 flex-shrink-0",
                                uploadStatus === "success" && "text-green-600",
                                uploadStatus === "error" && "text-red-600",
                                uploadStatus === "uploading" && "text-blue-600",
                                uploadStatus === "idle" && "text-muted-foreground"
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{currentFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(currentFile.size)}
                                </p>
                                {uploadStatus === "uploading" && (
                                    <div className="mt-2">
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 animate-pulse w-2/3" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                                    </div>
                                )}
                                {uploadStatus === "success" && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                        <p className="text-xs text-green-600">Upload successful</p>
                                    </div>
                                )}
                                {uploadStatus === "error" && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                                        <p className="text-xs text-red-600">{errorMessage || "Upload failed"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {onFileRemove && uploadStatus !== "uploading" && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={onFileRemove} aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
