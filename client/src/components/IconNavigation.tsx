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
          <Card
            key={item.id}
            className={`cursor-pointer transition-all ${
              isActive
                ? "ring-2 ring-primary bg-primary/5"
                : "hover-elevate"
            }`}
            onClick={() => onSelect(item.id)}
            role="button"
            tabIndex={0}
            data-testid={`nav-${item.id}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect(item.id);
              }
            }}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Icon className={`h-6 w-6 ${item.color}`} />
              <p className="text-sm font-medium">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
