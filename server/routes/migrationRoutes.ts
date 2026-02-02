/**
 * Migration Routes - Phase 5 Integration
 * Endpoints for data import/export and transformation
 */

import { Router } from "express";
import { dataMigrationTools } from "../migration/dataMigrationTools";

const router = Router();

/**
 * POST /api/migration/import
 * Start data import job
 */
router.post("/migration/import", async (req, res) => {
  try {
    const { formId, sourceData } = req.body;
    if (!formId || !Array.isArray(sourceData)) {
      return res.status(400).json({ error: "formId and sourceData array are required" });
    }

    const job = dataMigrationTools.createImportJob(formId, sourceData);

    // Execute async (don't await)
    dataMigrationTools.executeMigrationJob(job.id).catch((error) => {
      console.error("Migration job failed:", error);
    });

    res.status(202).json({ jobId: job.id, status: "queued" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migration/export
 * Start data export job
 */
router.post("/migration/export", async (req, res) => {
  try {
    const { formId, format, filterCriteria } = req.body;
    if (!formId || !format) {
      return res.status(400).json({ error: "formId and format are required" });
    }

    if (!["csv", "json", "excel"].includes(format)) {
      return res.status(400).json({ error: "format must be csv, json, or excel" });
    }

    const job = dataMigrationTools.createExportJob(formId, format, filterCriteria);

    // Execute async
    dataMigrationTools.executeMigrationJob(job.id).catch((error) => {
      console.error("Export job failed:", error);
    });

    res.status(202).json({ jobId: job.id, status: "queued" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migration/transform
 * Start data transformation job
 */
router.post("/migration/transform", async (req, res) => {
  try {
    const { sourceFormId, targetFormId, mappings } = req.body;
    if (!sourceFormId || !targetFormId || !mappings) {
      return res
        .status(400)
        .json({ error: "sourceFormId, targetFormId, and mappings are required" });
    }

    const job = dataMigrationTools.createTransformJob(sourceFormId, targetFormId, mappings);

    // Execute async
    dataMigrationTools.executeMigrationJob(job.id).catch((error) => {
      console.error("Transform job failed:", error);
    });

    res.status(202).json({ jobId: job.id, status: "queued" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/migration/jobs/:jobId
 * Get migration job status
 */
router.get("/migration/jobs/:jobId", (req, res) => {
  try {
    const job = dataMigrationTools.getJobStatus(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/migration/history
 * Get all migration jobs
 */
router.get("/migration/history", (req, res) => {
  try {
    const history = dataMigrationTools.getJobHistory();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
