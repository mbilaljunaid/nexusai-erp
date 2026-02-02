import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  description?: string;
}

interface ModuleNavProps {
  title: string;
  items: NavItem[];
}

export function ModuleNav({ title, items }: ModuleNavProps) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <Link key={item.href} to={item.href}>
              <div 
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all hover-elevate"
                data-testid={`nav-icon-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary" />
                <span className="text-xs font-medium text-center leading-tight text-foreground">
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-xs text-muted-foreground mt-1 text-center">{item.description}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}