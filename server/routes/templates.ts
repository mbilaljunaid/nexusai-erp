import express from 'express';
import { authenticate } from '../middleware/auth';
import { TemplateService } from '../services/TemplateService';
import type {
    ApplyTemplateRequest,
    TemplatePreviewRequest,
} from '../../shared/types/industry';

const router = express.Router();

/**
 * Get all templates
 * GET /api/templates
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const templates = await TemplateService.getAllTemplates();
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

/**
 * Get templates by industry
 * GET /api/templates/industry/:industryId
 */
router.get('/industry/:industryId', authenticate, async (req, res) => {
    try {
        const { industryId } = req.params;
        const templates = await TemplateService.getTemplatesByIndustry(industryId);
        res.json(templates);
    } catch (error) {
        console.error('Error fetching industry templates:', error);
        res.status(500).json({ error: 'Failed to fetch industry templates' });
    }
});

/**
 * Get templates by module
 * GET /api/templates/module/:moduleId
 */
router.get('/module/:moduleId', authenticate, async (req, res) => {
    try {
        const { moduleId } = req.params;
        const templates = await TemplateService.getTemplatesByModule(moduleId);
        res.json(templates);
    } catch (error) {
        console.error('Error fetching module templates:', error);
        res.status(500).json({ error: 'Failed to fetch module templates' });
    }
});

/**
 * Get template by ID
 * GET /api/templates/:templateId
 */
router.get('/:templateId', authenticate, async (req, res) => {
    try {
        const { templateId } = req.params;
        const template = await TemplateService.getTemplateById(templateId);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

/**
 * Preview template
 * POST /api/templates/preview
 */
router.post('/preview', authenticate, async (req, res) => {
    try {
        const previewRequest: TemplatePreviewRequest = req.body;
        const { templateId } = previewRequest;

        const template = await TemplateService.getTemplateById(templateId);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Calculate item count based on template category
        let itemCount = 0;
        const templateData = template.templateData;

        if (templateData.accounts) itemCount = templateData.accounts.length;
        else if (templateData.appointmentTypes) itemCount = templateData.appointmentTypes.length;
        else if (templateData.productCategories) itemCount = templateData.productCategories.length;
        else if (templateData.subscriptionPlans) itemCount = templateData.subscriptionPlans.length;
        else if (templateData.departments) itemCount = templateData.departments.length;

        res.json({
            template,
            itemCount,
            preview: templateData,
            warnings: [],
        });
    } catch (error) {
        console.error('Error previewing template:', error);
        res.status(500).json({ error: 'Failed to preview template' });
    }
});

/**
 * Apply template to tenant
 * POST /api/templates/apply
 */
router.post('/apply', authenticate, async (req, res) => {
    try {
        const applyRequest: ApplyTemplateRequest = req.body;
        const userId = req.user?.id;

        const result = await TemplateService.applyTemplate(applyRequest, userId);
        res.json(result);
    } catch (error) {
        console.error('Error applying template:', error);
        res.status(500).json({
            error: 'Failed to apply template',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get template applications for tenant
 * GET /api/templates/applications/:tenantId
 */
router.get('/applications/:tenantId', authenticate, async (req, res) => {
    try {
        const { tenantId } = req.params;
        const applications = await TemplateService.getTemplateApplications(tenantId);
        res.json(applications);
    } catch (error) {
        console.error('Error fetching template applications:', error);
        res.status(500).json({ error: 'Failed to fetch template applications' });
    }
});

/**
 * Rollback a template application
 * POST /api/templates/rollback/:applicationId
 */
router.post('/rollback/:applicationId', authenticate, async (req, res) => {
    try {
        const { applicationId } = req.params;
        await TemplateService.rollbackTemplate(applicationId);
        res.json({ success: true, message: 'Template rolled back successfully' });
    } catch (error) {
        console.error('Error rolling back template:', error);
        res.status(500).json({ error: 'Failed to rollback template' });
    }
});

export default router;
