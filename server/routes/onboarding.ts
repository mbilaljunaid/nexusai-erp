/**
 * Onboarding API Routes
 * Handles tenant onboarding flow endpoints
 * Phase 3: Onboarding Flow Backend
 */

import { Router } from 'express';
import { OnboardingService } from '../services/OnboardingService';
import { IndustryService } from '../services/IndustryService';
import { ModuleService } from '../services/ModuleService';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/onboarding/start
 * Initialize onboarding for a tenant
 */
router.post('/start', authenticate, async (req, res) => {
    try {
        const { tenantId } = req.body;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        await OnboardingService.startOnboarding(tenantId);

        res.json({
            success: true,
            message: 'Onboarding started',
        });
    } catch (error) {
        console.error('Error starting onboarding:', error);
        res.status(500).json({ error: 'Failed to start onboarding' });
    }
});

/**
 * POST /api/onboarding/company-profile
 * Update company profile information
 */
router.post('/company-profile', authenticate, async (req, res) => {
    try {
        const { tenantId, name, size, timezone, currency } = req.body;

        if (!tenantId || !name) {
            return res.status(400).json({ error: 'Tenant ID and company name are required' });
        }

        await OnboardingService.updateCompanyProfile(tenantId, {
            name,
            size: size || '1-10',
            timezone: timezone || 'UTC',
            currency: currency || 'USD',
        });

        res.json({
            success: true,
            message: 'Company profile updated',
        });
    } catch (error) {
        console.error('Error updating company profile:', error);
        res.status(500).json({ error: 'Failed to update company profile' });
    }
});

/**
 * GET /api/onboarding/industries
 * Get all available industries
 */
router.get('/industries', authenticate, async (req, res) => {
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
 * POST /api/onboarding/select-industry
 * Select industry and get module recommendations
 */
router.post('/select-industry', authenticate, async (req, res) => {
    try {
        const { tenantId, industryId } = req.body;

        if (!tenantId || !industryId) {
            return res.status(400).json({ error: 'Tenant ID and industry ID are required' });
        }

        const recommendations = await OnboardingService.selectIndustry(tenantId, industryId);

        res.json({
            success: true,
            recommendations,
        });
    } catch (error) {
        console.error('Error selecting industry:', error);
        res.status(500).json({ error: 'Failed to select industry' });
    }
});

/**
 * POST /api/onboarding/skip-industry
 * Skip industry selection and show all modules
 */
router.post('/skip-industry', authenticate, async (req, res) => {
    try {
        const { tenantId } = req.body;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        await OnboardingService.skipIndustrySelection(tenantId);
        const allModules = await OnboardingService.getAllAvailableModules();

        res.json({
            success: true,
            modules: allModules,
        });
    } catch (error) {
        console.error('Error skipping industry:', error);
        res.status(500).json({ error: 'Failed to skip industry selection' });
    }
});

/**
 * POST /api/onboarding/select-modules
 * Select modules to enable for tenant
 */
router.post('/select-modules', authenticate, async (req, res) => {
    try {
        const { tenantId, moduleIds } = req.body;
        const userId = req.user?.id;

        if (!tenantId || !moduleIds || !Array.isArray(moduleIds)) {
            return res.status(400).json({ error: 'Tenant ID and module IDs are required' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await OnboardingService.selectModules(tenantId, moduleIds, userId);

        res.json({
            success: true,
            message: 'Modules selected and enabled',
            enabledCount: moduleIds.length,
        });
    } catch (error) {
        console.error('Error selecting modules:', error);
        res.status(500).json({ error: 'Failed to select modules' });
    }
});

/**
 * POST /api/onboarding/provision
 * Final provisioning step - apply templates and complete onboarding
 */
router.post('/provision', authenticate, async (req, res) => {
    try {
        const { tenantId, industryId, selectedModuleIds } = req.body;

        if (!tenantId || !selectedModuleIds || !Array.isArray(selectedModuleIds)) {
            return res.status(400).json({ error: 'Tenant ID and selected modules are required' });
        }

        const result = await OnboardingService.provisionTenant({
            tenantId,
            industryId,
            selectedModuleIds,
        });

        res.json(result);
    } catch (error) {
        console.error('Error provisioning tenant:', error);
        res.status(500).json({ error: 'Failed to provision tenant' });
    }
});

/**
 * GET /api/onboarding/progress/:tenantId
 * Get onboarding progress for a tenant
 */
router.get('/progress/:tenantId', authenticate, async (req, res) => {
    try {
        const { tenantId } = req.params;

        const progress = await OnboardingService.getOnboardingProgress(tenantId);

        res.json({
            success: true,
            progress,
        });
    } catch (error) {
        console.error('Error fetching onboarding progress:', error);
        res.status(500).json({ error: 'Failed to fetch onboarding progress' });
    }
});

/**
 * GET /api/onboarding/modules
 * Get all available modules (for manual selection without industry)
 */
router.get('/modules', authenticate, async (req, res) => {
    try {
        const modules = await ModuleService.getAllModules();

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
 * GET /api/onboarding/modules/recommendations/:industryId
 * Get module recommendations for a specific industry
 */
router.get('/modules/recommendations/:industryId', authenticate, async (req, res) => {
    try {
        const { industryId } = req.params;

        const recommendations = await IndustryService.getModuleRecommendations(industryId);

        res.json({
            success: true,
            recommendations,
        });
    } catch (error) {
        console.error('Error fetching module recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch module recommendations' });
    }
});

export default router;
