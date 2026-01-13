import React from "react";

interface StandardPageProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export function StandardPage({ title, description, actions, children }: StandardPageProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <div>{children}</div>
        </div>
    );
}
