import React from 'react';

interface StandardDashboardProps {
    header?: {
        title: string;
        description?: string;
    };
    children: React.ReactNode;
}

export function StandardDashboard({ header, children }: StandardDashboardProps) {
    return (
        <div className="p-6 space-y-6">
            {header && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{header.title}</h1>
                        {header.description && (
                            <p className="text-muted-foreground">{header.description}</p>
                        )}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
