import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, CheckCircle2, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUpload {
    file: File;
    progress: number;
    status: "pending" | "uploading" | "complete" | "error";
    error?: string;
}

interface DocumentUploadProps {
    onUploadComplete?: (files: any[]) => void;
    maxFileSize?: number; // in bytes
    maxFiles?: number;
    acceptedFileTypes?: string[];
    recordId?: string;
}

export function DocumentUpload({
    onUploadComplete,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 10,
    acceptedFileTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    recordId
}: DocumentUploadProps) {
    const { toast } = useToast();
    const [uploads, setUploads] = useState<FileUpload[]>([]);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Handle rejected files
        rejectedFiles.forEach(({ file, errors }) => {
            errors.forEach((error: any) => {
                if (error.code === "file-too-large") {
                    toast({
                        title: "File too large",
                        description: `${file.name} exceeds ${maxFileSize / 1024 / 1024}MB limit`,
                        variant: "destructive"
                    });
                } else if (error.code === "file-invalid-type") {
                    toast({
                        title: "Invalid file type",
                        description: `${file.name} is not a supported file type`,
                        variant: "destructive"
                    });
                }
            });
        });

        // Add accepted files to upload queue
        const newUploads: FileUpload[] = acceptedFiles.map(file => ({
            file,
            progress: 0,
            status: "pending"
        }));

        setUploads(prev => [...prev, ...newUploads]);

        // Start uploading
        newUploads.forEach(upload => uploadFile(upload));
    }, [maxFileSize, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: maxFileSize,
        maxFiles,
        accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
    });

    const uploadFile = async (upload: FileUpload) => {
        const formData = new FormData();
        formData.append("file", upload.file);
        if (recordId) {
            formData.append("recordId", recordId);
        }

        try {
            setUploads(prev => prev.map(u =>
                u.file.name === upload.file.name
                    ? { ...u, status: "uploading", progress: 0 }
                    : u
            ));

            // Simulate upload progress (in production, use XMLHttpRequest to track actual progress)
            const progressInterval = setInterval(() => {
                setUploads(prev => prev.map(u =>
                    u.file.name === upload.file.name && u.progress < 90
                        ? { ...u, progress: u.progress + 10 }
                        : u
                ));
            }, 200);

            const response = await fetch("/api/construction/compliance/attachments", {
                method: "POST",
                body: formData
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const result = await response.json();

            setUploads(prev => prev.map(u =>
                u.file.name === upload.file.name
                    ? { ...u, status: "complete", progress: 100 }
                    : u
            ));

            toast({
                title: "Upload successful",
                description: `${upload.file.name} uploaded successfully`
            });

            if (onUploadComplete) {
                onUploadComplete([result]);
            }
        } catch (error) {
            setUploads(prev => prev.map(u =>
                u.file.name === upload.file.name
                    ? { ...u, status: "error", error: "Upload failed" }
                    : u
            ));

            toast({
                title: "Upload failed",
                description: `Failed to upload ${upload.file.name}`,
                variant: "destructive"
            });
        }
    };

    const removeUpload = (fileName: string) => {
        setUploads(prev => prev.filter(u => u.file.name !== fileName));
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("image/")) return ImageIcon;
        if (fileType.includes("pdf")) return FileText;
        return File;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <Card
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed cursor-pointer transition-colors",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted"
                )}
            >
                <CardContent className="flex flex-col items-center justify-center py-10">
                    <input {...getInputProps()} />
                    <Upload className={cn("h-10 w-10 mb-4", isDragActive ? "text-primary" : "text-muted-foreground")} />
                    <p className="text-sm font-medium mb-1">
                        {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                        or click to browse (max {maxFileSize / 1024 / 1024}MB per file)
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline">PDF</Badge>
                        <Badge variant="outline">Images</Badge>
                        <Badge variant="outline">Excel</Badge>
                        <Badge variant="outline">Word</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Upload list */}
            {uploads.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium">
                        Uploads ({uploads.filter(u => u.status === "complete").length}/{uploads.length})
                    </div>
                    {uploads.map((upload, index) => {
                        const FileIcon = getFileIcon(upload.file.type);
                        return (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium truncate">{upload.file.name}</span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    {formatFileSize(upload.file.size)}
                                                </span>
                                            </div>

                                            {upload.status === "uploading" && (
                                                <div className="space-y-1">
                                                    <Progress value={upload.progress} className="h-1.5" />
                                                    <div className="text-xs text-muted-foreground">
                                                        Uploading... {upload.progress}%
                                                    </div>
                                                </div>
                                            )}

                                            {upload.status === "complete" && (
                                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Upload complete
                                                </div>
                                            )}

                                            {upload.status === "error" && (
                                                <div className="flex items-center gap-1 text-red-600 text-xs">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {upload.error || "Upload failed"}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex-shrink-0"
                                            onClick={() => removeUpload(upload.file.name)} aria-label="Close"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
