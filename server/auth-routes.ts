import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, tenants } from "@shared/schema";
import { hashPassword, comparePassword, generateToken, authMiddleware, AuthRequest } from "./auth";
import { z } from "zod";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  tenantName: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  tenantSlug: z.string(),
});

// Signup
router.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    // Create tenant
    const tenantSlug = data.tenantName.toLowerCase().replace(/\s+/g, "-");
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: data.tenantName,
        slug: tenantSlug,
      })
      .returning();

    // Create user
    const hashedPassword = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id as any,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .returning();

    const token = generateToken(user, tenant.id as string);

    res.json({
      user: { id: user.id, email: user.email, firstName: user.firstName },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, data.tenantSlug));
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, data.email));
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await comparePassword(data.password, user.password || "");
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user, tenant.id as string);

    res.json({
      user: { id: user.id, email: user.email, firstName: user.firstName },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user?.id as any),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
