import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFExportButtonProps {
    endpoint: string;
    filename?: string;
    label?: string;
    variant?: "default" | "outline" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    disabled?: boolean;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function PDFExportButton({
    endpoint,
    filename,
    label = "Export PDF",
    variant = "outline",
    size = "sm",
    className,
    disabled = false,
    onSuccess,
    onError
}: PDFExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/pdf"
                }
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Get filename from Content-Disposition header or use provided filename
            let downloadFilename = filename;
            const contentDisposition = response.headers.get("Content-Disposition");
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch) {
                    downloadFilename = filenameMatch[1];
                }
            }

            // Default filename if none provided
            if (!downloadFilename) {
                downloadFilename = `export_${Date.now()}.pdf`;
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = downloadFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: `${downloadFilename} has been downloaded.`
            });

            onSuccess?.();
        } catch (error: any) {
            const errorMessage = error.message || "Failed to export PDF";
            toast({
                title: "Export Failed",
                description: errorMessage,
                variant: "destructive"
            });
            onError?.(errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleExport}
            disabled={disabled || isExporting}
        >
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    {label}
                </>
            )}
        </Button>
    );
}
