
import { db } from "../db";
import { hrmLearningCommunities, hrmLearningCourses } from "@shared/schema/talent_learning";
import { eq, and, isNull } from "drizzle-orm";

export class CommunityService {

    // Create Community
    static async createCommunity(data: any) {
        // Calculate path if parent exists
        let path = "/";
        if (data.parentId) {
            const parent = await db.query.hrmLearningCommunities.findFirst({
                where: eq(hrmLearningCommunities.id, data.parentId)
            });
            if (parent) {
                path = (parent.path || "/") + parent.id + "/";
            }
        }

        const [community] = await db.insert(hrmLearningCommunities).values({ ...data, path }).returning();
        return community;
    }

    // List Root Communities
    static async getRootCommunities(tenantId: string) {
        return await db.select().from(hrmLearningCommunities)
            .where(and(
                eq(hrmLearningCommunities.tenantId, tenantId),
                isNull(hrmLearningCommunities.parentId)
            ));
    }

    // List Children
    static async getChildren(communityId: string) {
        const subCommunities = await db.select().from(hrmLearningCommunities)
            .where(eq(hrmLearningCommunities.parentId, communityId));

        const courses = await db.select().from(hrmLearningCourses)
            .where(eq(hrmLearningCourses.communityId, communityId));

        return { subCommunities, courses };
    }

    // Get Breadcrumbs
    static async getBreadcrumbs(communityId: string) {
        const current = await db.query.hrmLearningCommunities.findFirst({
            where: eq(hrmLearningCommunities.id, communityId)
        });

        if (!current) return [];

        const pathIds = (current.path || "/").split("/").filter(Boolean);
        const breadcrumbs = [];

        for (const id of pathIds) {
            const node = await db.query.hrmLearningCommunities.findFirst({
                where: eq(hrmLearningCommunities.id, id)
            });
            if (node) breadcrumbs.push({ id: node.id, title: node.title });
        }

        breadcrumbs.push({ id: current.id, title: current.title });
        return breadcrumbs;
    }
}
