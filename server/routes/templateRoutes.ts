/**
 * Template Routes - Phase 5 Integration
 * Endpoints for form template management
 */

import { Router } from "express";
import { templateEngine } from "../templates/templateEngine";
import { metadataRegistry } from "../metadata/registry";
import type { FormMetadataAdvanced } from "@shared/types/metadata";

const router = Router();

/**
 * POST /api/templates
 * Create new form template
 */
router.post("/templates", (req, res) => {
  try {
    const { id, name, metadata, options } = req.body;
    if (!id || !name || !metadata) {
      return res.status(400).json({ error: "id, name, and metadata are required" });
    }
    const template = templateEngine.createTemplate(id, name, metadata, options);
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates/:templateId
 * Get template by ID
 */
router.get("/templates/:templateId", (req, res) => {
  try {
    const template = templateEngine.getTemplate(req.params.templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates
 * List templates with optional filtering
 */
router.get("/templates", (req, res) => {
  try {
    const { category, search } = req.query;

    let templates;
    if (search) {
      templates = templateEngine.searchTemplates(search as string);
    } else if (category) {
      templates = templateEngine.listTemplatesByCategory(category as string);
    } else {
      templates = templateEngine.getAllTemplates();
    }

    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/templates/:templateId/apply
 * Apply template to create new form
 */
router.post("/templates/:templateId/apply", (req, res) => {
  try {
    const { newFormId, overrides } = req.body;
    if (!newFormId) {
      return res.status(400).json({ error: "newFormId is required" });
    }

    const newMetadata = templateEngine.applyTemplate(
      req.params.templateId,
      newFormId,
      overrides as Partial<FormMetadataAdvanced>
    );

    if (!newMetadata) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Register new form in metadata registry
    metadataRegistry.registerMetadata(newMetadata);

    res.status(201).json({
      formId: newFormId,
      metadata: newMetadata,
      message: "Form created from template successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
