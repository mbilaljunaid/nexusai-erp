import { db } from "../db";
import { hrmCompetencies, hrmPersonSkills } from "@shared/schema/talent_core";
import { eq, desc, and } from "drizzle-orm";

export class ProfileService {

    // COMPETENCY LIBRARY
    static async getCompetencies(tenantId: string) {
        return await db.select().from(hrmCompetencies)
            .where(eq(hrmCompetencies.tenantId, tenantId))
            .orderBy(desc(hrmCompetencies.name));
    }

    static async createCompetency(data: any) {
        const [comp] = await db.insert(hrmCompetencies).values(data).returning();
        return comp;
    }

    // PERSON PROFILE (Skills)
    static async getPersonSkills(personId: string) {
        // Simple fetch for now. In future could join to get competency details if needed, 
        // though UI might handle that via separate cache
        return await db.select().from(hrmPersonSkills)
            .where(eq(hrmPersonSkills.personId, personId));
    }

    static async addSkill(data: any) {
        // Prevent duplicates
        const existing = await db.select().from(hrmPersonSkills)
            .where(and(
                eq(hrmPersonSkills.personId, data.personId),
                // Check dupes by Competency ID OR Skill Name
                data.competencyId ? eq(hrmPersonSkills.competencyId, data.competencyId) : eq(hrmPersonSkills.skillName, data.skillName)
            ));

        if (existing.length > 0) throw new Error("Skill already exists on profile");

        const [skill] = await db.insert(hrmPersonSkills).values(data).returning();
        return skill;
    }

    static async removeSkill(id: string) {
        return await db.delete(hrmPersonSkills).where(eq(hrmPersonSkills.id, id)).returning();
    }
}
