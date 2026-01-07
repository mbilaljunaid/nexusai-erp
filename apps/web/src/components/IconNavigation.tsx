import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface IconNavigationProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function IconNavigation({ items, activeId, onSelect }: IconNavigationProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 text-center cursor-pointer ${
              isActive
                ? "ring-2 ring-primary bg-primary/5 border-primary"
                : "border-border hover:bg-muted hover:border-primary/50"
            }`}
            data-testid={`nav-${item.id}`}
          >
            <Icon className={`h-6 w-6 ${item.color}`} />
            <p className="text-sm font-medium">{item.label}</p>
          </button>
        );
      })}
    </div>
  );
}
