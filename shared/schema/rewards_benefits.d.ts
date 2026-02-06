export declare const hrmBenPrograms: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hrm_ben_programs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hrm_ben_programs";
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
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "hrm_ben_programs";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "hrm_ben_programs";
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
            tableName: "hrm_ben_programs";
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
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "hrm_ben_programs";
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
        legislationCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "legislation_code";
            tableName: "hrm_ben_programs";
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
        openEnrollmentStart: import("drizzle-orm/pg-core").PgColumn<{
            name: "open_enrollment_start";
            tableName: "hrm_ben_programs";
            dataType: "string";
            columnType: "PgDateString";
            data: string;
            driverParam: string;
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
        openEnrollmentEnd: import("drizzle-orm/pg-core").PgColumn<{
            name: "open_enrollment_end";
            tableName: "hrm_ben_programs";
            dataType: "string";
            columnType: "PgDateString";
            data: string;
            driverParam: string;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "hrm_ben_programs";
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
export declare const hrmBenPlans: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hrm_ben_plans";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hrm_ben_plans";
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
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "hrm_ben_plans";
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
        programId: import("drizzle-orm/pg-core").PgColumn<{
            name: "program_id";
            tableName: "hrm_ben_plans";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "hrm_ben_plans";
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
        planType: import("drizzle-orm/pg-core").PgColumn<{
            name: "plan_type";
            tableName: "hrm_ben_plans";
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
        provider: import("drizzle-orm/pg-core").PgColumn<{
            name: "provider";
            tableName: "hrm_ben_plans";
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
        deductionElementId: import("drizzle-orm/pg-core").PgColumn<{
            name: "deduction_element_id";
            tableName: "hrm_ben_plans";
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
            tableName: "hrm_ben_plans";
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
export declare const hrmBenOptions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hrm_ben_options";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hrm_ben_options";
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
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "hrm_ben_options";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "hrm_ben_options";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "hrm_ben_options";
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
export declare const hrmBenPlanOptions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hrm_ben_plan_options";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hrm_ben_plan_options";
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
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "hrm_ben_plan_options";
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
        planId: import("drizzle-orm/pg-core").PgColumn<{
            name: "plan_id";
            tableName: "hrm_ben_plan_options";
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
        optionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "option_id";
            tableName: "hrm_ben_plan_options";
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
        employeeCost: import("drizzle-orm/pg-core").PgColumn<{
            name: "employee_cost";
            tableName: "hrm_ben_plan_options";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
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
        employerCost: import("drizzle-orm/pg-core").PgColumn<{
            name: "employer_cost";
            tableName: "hrm_ben_plan_options";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
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
        currency: import("drizzle-orm/pg-core").PgColumn<{
            name: "currency";
            tableName: "hrm_ben_plan_options";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "hrm_ben_plan_options";
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
export declare const hrmBenEnrollments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hrm_ben_enrollments";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hrm_ben_enrollments";
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
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "hrm_ben_enrollments";
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
        personId: import("drizzle-orm/pg-core").PgColumn<{
            name: "person_id";
            tableName: "hrm_ben_enrollments";
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
        planOptionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "plan_option_id";
            tableName: "hrm_ben_enrollments";
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
        coverageStartDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "coverage_start_date";
            tableName: "hrm_ben_enrollments";
            dataType: "string";
            columnType: "PgDateString";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        coverageEndDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "coverage_end_date";
            tableName: "hrm_ben_enrollments";
            dataType: "string";
            columnType: "PgDateString";
            data: string;
            driverParam: string;
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
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "hrm_ben_enrollments";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "hrm_ben_enrollments";
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
export declare const insertBenProgramSchema: import("drizzle-zod").BuildSchema<"insert", {
    id: import("drizzle-orm/pg-core").PgColumn<{
        name: "id";
        tableName: "hrm_ben_programs";
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
    tenantId: import("drizzle-orm/pg-core").PgColumn<{
        name: "tenant_id";
        tableName: "hrm_ben_programs";
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
    name: import("drizzle-orm/pg-core").PgColumn<{
        name: "name";
        tableName: "hrm_ben_programs";
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
        tableName: "hrm_ben_programs";
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
    status: import("drizzle-orm/pg-core").PgColumn<{
        name: "status";
        tableName: "hrm_ben_programs";
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
    legislationCode: import("drizzle-orm/pg-core").PgColumn<{
        name: "legislation_code";
        tableName: "hrm_ben_programs";
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
    openEnrollmentStart: import("drizzle-orm/pg-core").PgColumn<{
        name: "open_enrollment_start";
        tableName: "hrm_ben_programs";
        dataType: "string";
        columnType: "PgDateString";
        data: string;
        driverParam: string;
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
    openEnrollmentEnd: import("drizzle-orm/pg-core").PgColumn<{
        name: "open_enrollment_end";
        tableName: "hrm_ben_programs";
        dataType: "string";
        columnType: "PgDateString";
        data: string;
        driverParam: string;
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
    createdAt: import("drizzle-orm/pg-core").PgColumn<{
        name: "created_at";
        tableName: "hrm_ben_programs";
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
}, undefined>;
export declare const insertBenPlanSchema: import("drizzle-zod").BuildSchema<"insert", {
    id: import("drizzle-orm/pg-core").PgColumn<{
        name: "id";
        tableName: "hrm_ben_plans";
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
    tenantId: import("drizzle-orm/pg-core").PgColumn<{
        name: "tenant_id";
        tableName: "hrm_ben_plans";
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
    programId: import("drizzle-orm/pg-core").PgColumn<{
        name: "program_id";
        tableName: "hrm_ben_plans";
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
    name: import("drizzle-orm/pg-core").PgColumn<{
        name: "name";
        tableName: "hrm_ben_plans";
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
    planType: import("drizzle-orm/pg-core").PgColumn<{
        name: "plan_type";
        tableName: "hrm_ben_plans";
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
    provider: import("drizzle-orm/pg-core").PgColumn<{
        name: "provider";
        tableName: "hrm_ben_plans";
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
    deductionElementId: import("drizzle-orm/pg-core").PgColumn<{
        name: "deduction_element_id";
        tableName: "hrm_ben_plans";
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
        tableName: "hrm_ben_plans";
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
}, undefined>;
export declare const insertBenOptionSchema: import("drizzle-zod").BuildSchema<"insert", {
    id: import("drizzle-orm/pg-core").PgColumn<{
        name: "id";
        tableName: "hrm_ben_options";
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
    tenantId: import("drizzle-orm/pg-core").PgColumn<{
        name: "tenant_id";
        tableName: "hrm_ben_options";
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
    name: import("drizzle-orm/pg-core").PgColumn<{
        name: "name";
        tableName: "hrm_ben_options";
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
    createdAt: import("drizzle-orm/pg-core").PgColumn<{
        name: "created_at";
        tableName: "hrm_ben_options";
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
}, undefined>;
export declare const insertBenEnrollmentSchema: import("drizzle-zod").BuildSchema<"insert", {
    id: import("drizzle-orm/pg-core").PgColumn<{
        name: "id";
        tableName: "hrm_ben_enrollments";
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
    tenantId: import("drizzle-orm/pg-core").PgColumn<{
        name: "tenant_id";
        tableName: "hrm_ben_enrollments";
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
    personId: import("drizzle-orm/pg-core").PgColumn<{
        name: "person_id";
        tableName: "hrm_ben_enrollments";
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
    planOptionId: import("drizzle-orm/pg-core").PgColumn<{
        name: "plan_option_id";
        tableName: "hrm_ben_enrollments";
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
    coverageStartDate: import("drizzle-orm/pg-core").PgColumn<{
        name: "coverage_start_date";
        tableName: "hrm_ben_enrollments";
        dataType: "string";
        columnType: "PgDateString";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
    }, {}, {}>;
    coverageEndDate: import("drizzle-orm/pg-core").PgColumn<{
        name: "coverage_end_date";
        tableName: "hrm_ben_enrollments";
        dataType: "string";
        columnType: "PgDateString";
        data: string;
        driverParam: string;
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
    status: import("drizzle-orm/pg-core").PgColumn<{
        name: "status";
        tableName: "hrm_ben_enrollments";
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
    createdAt: import("drizzle-orm/pg-core").PgColumn<{
        name: "created_at";
        tableName: "hrm_ben_enrollments";
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
}, undefined>;
//# sourceMappingURL=rewards_benefits.d.ts.map