
import { Router } from 'express';
import { storage } from '../../storage';
import { insertCaseSchema, insertCaseCommentSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// List Cases
router.get('/cases', async (req, res) => {
    try {
        const accountId = req.query.accountId as string | undefined;
        const contactId = req.query.contactId as string | undefined;
        const cases = await storage.listCases({ accountId, contactId });
        res.json(cases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list cases' });
    }
});

// Create Case
router.post('/cases', async (req, res) => {
    try {
        const data = insertCaseSchema.parse(req.body);
        const newCase = await storage.createCase(data);
        res.status(201).json(newCase);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: 'Failed to create case' });
        }
    }
});

// Get Case
router.get('/cases/:id', async (req, res) => {
    try {
        const caseItem = await storage.getCase(req.params.id);
        if (!caseItem) return res.status(404).json({ error: 'Case not found' });
        res.json(caseItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get case' });
    }
});

// Update Case (e.g. status change)
router.patch('/cases/:id', async (req, res) => {
    try {
        const data = insertCaseSchema.partial().parse(req.body);
        const updatedCase = await storage.updateCase(req.params.id, data);
        res.json(updatedCase);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update case' });
    }
});

// List Case Comments
router.get('/cases/:id/comments', async (req, res) => {
    try {
        const comments = await storage.listCaseComments(req.params.id);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list comments' });
    }
});

// Add Comment
router.post('/cases/:id/comments', async (req, res) => {
    try {
        const data = insertCaseCommentSchema.parse({
            ...req.body,
            caseId: req.params.id
        });
        const comment = await storage.createCaseComment(data);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

export const casesRoutes = router;
