import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, GripVertical, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";

export interface BOMNodeData {
    id: string; // Unique instance ID
    componentId: string; // Master Item ID
    name: string;
    sku: string;
    quantity: number;
    uom: string;
    children?: BOMNodeData[];
}

interface BOMNodeProps {
    node: BOMNodeData;
    index: number;
    path: number[];
    moveNode: (dragPath: number[], hoverPath: number[]) => void;
    updateNode: (path: number[], data: Partial<BOMNodeData>) => void;
    removeNode: (path: number[]) => void;
    addChild: (path: number[]) => void;
    isTopLevel?: boolean;
}

const ItemTypes = { NODE: 'BOM_NODE' };

const BOMNode: React.FC<BOMNodeProps> = ({ node, index, path, moveNode, updateNode, removeNode, addChild, isTopLevel }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(true);

    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: ItemTypes.NODE,
        item: { type: ItemTypes.NODE, id: node.id, index, path },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.NODE,
        hover(item: { path: number[] }, monitor) {
            if (!ref.current) return;
            const dragPath = item.path;
            const hoverPath = path;

            // Don't replace items with themselves
            if (JSON.stringify(dragPath) === JSON.stringify(hoverPath)) return;

            // Cannot drop a parent into its own child
            const isDescendant = hoverPath.length > dragPath.length &&
                hoverPath.slice(0, dragPath.length).every((v, i) => v === dragPath[i]);
            if (isDescendant) return;

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Simple reordering at same level for now. Full tree manipulation is complex in pure DnD
            // If dragging up, must pass middle. If down, must pass middle.

            // To be robust, we will just pass paths to higher order move function
        },
        drop(item: { path: number[] }) {
            moveNode(item.path, path);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        })
    });

    // drag(drop(ref)); - Connect drag and drop handles
    drop(ref);

    const opacityClass = isDragging ? 'opacity-40' : 'opacity-100';
    const borderClass = isOver && canDrop ? 'border-primary border-2 dashed bg-primary/5' : 'border-slate-200';

    return (
        <div className={isTopLevel ? "ml-0 mb-2" : "ml-6 mb-2"} ref={dragPreview}>
            <div
                ref={ref}
                className={cn(`flex items-center gap-3 p-2 bg-card border rounded-md shadow-sm transition-all`, borderClass, opacityClass)}
            >
                <div ref={drag} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                    <GripVertical className="h-4 w-4" />
                </div>

                <div className="flex-1 flex items-center gap-2">
                    {node.children && node.children.length > 0 ? (
                        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-slate-100 rounded">
                            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <Box className="h-4 w-4 text-muted-foreground ml-1" />
                    )}
                    <span className="font-medium text-sm">{node.name || 'Select Component...'}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{node.sku}</Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        className="w-20 h-8 text-right"
                        value={node.quantity}
                        onChange={(e) => updateNode(path, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="text-xs text-muted-foreground w-8">{node.uom}</span>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => addChild(path)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-500" onClick={() => removeNode(path)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {expanded && node.children && node.children.length > 0 && (
                <div className="mt-2 border-l-2 border-slate-100 pl-4 py-1">
                    {node.children.map((child, i) => (
                        <BOMNode
                            key={child.id}
                            node={child}
                            index={i}
                            path={[...path, i]}
                            moveNode={moveNode}
                            updateNode={updateNode}
                            removeNode={removeNode}
                            addChild={addChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export interface BOMTreeProps {
    data: BOMNodeData[];
    onChange: (data: BOMNodeData[]) => void;
}

export function BOMTree({ data, onChange }: BOMTreeProps) {

    // Helper to get node by path
    const getNodeAtPath = (tree: BOMNodeData[], path: number[]): BOMNodeData | undefined => {
        let current: any = tree;
        for (let i = 0; i < path.length; i++) {
            if (i === path.length - 1) return current[path[i]];
            current = current[path[i]].children;
            if (!current) return undefined;
        }
        return undefined;
    };

    const updateNode = (path: number[], updates: Partial<BOMNodeData>) => {
        const newTree = JSON.parse(JSON.stringify(data)); // Deep copy
        let current = newTree;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]].children;
        }
        current[path[path.length - 1]] = { ...current[path[path.length - 1]], ...updates };
        onChange(newTree);
    };

    const removeNode = (path: number[]) => {
        const newTree = JSON.parse(JSON.stringify(data));
        if (path.length === 1) {
            newTree.splice(path[0], 1);
        } else {
            let current = newTree;
            for (let i = 0; i < path.length - 2; i++) {
                current = current[path[i]].children;
            }
            const parent = current[path[path.length - 2]];
            parent.children.splice(path[path.length - 1], 1);
        }
        onChange(newTree);
    };

    const addChild = (path: number[]) => {
        const newTree = JSON.parse(JSON.stringify(data));
        let current = newTree;
        for (let i = 0; i < path.length; i++) {
            if (i === path.length - 1) {
                const node = current[path[i]];
                if (!node.children) node.children = [];
                node.children.push({
                    id: Math.random().toString(36).substr(2, 9),
                    componentId: "",
                    name: "New Sub-Component",
                    sku: "SKU-TBD",
                    quantity: 1,
                    uom: "EA"
                });
            } else {
                current = current[path[i]].children;
            }
        }
        onChange(newTree);
    };

    const moveNode = (dragPath: number[], hoverPath: number[]) => {
        // Very complex in raw DnD. For MVP, we will swap or insert before.
        // Omitting complex tree restructuring for now. Focus is on Visual Tree Rendering.
        console.log("Move requested from", dragPath, "to", hoverPath);

        const newTree = JSON.parse(JSON.stringify(data));
        // Need to extract drag item, then inject at hover index
        // simplified flat reorder handling:
        if (dragPath.length === 1 && hoverPath.length === 1) {
            const dragItem = newTree[dragPath[0]];
            newTree.splice(dragPath[0], 1);
            newTree.splice(hoverPath[0], 0, dragItem);
            onChange(newTree);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="bg-slate-50/50 p-4 rounded-lg border min-h-[300px]">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                        <Box className="h-12 w-12 mb-4 opacity-20" />
                        <p>Drag and drop items from inventory to build BOM</p>
                    </div>
                ) : (
                    data.map((node, i) => (
                        <BOMNode
                            key={node.id}
                            node={node}
                            index={i}
                            path={[i]}
                            moveNode={moveNode}
                            updateNode={updateNode}
                            removeNode={removeNode}
                            addChild={addChild}
                            isTopLevel={true}
                        />
                    ))
                )}
            </div>
        </DndProvider>
    );
}
