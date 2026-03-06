import { cn } from "@/lib/utils";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Box, Layers, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetNode {
    id: string;
    assetNumber: string;
    description: string;
    children?: AssetNode[];
    parentId?: string | null;
}

const TreeNode = ({ node, level = 0 }: { node: AssetNode, level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div role="button" tabIndex={0}
                className={cn(`flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded cursor-pointer ${level === 0 ? 'font-medium' : 'text-sm'}`)}
                style={{ paddingLeft: `${level * 16 + 8}px` }} // eslint-disable-line react-dom/no-unsafe-inline-style
                onClick={() => setIsOpen(!isOpen)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
            >
                {hasChildren ? (
                    isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <span className="w-4" />
                )}

                {level === 0 ? <Layers className="h-4 w-4 text-primary" /> : <Box className="h-4 w-4 text-blue-500" />}

                <span className="truncate">
                    {node.assetNumber} <span className="text-muted-foreground font-normal">- {node.description}</span>
                </span>
            </div>

            {isOpen && hasChildren && (
                <div>
                    {node.children!.map(child => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function AssetHierarchyTree() {
    const { data: hierarchy, isLoading } = useQuery<any>({
        queryKey: ["/api/maintenance/assets/hierarchy"],
        queryFn: () => fetch("/api/maintenance/assets/hierarchy").then(r => r.json())
    });

    return (
        <Card className="h-full">
            <CardHeader className="py-4 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Asset Hierarchy</CardTitle>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" /> Manage
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-2">
                    {isLoading ? (
                        <div className="space-y-2 p-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-3/4 ml-4" />
                            <Skeleton className="h-8 w-1/2 ml-8" />
                        </div>
                    ) : hierarchy?.length > 0 ? (
                        hierarchy.map((rootNode: AssetNode) => (
                            <TreeNode key={rootNode.id} node={rootNode} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No asset hierarchy defined.</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
