import { Hono } from 'hono';
import { AffiliateService } from '@/services/admin/affiliate.service';

const app = new Hono();

// Get all affiliates
app.get('/', async (c) => {
    try {
        const affiliates = await AffiliateService.getAll();
        return c.json(affiliates);
    } catch (error) {
        return c.json({ error: 'Failed to fetch affiliates' }, 500);
    }
});

// Get affiliate by ID
app.get('/:id', async (c) => {
    try {
        const affiliate = await AffiliateService.getById(c.req.param('id'));
        if (!affiliate) {
            return c.json({ error: 'Affiliate not found' }, 404);
        }
        return c.json(affiliate);
    } catch (error) {
        return c.json({ error: 'Failed to fetch affiliate' }, 500);
    }
});

// Create affiliate
app.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const affiliate = await AffiliateService.create(body);
        return c.json(affiliate, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create affiliate' }, 500);
    }
});

// Update affiliate status
app.patch('/:id/status', async (c) => {
    try {
        const body = await c.req.json();
        const affiliate = await AffiliateService.updateStatus(
            c.req.param('id'),
            body.status
        );
        return c.json(affiliate);
    } catch (error) {
        return c.json({ error: 'Failed to update affiliate status' }, 500);
    }
});

// Get affiliate referrals
app.get('/:id/referrals', async (c) => {
    try {
        const referrals = await AffiliateService.getReferrals(c.req.param('id'));
        return c.json(referrals);
    } catch (error) {
        return c.json({ error: 'Failed to fetch referrals' }, 500);
    }
});

// Create referral
app.post('/:id/referrals', async (c) => {
    try {
        const body = await c.req.json();
        const referral = await AffiliateService.createReferral(
            c.req.param('id'),
            body.tenantId
        );
        return c.json(referral, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create referral' }, 500);
    }
});

// Convert referral
app.post('/referrals/:id/convert', async (c) => {
    try {
        const body = await c.req.json();
        const referral = await AffiliateService.convertReferral(
            c.req.param('id'),
            body.commissionAmount
        );
        return c.json(referral);
    } catch (error) {
        return c.json({ error: 'Failed to convert referral' }, 500);
    }
});

export default app;
