import { Request, Response, NextFunction } from "./types";
import { enhancedAuditService } from "../services/enhanced-audit.service";

/**
 * Audit Middleware — captures before/after state for all mutating API calls.
 *
 * Before:  Reads req.body (the proposed new state).
 * After:   Reads the actual JSON response body for the true after-state.
 *
 * Writes to admin_logs (not the old auditLogs table) so before_state/after_state
 * columns are populated correctly.
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only audit state-mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Capture before-state snapshot: the current request body (what client is sending)
    const beforePayload = req.body && Object.keys(req.body).length > 0
        ? JSON.parse(JSON.stringify(req.body))  // deep-clone to avoid mutation
        : null;

    // Intercept res.json to capture the response body as after-state
    const originalJson = res.json.bind(res);
    let capturedAfterState: any = null;

    res.json = function (body: any) {
        capturedAfterState = typeof body === 'object' ? body : { value: body };
        return originalJson(body);
    };

    // Intercept res.send for non-JSON responses
    const originalSend = res.send.bind(res);
    res.send = function (body: any) {
        if (!capturedAfterState && body) {
            try {
                capturedAfterState = typeof body === 'string' ? JSON.parse(body) : body;
            } catch {
                capturedAfterState = { raw: String(body).slice(0, 500) };
            }
        }
        return originalSend(body);
    };

    res.on('finish', () => {
        const success = res.statusCode >= 200 && res.statusCode < 300;
        const userId = (req as any).user?.id || 'anonymous';
        const userEmail = (req as any).user?.email;
        const tenantId = enhancedAuditService.extractTenantId(req);

        enhancedAuditService.record({
            actorId: userId,
            actorEmail: userEmail,
            actorType: 'user',
            action: `${req.method} ${req.path}`,
            resourceType: req.path.split('/')[2] || req.path,  // e.g. "invoices"
            resourceId: req.params?.id,
            intent: `${req.method} request to ${req.path}`,
            beforeState: beforePayload,
            afterState: success ? capturedAfterState : null,
            details: success ? undefined : `HTTP ${res.statusCode}`,
            tenantId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        }).catch(console.error);
    });

    next();
};
