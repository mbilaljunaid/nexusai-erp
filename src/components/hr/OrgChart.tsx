import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, ChevronDown } from "lucide-react";

interface OrgNode {
    personId: string;
    name: string;
    role: string;
    children?: OrgNode[];
}

interface OrgChartProps {
    data: OrgNode[];
}

export const OrgChart: React.FC<OrgChartProps> = ({ data }) => {
    return (
        <div className="space-y-4 p-4 overflow-x-auto min-w-max">
            {data.map(node => (
                <OrgTreeNode key={node.personId} node={node} level={0} />
            ))}
        </div>
    );
};

const OrgTreeNode: React.FC<{ node: OrgNode; level: number }> = ({ node, level }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="space-y-2">
            <div
                className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors max-w-md ml-${level * 8}`}
                style={{ marginLeft: `${level * 2}rem` }}
            >
                <Avatar className="h-10 w-10">
                    <AvatarFallback>{node.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold text-sm">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.role}</p>
                </div>
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {hasChildren && isExpanded && (
                <div className="space-y-2">
                    {node.children!.map(child => (
                        <OrgTreeNode key={child.personId} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
