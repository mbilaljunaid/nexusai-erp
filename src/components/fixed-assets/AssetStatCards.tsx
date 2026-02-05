
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Box, TrendingDown, Archive } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

import { Loader2 } from "lucide-react";

export function AssetStatCards({ stats, isLoading }: { stats?: any, isLoading?: boolean }) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="h-12" />
                        <CardContent className="h-16" />
                    </Card>
                ))}
            </div>
        );
    }

    const totalNBV = parseFloat(stats?.totalRecoverable || "0");
    const activeCount = stats?.activeCount || 0;
    const retiredCount = stats?.retiredCount || 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Asset Value"
                value={`$${totalNBV.toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="Net Book Value"
            />
            <StatCard
                title="Active Assets"
                value={activeCount.toString()}
                icon={<Box className="h-4 w-4 text-muted-foreground" />}
                description="Currently in service"
            />
            <StatCard
                title="YTD Depreciation"
                value="$0.00"
                icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
                description="Current Fiscal Year"
            />
            <StatCard
                title="Retired Assets"
                value={retiredCount.toString()}
                icon={<Archive className="h-4 w-4 text-muted-foreground" />}
                description="Disposed this year"
            />
        </div>
    );
}
