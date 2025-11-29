import { MetricCard } from "../MetricCard";
import { Users, DollarSign, Target, TrendingUp } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <MetricCard
        title="Total Leads"
        value="2,847"
        change={12.5}
        icon={Users}
      />
      <MetricCard
        title="Revenue"
        value="$128,450"
        change={8.2}
        icon={DollarSign}
      />
      <MetricCard
        title="Conversion Rate"
        value="24.8%"
        change={-2.1}
        icon={Target}
      />
      <MetricCard
        title="Active Projects"
        value="47"
        change={5}
        icon={TrendingUp}
      />
    </div>
  );
}
