/**
 * Industry & Module Management API Routes
 * Handles industry and module CRUD operations
 * Phase 3: Onboarding Flow Backend
 */

import { Router } from 'express';
import { IndustryService } from '../services/IndustryService';
import { ModuleService } from '../services/ModuleService';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// =====================================================
// INDUSTRY ROUTES
// =====================================================

/**
 * GET /api/industries
 * Get all active industries
 */
router.get('/', async (req, res) => {
    try {
        const industries = await IndustryService.getAllIndustries();

        res.json({
            success: true,
            industries,
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({ error: 'Failed to fetch industries' });
    }
});

/**
 * GET /api/industries/:code
 * Get industry by code
 */
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const industry = await IndustryService.getIndustryByCode(code);

        if (!industry) {
            return res.status(404).json({ error: 'Industry not found' });
        }

        res.json({
            success: true,
            industry,
        });
    } catch (error) {
        console.error('Error fetching industry:', error);
        res.status(500).json({ error: 'Failed to fetch industry' });
    }
});

/**
 * GET /api/industries/:industryId/modules
 * Get modules for an industry with recommendations
 */
router.get('/:industryId/modules', async (req, res) => {
    try {
        const { industryId } = req.params;
        const industryWithModules = await IndustryService.getIndustryWithModules(industryId);

        if (!industryWithModules) {
            return res.status(404).json({ error: 'Industry not found' });
        }

        res.json({
            success: true,
            data: industryWithModules,
        });
    } catch (error) {
        console.error('Error fetching industry modules:', error);
        res.status(500).json({ error: 'Failed to fetch industry modules' });
    }
});

// =====================================================
// MODULE ROUTES
// =====================================================

/**
 * GET /api/modules
 * Get all modules
 */
router.get('/modules', async (req, res) => {
    try {
        const { category } = req.query;

        let modules;
        if (category) {
            modules = await ModuleService.getModulesByCategory(category as string);
        } else {
            modules = await ModuleService.getAllModules();
        }

        res.json({
            success: true,
            modules,
        });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

/**
 * GET /api/modules/core
 * Get core modules (HR, Finance, etc.)
 */
router.get('/modules/core', async (req, res) => {
    try {
        const coreModules = await ModuleService.getCoreModules();

        res.json({
            success: true,
            modules: coreModules,
        });
    } catch (error) {
        console.error('Error fetching core modules:', error);
        res.status(500).json({ error: 'Failed to fetch core modules' });
    }
});

/**
 * GET /api/modules/:moduleId/stats
 * Get usage statistics for a module (admin only)
 */
router.get('/modules/:moduleId/stats', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const { moduleId } = req.params;
        const stats = await ModuleService.getModuleStats(moduleId);

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Error fetching module stats:', error);
        res.status(500).json({ error: 'Failed to fetch module statistics' });
    }
});

/**
 * GET /api/tenant/:tenantId/modules
 * Get enabled modules for a tenant
 */
router.get('/tenant/:tenantId/modules', authenticate, async (req, res) => {
    try {
        const { tenantId } = req.params;

        // Verify user has access to this tenant
        if (req.user?.tenantId !== tenantId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const enabledModules = await ModuleService.getEnabledModulesForTenant(tenantId);

        res.json({
            success: true,
            modules: enabledModules,
        });
    } catch (error) {
        console.error('Error fetching tenant modules:', error);
        res.status(500).json({ error: 'Failed to fetch tenant modules' });
    }
});

/**
 * POST /api/tenant/:tenantId/modules/enable
 * Enable a module for a tenant (admin only)
 */
router.post(
    '/tenant/:tenantId/modules/enable',
    authenticate,
    requireRole('admin'),
    async (req, res) => {
        try {
            const { tenantId } = req.params;
            const { moduleId } = req.body;
            const userId = req.user?.id;

            if (!moduleId) {
                return res.status(400).json({ error: 'Module ID is required' });
            }

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const result = await ModuleService.enableModuleForTenant(tenantId, moduleId, userId);

            res.json({
                success: true,
                message: 'Module enabled successfully',
                data: result,
            });
        } catch (error) {
            console.error('Error enabling module:', error);
            res.status(500).json({ error: 'Failed to enable module' });
        }
    }
);

/**
 * POST /api/tenant/:tenantId/modules/disable
 * Disable a module for a tenant (admin only)
 */
router.post(
    '/tenant/:tenantId/modules/disable',
    authenticate,
    requireRole('admin'),
    async (req, res) => {
        try {
            const { tenantId } = req.params;
            const { moduleId } = req.body;
            const userId = req.user?.id;

            if (!moduleId) {
                return res.status(400).json({ error: 'Module ID is required' });
            }

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const result = await ModuleService.disableModuleForTenant(tenantId, moduleId, userId);

            res.json({
                success: true,
                message: 'Module disabled successfully',
                data: result,
            });
        } catch (error) {
            console.error('Error disabling module:', error);
            res.status(500).json({ error: 'Failed to disable module' });
        }
    }
);

export default router;
