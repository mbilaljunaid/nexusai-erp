/**
 * Example Usage: Module Access Control Middleware
 * Demonstrates how to use module-based access control in routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireModule, requireAnyModule, requireAllModules } from '../middleware/moduleAccess';

const router = Router();

// =====================================================
// EXAMPLES: Single Module Required
// =====================================================

/**
 * HR Dashboard - requires 'core_hr' module
 */
router.get('/hr/dashboard', authenticate, requireModule('core_hr'), (req, res) => {
    res.json({ message: 'HR Dashboard - core_hr module enabled' });
});

/**
 * Payroll - requires 'payroll' module
 */
router.get('/payroll', authenticate, requireModule('payroll'), (req, res) => {
    res.json({ message: 'Payroll - payroll module enabled' });
});

/**
 * Finance Dashboard - requires 'finance' module
 */
router.get('/finance/dashboard', authenticate, requireModule('finance'), (req, res) => {
    res.json({ message: 'Finance Dashboard - finance module enabled' });
});

// =====================================================
// EXAMPLES: Any Module Required (OR logic)
// =====================================================

/**
 * Employee Management - requires either 'core_hr' OR 'recruitment'
 */
router.get(
    '/employees',
    authenticate,
    requireAnyModule(['core_hr', 'recruitment']),
    (req, res) => {
        res.json({ message: 'Employee Management - at least one HR module enabled' });
    }
);

/**
 * Financial Reports - requires either 'finance' OR 'analytics'
 */
router.get('/reports/financial', authenticate, requireAnyModule(['finance', 'analytics']), (req, res) => {
    res.json({ message: 'Financial Reports - finance or analytics enabled' });
});

// =====================================================
// EXAMPLES: All Modules Required (AND logic)
// =====================================================

/**
 * Advanced Compensation - requires BOTH 'core_hr' AND 'compensation'
 */
router.get(
    '/compensation/advanced',
    authenticate,
    requireAllModules(['core_hr', 'compensation']),
    (req, res) => {
        res.json({ message: 'Advanced Compensation - both modules enabled' });
    }
);

/**
 * Revenue Recognition - requires BOTH 'finance' AND 'revenue'
 */
router.get(
    '/revenue/recognition',
    authenticate,
    requireAllModules(['finance', 'revenue']),
    (req, res) => {
        res.json({ message: 'Revenue Recognition - both modules enabled' });
    }
);

/**
 * Full Supply Chain Analytics - requires 'scm', 'inventory', AND 'analytics'
 */
router.get(
    '/analytics/supply-chain',
    authenticate,
    requireAllModules(['scm', 'inventory', 'analytics']),
    (req, res) => {
        res.json({ message: 'Supply Chain Analytics - all modules enabled' });
    }
);

// =====================================================
// RESPONSE FORMAT WHEN MODULE NOT ENABLED
// =====================================================
/**
 * When a module is not enabled, the middleware returns:
 * 
 * HTTP 403 Forbidden
 * {
 *   "error": "Module not enabled",
 *   "message": "The core_hr module is not enabled for your organization",
 *   "moduleCode": "core_hr"
 * }
 * 
 * For requireAnyModule:
 * {
 *   "error": "Modules not enabled",
 *   "message": "None of the required modules (core_hr, recruitment) are enabled",
 *   "moduleCodes": ["core_hr", "recruitment"]
 * }
 * 
 * For requireAllModules:
 * {
 *   "error": "Required modules not enabled",
 *   "message": "The following modules must be enabled: compensation",
 *   "disabledModules": ["compensation"]
 * }
 */

export default router;
