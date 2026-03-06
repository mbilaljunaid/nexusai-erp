import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, ZoomIn, ZoomOut, RotateCw, Maximize2, Home, Eye, EyeOff, Layers, Info, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BIMModel {
    id: string;
    name: string;
    version: string;
    uploadedBy: string;
    uploadedAt: string;
    fileSize: number;
    format: "RVT" | "IFC" | "NWD";
}

interface BIMViewerProps {
    projectId: string;
    modelId?: string;
    onClashDetected?: (clashes: any[]) => void;
}

/**
 * BIM Viewer Component
 * 
 * Integrates with Autodesk Forge Viewer API for 3D model visualization.
 * In production, this would use the actual Forge Viewer SDK.
 * 
 * Setup Instructions:
 * 1. Register app at https://forge.autodesk.com
 * 2. Get Client ID and Secret
 * 3. Implement token generation endpoint
 * 4. Load Forge Viewer SDK in index.html
 * 5. Add stylesheet and script tags for viewer library
 */
export function BIMViewer({ projectId, modelId, onClashDetected }: BIMViewerProps) {
    const viewerContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewer, setViewer] = useState<any>(null);
    const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<string[]>(["Architecture", "Structure", "MEP"]);

    // Mock models - in production, fetch from API
    const models: BIMModel[] = [
        {
            id: "model-001",
            name: "Main Building - Architecture",
            version: "v2.1",
            uploadedBy: "Sarah Chen",
            uploadedAt: "2026-02-10",
            fileSize: 250000000,
            format: "RVT"
        },
        {
            id: "model-002",
            name: "Main Building - Structure",
            version: "v1.8",
            uploadedBy: "John Martinez",
            uploadedAt: "2026-02-09",
            fileSize: 180000000,
            format: "RVT"
        },
        {
            id: "model-003",
            name: "Main Building - MEP",
            version: "v1.5",
            uploadedBy: "Mike Johnson",
            uploadedAt: "2026-02-08",
            fileSize: 320000000,
            format: "IFC"
        }
    ];

    useEffect(() => {
        // Initialize Forge Viewer
        // This is a placeholder - actual implementation would initialize Autodesk Forge Viewer
        const initializeViewer = async () => {
            setIsLoading(true);

            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In production:
            // 1. Get access token from backend
            // 2. Initialize Autodesk.Viewing.Initializer
            // 3. Create viewer instance
            // 4. Load URN from Forge Model Derivative API

            setIsLoading(false);
            setSelectedModel(models[0]);
        };

        initializeViewer();

        return () => {
            // Cleanup viewer on unmount
            if (viewer) {
                viewer.finish();
            }
        };
    }, [modelId]);

    const handleZoomIn = () => {
        if (viewer) {
            viewer.navigation.setZoomSpeed(1.2);
        }
    };

    const handleZoomOut = () => {
        if (viewer) {
            viewer.navigation.setZoomSpeed(0.8);
        }
    };

    const handleResetView = () => {
        if (viewer) {
            viewer.navigation.setView(viewer.navigation.getHomeView());
        }
    };

    const toggleLayer = (layer: string) => {
        setVisibleLayers(prev =>
            prev.includes(layer)
                ? prev.filter(l => l !== layer)
                : [...prev, layer]
        );

        // In production, this would use viewer.isolate() or viewer.hide()
    };

    const formatFileSize = (bytes: number) => {
        return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
    };

    return (
        <div className="space-y-4">
            {/* Viewer Controls */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Box className="h-5 w-5" />
                            BIM Viewer
                            {selectedModel && (
                                <Badge variant="outline" className="ml-2">
                                    {selectedModel.format}
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleZoomIn}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleZoomOut}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleResetView}>
                                <Home className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* 3D Viewer Container */}
                    <div
                        ref={viewerContainerRef}
                        className={cn(
                            "relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden border-2",
                            isLoading && "flex items-center justify-center"
                        )}
                    >
                        {isLoading ? (
                            <div className="text-center text-white">
                                <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
                                <p className="text-sm">Loading 3D Model...</p>
                                <p className="text-xs text-gray-400 mt-2">Initializing Autodesk Forge Viewer</p>
                            </div>
                        ) : (
                            <>
                                {/* Placeholder for actual viewer */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                    <div className="text-center text-white space-y-4">
                                        <Box className="h-24 w-24 mx-auto opacity-20" />
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">BIM Viewer Ready</h3>
                                            <p className="text-sm text-gray-400 max-w-md">
                                                Production setup requires Autodesk Forge API credentials.
                                                <br />
                                                Viewer will display 3D models (RVT, IFC, NWD formats).
                                            </p>
                                        </div>
                                        <div className="flex gap-2 justify-center text-xs">
                                            <Badge variant="secondary">Pan</Badge>
                                            <Badge variant="secondary">Orbit</Badge>
                                            <Badge variant="secondary">Zoom</Badge>
                                            <Badge variant="secondary">Select</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Viewer Overlays */}
                                <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-xs">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-3 w-3" />
                                        {selectedModel?.name} - {selectedModel?.version}
                                    </div>
                                </div>

                                {/* Coordinate Display */}
                                <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-xs font-mono">
                                    X: 0.00 | Y: 0.00 | Z: 0.00
                                </div>
                            </>
                        )}
                    </div>

                    {/* Model Info */}
                    {selectedModel && (
                        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Model</div>
                                    <div className="font-medium">{selectedModel.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Version</div>
                                    <div className="font-medium">{selectedModel.version}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Size</div>
                                    <div className="font-medium">{formatFileSize(selectedModel.fileSize)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Uploaded</div>
                                    <div className="font-medium">{selectedModel.uploadedAt}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Layer Controls & Model Selection */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Layer Visibility */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Layer Visibility
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {["Architecture", "Structure", "MEP", "Furniture", "Site"].map(layer => {
                            const isVisible = visibleLayers.includes(layer);
                            return (
                                <button
                                    key={layer}
                                    onClick={() => toggleLayer(layer)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors",
                                        isVisible
                                            ? "bg-primary/10 border-primary"
                                            : "bg-muted border-transparent"
                                    )}
                                >
                                    <span className="font-medium">{layer}</span>
                                    {isVisible ? (
                                        <Eye className="h-4 w-4 text-primary" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Model Selection */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            Available Models
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {models.map(model => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg border-2 transition-colors",
                                    selectedModel?.id === model.id
                                        ? "bg-primary/10 border-primary"
                                        : "bg-muted border-transparent hover:border-muted-foreground/20"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium text-sm">{model.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {model.version} • {formatFileSize(model.fileSize)}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {model.format}
                                    </Badge>
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
