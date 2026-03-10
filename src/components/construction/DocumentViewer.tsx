import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut, RotateCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attachment {
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

interface DocumentViewerProps {
    attachment: Attachment | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DocumentViewer({ attachment, isOpen, onClose }: DocumentViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    if (!attachment) return null;

    const isPDF = attachment.fileType === "application/pdf";
    const isImage = attachment.fileType.startsWith("image/");

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = attachment.url;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenExternal = () => {
        window.open(attachment.url, "_blank");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 truncate">
                            {attachment.filename}
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {(attachment.fileSize / 1024).toFixed(2)} KB • Uploaded by {attachment.uploadedBy} on{" "}
                        {formatDate(attachment.uploadedAt)}
                    </div>
                </DialogHeader>

                {/* Toolbar */}
                <div className="flex items-center gap-2 border-b pb-3">
                    {isImage && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoom(Math.max(25, zoom - 25))}
                                disabled={zoom <= 25}
                            >
                                <ZoomOut className="h-4 w-4 mr-1" />
                                Zoom Out
                            </Button>
                            <span className="text-sm font-mono">{zoom}%</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoom(Math.min(200, zoom + 25))}
                                disabled={zoom >= 200}
                            >
                                <ZoomIn className="h-4 w-4 mr-1" />
                                Zoom In
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRotation((rotation + 90) % 360)}
                            >
                                <RotateCw className="h-4 w-4 mr-1" />
                                Rotate
                            </Button>
                        </>
                    )}
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open in New Tab
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-muted/30 rounded-lg p-4">
                    {isPDF && (
                        <div className="h-full flex items-center justify-center">
                            <iframe
                                src={attachment.url}
                                className="w-full h-full border-0 rounded"
                                title={attachment.filename}
                            />
                        </div>
                    )}

                    {isImage && (
                        <div className="h-full flex items-center justify-center">
                            <img
                                src={attachment.url}
                                alt={attachment.filename}
                                className="max-w-full max-h-full object-contain"
                                style={{
                                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                    transition: "transform 0.2s ease"
                                }}
                            />
                        </div>
                    )}

                    {!isPDF && !isImage && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="text-muted-foreground">
                                <p className="text-lg font-medium mb-2">Preview not available</p>
                                <p className="text-sm">
                                    This file type cannot be previewed in the browser.
                                </p>
                            </div>
                            <Button onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download to View
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
