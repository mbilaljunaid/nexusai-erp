import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Design-token colour map ─────────────────────────────────────────────────
// Instead of raw bg-*-50 classes that break in dark mode, we use opacity
// modifiers on Tailwind's palette capped to levels that render cleanly on both
// light and dark backgrounds. The `card` variant tints the whole Card; the
// `widget` variant tints only the icon bubble on a neutral card.
const COLOR_MAP = {
  default: { card: "", icon: "bg-primary/10", text: "text-primary", title: "" },
  blue: { card: "bg-blue-500/10", icon: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", title: "text-blue-900 dark:text-blue-200" },
  green: { card: "bg-green-500/10", icon: "bg-green-500/15", text: "text-green-600 dark:text-green-400", title: "text-green-900 dark:text-green-200" },
  emerald: { card: "bg-emerald-500/10", icon: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", title: "text-emerald-900 dark:text-emerald-200" },
  red: { card: "bg-red-500/10", icon: "bg-red-500/15", text: "text-red-600 dark:text-red-400", title: "text-red-900 dark:text-red-200" },
  rose: { card: "bg-rose-500/10", icon: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", title: "text-rose-900 dark:text-rose-200" },
  purple: { card: "bg-purple-500/10", icon: "bg-purple-500/15", text: "text-purple-600 dark:text-purple-400", title: "text-purple-900 dark:text-purple-200" },
  violet: { card: "bg-violet-500/10", icon: "bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", title: "text-violet-900 dark:text-violet-200" },
  indigo: { card: "bg-indigo-500/10", icon: "bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400", title: "text-indigo-900 dark:text-indigo-200" },
  amber: { card: "bg-amber-500/10", icon: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", title: "text-amber-900 dark:text-amber-200" },
  orange: { card: "bg-orange-500/10", icon: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", title: "text-orange-900 dark:text-orange-200" },
  teal: { card: "bg-teal-500/10", icon: "bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", title: "text-teal-900 dark:text-teal-200" },
  cyan: { card: "bg-cyan-500/10", icon: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-400", title: "text-cyan-900 dark:text-cyan-200" },
  slate: { card: "bg-slate-500/10", icon: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-400", title: "text-slate-900 dark:text-slate-200" },
} as const;

export type MetricCardColor = keyof typeof COLOR_MAP;

// ─── Props ───────────────────────────────────────────────────────────────────
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  /** Percentage change relative to previous period (positive = good by default) */
  change?: number;
  changeLabel?: string;
  /** Lucide icon to display */
  icon?: LucideIcon;
  /**
   * Semantic colour token. Drives card background (variant="card") or
   * icon bubble background (variant="widget"). Defaults to "default".
   */
  color?: MetricCardColor;
  /**
   * "card"   — full coloured Card background (Pattern 1, CarrierManager style)
   * "widget" — neutral card with coloured icon bubble only (Pattern 2, DashboardWidget style)
   */
  variant?: "card" | "widget";
  /** @deprecated Use `color` instead. Kept for backward-compat. */
  iconColor?: string;
  loading?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MetricCard({
  title,
  value,
  description,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  color = "default",
  variant = "widget",
  iconColor,
  loading = false,
  className,
}: MetricCardProps) {
  const tokens = COLOR_MAP[color];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const cardBg = variant === "card" ? tokens.card : "";
  // icon bubble: use mapped token; fall back to legacy iconColor prop if provided
  const iconBubbleBg = tokens.icon;
  const iconTextColor = iconColor ?? tokens.text;

  return (
    <Card
      className={cn("border-none shadow-sm", cardBg, className)}
      data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {loading ? (
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            {Icon && <Skeleton className="h-10 w-10 rounded-md" />}
          </div>
        </CardContent>
      ) : variant === "card" ? (
        // Pattern 1 — header + large value, full card tint
        <>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium", tokens.title)}>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", tokens.title)}>{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
                {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={cn("text-xs", isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground")}>
                  {isPositive && "+"}{change}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </CardContent>
        </>
      ) : (
        // Pattern 2 — icon bubble + value inline, neutral card
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{title}</p>
              <p className="text-2xl font-semibold mt-1 font-mono">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
              {change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span className={cn("text-xs", isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground")}>
                    {isPositive && "+"}{change}%
                  </span>
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                </div>
              )}
            </div>
            {Icon && (
              <div className={cn("p-3 rounded-md shrink-0", iconBubbleBg, iconTextColor)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
