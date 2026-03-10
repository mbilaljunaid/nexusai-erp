import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, File, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface TreeNode {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: TreeNode[];
    data?: any;
}

interface TreeViewProps {
    data: TreeNode[];
    onSelect?: (node: TreeNode) => void;
    className?: string;
}

interface TreeNodeProps {
    node: TreeNode;
    level: number;
    onSelect?: (node: TreeNode) => void;
}

const TreeNodeItem = ({ node, level, onSelect }: TreeNodeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect?.(node);
    };

    return (
        <div className="select-none">
            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={handleSelect}>
            <div
                            className={cn(
                                "flex items-center py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer transition-colors",
                                "text-sm"
                            )}
                        >
                            <Button variant="default"
                                onClick={handleToggle}
                                className={cn(
                                    "h-4 w-4 shrink-0 mr-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                                    !hasChildren && "invisible"
                                )}
                            >
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>

                            <span className="mr-2 text-muted-foreground">
                                {node.icon || (hasChildren ? <Folder className="h-4 w-4" /> : <File className="h-4 w-4" />)}
                            </span>

                            <span className="truncate">{node.label}</span>
                        </div>
            </Button>

            {
                isOpen && hasChildren && (
                    <div>
                        {node.children!.map((child) => (
                            <TreeNodeItem
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export function TreeView({ data, onSelect, className }: TreeViewProps) {
    return (
        <div className={cn("w-full border rounded-md p-2 bg-background", className)}>
            {data.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center">No items to display</div>
            ) : (
                data.map((node) => (
                    <TreeNodeItem
                        key={node.id}
                        node={node}
                        level={0}
                        onSelect={onSelect}
                    />
                ))
            )}
        </div>
    );
}
