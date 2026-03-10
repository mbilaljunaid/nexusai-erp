import { useEffect } from "react";

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
}

interface UsePerformanceMonitoringOptions {
    enabled?: boolean;
    threshold?: number; // milliseconds - log warning if exceeded
    onMetric?: (metric: PerformanceMetric) => void;
}

export function usePerformanceMonitoring(
    operationName: string,
    options: UsePerformanceMonitoringOptions = {}
) {
    const { enabled = true, threshold = 1000, onMetric } = options;

    const startTimer = () => {
        if (!enabled) return () => { };

        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            const metric: PerformanceMetric = {
                name: operationName,
                duration,
                timestamp: Date.now()
            };

            // Log to console if threshold exceeded
            if (duration > threshold) {
                console.warn(
                    `[Performance] ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
                );
            }

            // Send to analytics
            if (onMetric) {
                onMetric(metric);
            }

            // Send to backend analytics endpoint
            if (typeof window !== "undefined") {
                fetch("/api/analytics/performance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(metric)
                }).catch(err => console.error("Failed to send performance metric:", err));
            }
        };
    };

    return { startTimer };
}

// Hook for tracking API call performance
export function useAPIPerformanceTracking() {
    const trackAPICall = async <T,>(
        endpoint: string,
        fetchFn: () => Promise<T>
    ): Promise<T> => {
        const startTime = performance.now();

        try {
            const result = await fetchFn();
            const duration = performance.now() - startTime;

            // Log performance
            if (duration > 2000) {
                console.warn(`[API Performance] ${endpoint} took ${duration.toFixed(2)}ms`);
            }

            // Track metric
            fetch("/api/analytics/api-performance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpoint,
                    duration,
                    status: "success",
                    timestamp: Date.now()
                })
            }).catch(() => { });

            return result;
        } catch (error) {
            const duration = performance.now() - startTime;

            // Track error
            fetch("/api/analytics/api-performance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpoint,
                    duration,
                    status: "error",
                    timestamp: Date.now()
                })
            }).catch(() => { });

            throw error;
        }
    };

    return { trackAPICall };
}

// Hook for tracking user interactions
export function useAnalyticsTracking() {
    const trackEvent = (eventName: string, properties?: Record<string, any>) => {
        // Send to analytics backend
        fetch("/api/analytics/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: eventName,
                properties: properties || {},
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            })
        }).catch(err => console.error("Failed to track event:", err));
    };

    const trackComplianceExpiry = (action: "viewed" | "dismissed" | "actioned", daysUntilExpiry: number) => {
        trackEvent("compliance_expiry_alert", {
            action,
            daysUntilExpiry,
            category: "compliance"
        });
    };

    const trackCostCodeNavigation = (action: "expand" | "collapse" | "search", depth?: number) => {
        trackEvent("cost_code_navigation", {
            action,
            depth,
            category: "cost_codes"
        });
    };

    const trackDocumentAction = (action: "upload" | "download" | "preview" | "delete", fileType?: string) => {
        trackEvent("document_action", {
            action,
            fileType,
            category: "documents"
        });
    };

    return {
        trackEvent,
        trackComplianceExpiry,
        trackCostCodeNavigation,
        trackDocumentAction
    };
}

// Component for displaying performance metrics (admin/dev use)
export function PerformanceMetricsDisplay() {
    useEffect(() => {
        // Monitor page load performance
        if (typeof window !== "undefined" && "performance" in window) {
            window.addEventListener("load", () => {
                const perfData = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

                if (perfData) {
                    console.log("[Page Performance]", {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                        totalTime: perfData.loadEventEnd - perfData.fetchStart
                    });
                }
            });
        }
    }, []);

    return null; // This is a monitoring component with no UI
}
