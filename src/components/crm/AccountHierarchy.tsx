import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyPlus, Network, Building2, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from '@/lib/formatters';
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccountNode {
    id: string;
    name: string;
    industry?: string;
    type?: string;
    parentAccountId?: string | null;
    children: AccountNode[];
}

interface HierarchyResponse {
    hierarchy: AccountNode[];
    flatNodes: AccountNode[];
}

function HierarchyNode({ node, level = 0, currentAccountId }: { node: AccountNode, level?: number, currentAccountId: string }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isCurrent = node.id === currentAccountId;

    return (
        <div className="relative">
            {/* Connector Line from Parent */}
            {level > 0 && (
                <div
                    className="absolute border-l-2 border-b-2 border-muted-foreground/30 rounded-bl-lg -left-6 -top-4 w-6 h-10"
                />
            )}

            <div className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all relative z-10",
                isCurrent
                    ? "bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary/20"
                    : "bg-card border-border hover:bg-muted/50"
            )}>
                {hasChildren ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mt-1 shrink-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                ) : (
                    <div className="h-6 w-6 mt-1 shrink-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className={cn("h-4 w-4 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                        <Link href={`/crm/accounts/${node.id}`}>
                            <a className={cn(
                                "font-semibold truncate hover:underline",
                                isCurrent && "text-primary font-bold"
                            )}>
                                {node.name}
                            </a>
                        </Link>
                        {isCurrent && <Badge variant="default" className="text-[10px] h-5 px-1.5">Current</Badge>}
                        {node.type && <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">{node.type}</Badge>}
                    </div>

                    {node.industry && (
                        <p className="text-xs text-muted-foreground truncate pl-6">
                            Industry: {node.industry}
                        </p>
                    )}
                </div>
            </div>

            {/* Render Children Recursively */}
            {hasChildren && isExpanded && (
                <div className="relative mt-2 pl-8">
                    {/* Vertical Connector Line for Children */}
                    <div
                        className="absolute w-px bg-muted-foreground/30 left-[15px] -top-2 bottom-6"
                    />

                    <div className="space-y-3">
                        {node.children.map((child) => (
                            <HierarchyNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                currentAccountId={currentAccountId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function AccountHierarchy({ accountId }: { accountId: string }) {
    const { data, isLoading } = useQuery<HierarchyResponse>({
        queryKey: ["/api/crm/accounts", accountId, "hierarchy"],
        queryFn: async () => {
            const res = await fetch(`/api/crm/accounts/${accountId}/hierarchy`);
            if (!res.ok) throw new Error("Failed to fetch hierarchy");
            return res.json();
        }
    });

    if (isLoading) return <div className="p-4 animate-pulse">Loading Hierarchy Tree...</div>;
    if (!data || !data.hierarchy.length) return <div className="p-4 text-muted-foreground">No hierarchy data found.</div>;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Network className="h-5 w-5 text-primary" />
                    Organizational Hierarchy
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
                <div className="min-w-[400px]">
                    {data.hierarchy.map((rootNode) => (
                        <HierarchyNode
                            key={rootNode.id}
                            node={rootNode}
                            currentAccountId={accountId}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
