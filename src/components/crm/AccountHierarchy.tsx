import { useQuery} from"@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle} from"@/components/ui/card";
import { GitCommit, GitPullRequest, Building2, ArrowRight} from"lucide-react";
import { Link} from"wouter";
import { Badge} from"@/components/ui/badge";
import { Button} from"@/components/ui/button";

interface AccountNode {
    id: string;
    name: string;
    industry?: string;
    annualRevenue?: string;
    parentAccountId?: string | null;
}

interface HierarchyData {
    current: AccountNode;
    parent: AccountNode | null;
    children: AccountNode[];
}

export function AccountHierarchy({ accountId}: { accountId: string}) {
    const { data: hierarchy, isLoading} = useQuery<HierarchyData>({
        queryKey: ["/api/crm/accounts", accountId,"hierarchy"],
        queryFn: async () => {
            const res = await fetch(`/api/crm/accounts/${accountId}/hierarchy`);
            if (!res.ok) throw new Error("Failed to fetch hierarchy");
            return res.json();
       }
   });

    if (isLoading) return <div className="p-4 animate-pulse">Loading Hierarchy...</div>;
    if (!hierarchy) return <div className="p-4 text-muted-foreground">No hierarchy data.</div>;

    const { current, parent, children} = hierarchy;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitPullRequest className="h-5 w-5" />
                    Account Hierarchy
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 relative">

                {/* Visual Connector Line for Parent */}
                {parent && (
                    <div className="absolute left-8 top-16 bottom-1/2 w-0.5 bg-border" />
                )}

                {/* Parent Node */}
                {parent && (
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-full border border-border">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="bg-muted/20 p-4 rounded-lg border border-border min-w-72">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2">Parent Account</Badge>
                                        <Link href={`/crm/accounts/${parent.id}`}>
                                            <a className="text-lg font-semibold hover:underline block">{parent.name}</a>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{parent.industry ||'No Industry'}</p>
                                    </div>
                                    <Link href={`/crm/accounts/${parent.id}`}>
                                        <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {/* Connecting Line Down */}
                        <div className="ml-8 h-8 w-0.5 bg-border" />
                    </div>
                )}

                {/* Current Node */}
                <div className="relative pl-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full border border-primary/20 ring-4 ring-primary/5">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div className="bg-background p-5 rounded-xl border border-primary/20 shadow-sm min-w-80">
                            <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">Current Account</Badge>
                            <h3 className="text-xl font-bold">{current.name}</h3>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <span>{current.industry ||'No Industry'}</span>
                                {current.annualRevenue && <span>${Number(current.annualRevenue).toLocaleString()}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Children Nodes */}
                {children.length > 0 && (
                    <div className="relative pt-4">
                        {/* Branching Line */}
                        <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />

                        <div className="space-y-6">
                            {children.map((child) => (
                                <div key={child.id} className="relative pl-16">
                                    {/* Horizontal connector */}
                                    <div className="absolute left-8 top-10 w-8 h-0.5 bg-border" />

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2 bg-muted rounded-full border border-border group-hover:border-primary/50 transition-colors">
                                            <GitCommit className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="bg-muted/10 p-3 rounded-lg border border-border min-w-72 hover:bg-muted/20 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Link href={`/crm/accounts/${child.id}`}>
                                                        <a className="font-medium hover:underline block">{child.name}</a>
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{child.industry}</p>
                                                </div>
                                                <Link href={`/crm/accounts/${child.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowRight className="h-3 w-3" /></Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {children.length === 0 && (
                    <div className="pl-16 text-muted-foreground text-sm italic py-4">
                        No child accounts found.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
