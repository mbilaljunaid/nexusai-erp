import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  iconColor = "text-primary",
  loading = false
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{title}</p>
              <p className="text-2xl font-semibold mt-1 font-mono">{value}</p>
              {change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span className={`text-xs ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isPositive && '+'}{change}%
                  </span>
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-md bg-primary/10 ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
