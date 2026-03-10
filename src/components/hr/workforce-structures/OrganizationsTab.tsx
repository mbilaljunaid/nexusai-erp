import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { useState, useMemo } from "react";
import { TreeView, TreeNode } from "@/components/ui/tree-view";
import { Button } from "@/components/ui/button";
import { LayoutList, Network } from "lucide-react";
import { Card } from "@/components/ui/card";

export function OrganizationsTab() {
    const [viewMode, setViewMode] = useState<"list" | "tree">("list");

    const { data: orgs, isLoading } = useQuery({
        queryKey: ["hr-organizations"],
        queryFn: () => api.hr.structures.organizations.list(),
    });

    const treeData = useMemo(() => {
        if (!orgs) return [];

        const nodeMap: Record<string, TreeNode> = {};
        const roots: TreeNode[] = [];

        // 1. Initialize nodes
        orgs.forEach((org: any) => {
            nodeMap[org.id] = {
                id: org.id,
                label: org.name,
                children: [],
                data: org
            };
        });

        // 2. Build Hierarchy
        orgs.forEach((org: any) => {
            if (org.parentId && nodeMap[org.parentId]) {
                nodeMap[org.parentId].children?.push(nodeMap[org.id]);
            } else {
                roots.push(nodeMap[org.id]);
            }
        });

        return roots;
    }, [orgs]);

    const columns = [
        { key: "name", header: "Name", sortable: true, filterable: true },
        { key: "classificationCode", header: "Classification", sortable: true, filterable: true },
        {
            key: "activeStatus",
            header: "Status",
            render: (value: string) => (
                <Badge variant={value === "ACTIVE" ? "default" : "secondary"}>
                    {value || "ACTIVE"}
                </Badge>
            )
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value: string) => value ? format(new Date(value), "PP") : "-"
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Organizations</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md p-1 bg-muted/20">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setViewMode("list")}
                        >
                            <LayoutList className="h-4 w-4 mr-1" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === "tree" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setViewMode("tree")}
                        >
                            <Network className="h-4 w-4 mr-1" />
                            Tree
                        </Button>
                    </div>
                    {/* TODO: Add Create Button */}
                </div>
            </div>

            {viewMode === "list" ? (
                <DataTable
                    data={orgs || []}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Search organizations..."
                />
            ) : (
                <Card className="p-4 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex justify-center p-8">Loading hierarchy...</div>
                    ) : (
                        <TreeView data={treeData} />
                    )}
                </Card>
            )}
        </div>
    );
}
