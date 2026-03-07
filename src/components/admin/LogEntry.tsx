import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
                return 'text-gray-600 bg-gray-500/10';
            default:
                return 'text-gray-600 bg-gray-500/10';
        }
    };

    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

    return (
        <div className="px-4 py-3 hover:bg-gray-500/10">
            <div role="button" tabIndex={0}
                className={cn(`flex items-start gap-3 ${hasMetadata ? 'cursor-pointer' : ''}`)}
                onClick={() => hasMetadata && setExpanded(!expanded)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
            >
                {/* Expand Icon */}
                {hasMetadata && (
                    <button className="flex-shrink-0 mt-1">
                        {expanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                )}

                {/* Level Badge */}
                <span className={cn(`flex-shrink-0 px-2 py-1 rounded text-xs font-medium uppercase ${getLevelColor()}`)}>
                    {log.level}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-200 font-mono break-words">
                        {log.message}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
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
        </div>
    );
}
