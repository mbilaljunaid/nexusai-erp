import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items = [] }: BreadcrumbProps) {
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", path: "/" },
    ...items,
  ];

  return (
    <nav className="flex items-center gap-1 mb-4 text-sm" aria-label="Breadcrumb" data-testid="breadcrumb-nav">
      {defaultBreadcrumbs.map((item, index) => (
        <div key={`${item.path}-${index}`} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {index === defaultBreadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium" data-testid={`breadcrumb-current-${item.label}`}>
              {item.label}
            </span>
          ) : (
            <Link to={item.path}>
              <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`breadcrumb-link-${item.label}`}>
                {item.label}
              </a>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
