import { z } from "zod";
export declare const userDashboardWidgets: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_dashboard_widgets";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_dashboard_widgets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "user_dashboard_widgets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        widgetType: import("drizzle-orm/pg-core").PgColumn<{
            name: "widget_type";
            tableName: "user_dashboard_widgets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        appId: import("drizzle-orm/pg-core").PgColumn<{
            name: "app_id";
            tableName: "user_dashboard_widgets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        title: import("drizzle-orm/pg-core").PgColumn<{
            name: "title";
            tableName: "user_dashboard_widgets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        config: import("drizzle-orm/pg-core").PgColumn<{
            name: "config";
            tableName: "user_dashboard_widgets";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        position: import("drizzle-orm/pg-core").PgColumn<{
            name: "position";
            tableName: "user_dashboard_widgets";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        size: import("drizzle-orm/pg-core").PgColumn<{
            name: "size";
            tableName: "user_dashboard_widgets";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        isVisible: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_visible";
            tableName: "user_dashboard_widgets";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "user_dashboard_widgets";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "user_dashboard_widgets";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertUserDashboardWidgetSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodString;
    widgetType: z.ZodEnum<["app", "stat", "chart", "activity", "quick_action"]>;
    appId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    position: z.ZodOptional<z.ZodNumber>;
    size: z.ZodOptional<z.ZodEnum<["small", "medium", "large"]>>;
    isVisible: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    title: string;
    widgetType: "app" | "stat" | "chart" | "activity" | "quick_action";
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    size?: "medium" | "small" | "large" | undefined;
    appId?: string | null | undefined;
    config?: Record<string, any> | undefined;
    position?: number | undefined;
    isVisible?: boolean | undefined;
}, {
    userId: string;
    title: string;
    widgetType: "app" | "stat" | "chart" | "activity" | "quick_action";
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    size?: "medium" | "small" | "large" | undefined;
    appId?: string | null | undefined;
    config?: Record<string, any> | undefined;
    position?: number | undefined;
    isVisible?: boolean | undefined;
}>;
export type InsertUserDashboardWidget = z.infer<typeof insertUserDashboardWidgetSchema>;
export type UserDashboardWidget = typeof userDashboardWidgets.$inferSelect;
export declare const userBadges: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_badges";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        badgeId: import("drizzle-orm/pg-core").PgColumn<{
            name: "badge_id";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        badgeName: import("drizzle-orm/pg-core").PgColumn<{
            name: "badge_name";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        badgeDescription: import("drizzle-orm/pg-core").PgColumn<{
            name: "badge_description";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        badgeIcon: import("drizzle-orm/pg-core").PgColumn<{
            name: "badge_icon";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        badgeCategory: import("drizzle-orm/pg-core").PgColumn<{
            name: "badge_category";
            tableName: "user_badges";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        points: import("drizzle-orm/pg-core").PgColumn<{
            name: "points";
            tableName: "user_badges";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        earnedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "earned_at";
            tableName: "user_badges";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertUserBadgeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    earnedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodString;
    badgeId: z.ZodString;
    badgeName: z.ZodString;
    badgeDescription: z.ZodOptional<z.ZodString>;
    badgeIcon: z.ZodOptional<z.ZodString>;
    badgeCategory: z.ZodOptional<z.ZodString>;
    points: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    badgeId: string;
    badgeName: string;
    id?: string | undefined;
    points?: number | undefined;
    badgeCategory?: string | undefined;
    earnedAt?: Date | null | undefined;
    badgeDescription?: string | undefined;
    badgeIcon?: string | undefined;
}, {
    userId: string;
    badgeId: string;
    badgeName: string;
    id?: string | undefined;
    points?: number | undefined;
    badgeCategory?: string | undefined;
    earnedAt?: Date | null | undefined;
    badgeDescription?: string | undefined;
    badgeIcon?: string | undefined;
}>;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export declare const badgeDefinitions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "badge_definitions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "badge_definitions";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "badge_definitions";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "badge_definitions";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        icon: import("drizzle-orm/pg-core").PgColumn<{
            name: "icon";
            tableName: "badge_definitions";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        category: import("drizzle-orm/pg-core").PgColumn<{
            name: "category";
            tableName: "badge_definitions";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        points: import("drizzle-orm/pg-core").PgColumn<{
            name: "points";
            tableName: "badge_definitions";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        criteria: import("drizzle-orm/pg-core").PgColumn<{
            name: "criteria";
            tableName: "badge_definitions";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "badge_definitions";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "badge_definitions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertBadgeDefinitionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    points: z.ZodOptional<z.ZodNumber>;
    criteria: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    isActive?: boolean | undefined;
    points?: number | undefined;
    criteria?: Record<string, any> | undefined;
}, {
    name: string;
    category: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    isActive?: boolean | undefined;
    points?: number | undefined;
    criteria?: Record<string, any> | undefined;
}>;
export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;
export declare const userActivityPoints: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_activity_points";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_activity_points";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "user_activity_points";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        activityType: import("drizzle-orm/pg-core").PgColumn<{
            name: "activity_type";
            tableName: "user_activity_points";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        points: import("drizzle-orm/pg-core").PgColumn<{
            name: "points";
            tableName: "user_activity_points";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "user_activity_points";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        referenceId: import("drizzle-orm/pg-core").PgColumn<{
            name: "reference_id";
            tableName: "user_activity_points";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "user_activity_points";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertUserActivityPointSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodString;
    activityType: z.ZodString;
    points: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    referenceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    activityType: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    referenceId?: string | undefined;
    points?: number | undefined;
}, {
    userId: string;
    activityType: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    referenceId?: string | undefined;
    points?: number | undefined;
}>;
export type InsertUserActivityPoint = z.infer<typeof insertUserActivityPointSchema>;
export type UserActivityPoint = typeof userActivityPoints.$inferSelect;
//# sourceMappingURL=gamification.d.ts.map