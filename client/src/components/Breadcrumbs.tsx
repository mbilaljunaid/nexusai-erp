import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1 text-sm mb-4">
      <Link to="/">
        <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground" data-testid="link-home">
          <Home className="h-4 w-4" />
        </Button>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === items.length - 1 ? (
            <span className="text-foreground font-medium" data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
          ) : (
            <Link to={item.path}>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground" data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {item.label}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
