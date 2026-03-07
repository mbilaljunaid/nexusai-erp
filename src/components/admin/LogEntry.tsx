import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LogEntryProps {
    log: {
        id?: string;
        level: 'error' | 'warn' | 'info' | 'debug';
        message: string;
        timestamp: string;
        user?: string;
        endpoint?: string;
        metadata?: Record<string, any>;
    };
}

export default function LogEntry({ log }: LogEntryProps) {
    const [expanded, setExpanded] = useState(false);

    const getLevelColor = () => {
        switch (log.level) {
            case 'error':
                return 'text-red-600 bg-red-500/10';
            case 'warn':
                return 'text-yellow-600 bg-yellow-500/10';
            case 'info':
                return 'text-blue-600 bg-blue-500/10';
            case 'debug':
                return 'text-muted-foreground bg-gray-500/10';
            default:
                return 'text-muted-foreground bg-gray-500/10';
        }
    };

    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

    return (
        <div className="px-4 py-3 hover:bg-gray-500/10">
            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => hasMetadata && setExpanded(!expanded)}>
            <div
                            className={cn(`flex items-start gap-3 ${hasMetadata ? 'cursor-pointer' : ''}`)}
                        >
                            {/* Expand Icon */}
                            {hasMetadata && (
                                <Button variant="default" className="flex-shrink-0 mt-1">
                                    {expanded ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground/70" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/70" />
                                    )}
                                </Button>
                            )}

                            {/* Level Badge */}
                            <span className={cn(`flex-shrink-0 px-2 py-1 rounded text-xs font-medium uppercase ${getLevelColor()}`)}>
                                {log.level}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground dark:text-gray-200 font-mono break-words">
                                    {log.message}
                                </p>
                                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{formatDateTime(log.timestamp)}</span>
                                    {log.user && (
                                        <>
                                            <span>•</span>
                                            <span>User: {log.user}</span>
                                        </>
                                    )}
                                    {log.endpoint && (
                                        <>
                                            <span>•</span>
                                            <span className="font-mono">{log.endpoint}</span>
                                        </>
                                    )}
                                </div>

                                {/* Expanded Metadata */}
                                {expanded && hasMetadata && (
                                    <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                                        <pre className="text-xs text-gray-100 overflow-x-auto">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
            </Button>
        </div>
    );
}
