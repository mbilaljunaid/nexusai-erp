import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface BreadcrumbNavItem {
    label: string;
    href?: string;
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    breadcrumbs?: BreadcrumbNavItem[];
}

export function PageHeader({
    className,
    title,
    description,
    actions,
    children,
    breadcrumbs,
    ...props
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4",
                className
            )}
            {...props}
        >
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={item.href || "#"}>{item.label}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
