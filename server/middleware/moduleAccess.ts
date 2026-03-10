/**
 * Module Access Control Middleware
 * Ensures users can only access enabled modules for their tenant
 * Phase 3: Onboarding Flow Backend
 */

import { Request, Response, NextFunction } from 'express';
import { ModuleService } from '../services/ModuleService';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        tenantId: string;
        role: string;
    };
}

/**
 * Middleware to check if a module is enabled for the tenant
 * Usage: router.get('/endpoint', authenticate, requireModule('hr'), handler)
 */
export function requireModule(moduleCode: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'No tenant associated with user',
                });
            }

            // Check if module is enabled for this tenant
            const isEnabled = await ModuleService.isModuleEnabledForTenant(tenantId, moduleCode);

            if (!isEnabled) {
                return res.status(403).json({
                    error: 'Module not enabled',
                    message: `The ${moduleCode} module is not enabled for your organization`,
                    moduleCode,
                });
            }

            // Module is enabled, proceed
            next();
        } catch (error) {
            console.error('Error checking module access:', error);
            res.status(500).json({
                error: 'Access check failed',
                message: 'Failed to verify module access',
            });
        }
    };
}

/**
 * Middleware to check if ANY of the specified modules is enabled
 * Usage: router.get('/endpoint', authenticate, requireAnyModule(['hr', 'payroll']), handler)
 */
export function requireAnyModule(moduleCodes: string[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'No tenant associated with user',
                });
            }

            // Check if any of the modules is enabled
            for (const moduleCode of moduleCodes) {
                const isEnabled = await ModuleService.isModuleEnabledForTenant(tenantId, moduleCode);
                if (isEnabled) {
                    next();
                    return;
                }
            }

            // None of the modules are enabled
            return res.status(403).json({
                error: 'Modules not enabled',
                message: `None of the required modules (${moduleCodes.join(', ')}) are enabled for your organization`,
                moduleCodes,
            });
        } catch (error) {
            console.error('Error checking module access:', error);
            res.status(500).json({
                error: 'Access check failed',
                message: 'Failed to verify module access',
            });
        }
    };
}

/**
 * Middleware to check if ALL specified modules are enabled
 * Usage: router.get('/endpoint', authenticate, requireAllModules(['hr', 'payroll']), handler)
 */
export function requireAllModules(moduleCodes: string[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'No tenant associated with user',
                });
            }

            // Check if all modules are enabled
            const checkResults = await Promise.all(
                moduleCodes.map(code => ModuleService.isModuleEnabledForTenant(tenantId, code))
            );

            const allEnabled = checkResults.every(result => result === true);

            if (!allEnabled) {
                const disabledModules = moduleCodes.filter((_, index) => !checkResults[index]);
                return res.status(403).json({
                    error: 'Required modules not enabled',
                    message: `The following modules must be enabled: ${disabledModules.join(', ')}`,
                    disabledModules,
                });
            }

            // All modules are enabled, proceed
            next();
        } catch (error) {
            console.error('Error checking module access:', error);
            res.status(500).json({
                error: 'Access check failed',
                message: 'Failed to verify module access',
            });
        }
    };
}

/**
 * Middleware to attach enabled modules to the request object
 * Useful for conditional feature rendering
 */
export async function attachEnabledModules(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            next();
            return;
        }

        const enabledModules = await ModuleService.getEnabledModulesForTenant(tenantId);

        // Attach to request for use in handlers
        (req as any).enabledModules = enabledModules;

        next();
    } catch (error) {
        console.error('Error fetching enabled modules:', error);
        // Don't fail the request, just continue without module data
        next();
    }
}
