
// Basic Role Definitions
export const ROLES = {
    ADMIN: "admin",
    GL_MANAGER: "gl_manager",
    GL_USER: "gl_user",
    GL_VIEWER: "gl_viewer"
} as const;

// Permission Constants
export const PERMISSIONS = {
    // GL
    GL_READ: "gl.read",
    GL_WRITE: "gl.write",
    GL_APPROVE: "gl.approve",
    GL_POST: "gl.post",
    GL_CONFIG: "gl.config",
    GL_CLOSE_PERIOD: "gl.close_period",
    // CRM
    CRM_READ: "crm.read",
    CRM_WRITE: "crm.write",
    // HR
    HR_READ: "hr.read",
    HR_WRITE: "hr.write",
    // Projects
    PROJECT_READ: "project.read",
    PROJECT_WRITE: "project.write",
    // SCM
    SCM_READ: "scm.read",
    SCM_WRITE: "scm.write",
    // AI
    AI_CHAT: "ai.chat",
    AI_EXECUTE: "ai.execute",
} as const;

// Role-Permission Mapping (In a real app, this might be DB driven)
export const ROLE_PERMISSIONS: Record<string, string[]> = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
    [ROLES.GL_MANAGER]: [
        PERMISSIONS.GL_READ, PERMISSIONS.GL_WRITE, PERMISSIONS.GL_APPROVE,
        PERMISSIONS.GL_POST, PERMISSIONS.GL_CONFIG, PERMISSIONS.GL_CLOSE_PERIOD,
        PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
        PERMISSIONS.HR_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE,
        PERMISSIONS.SCM_READ, PERMISSIONS.AI_CHAT, PERMISSIONS.AI_EXECUTE,
    ],
    [ROLES.GL_USER]: [
        PERMISSIONS.GL_READ, PERMISSIONS.GL_WRITE,
        PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
        PERMISSIONS.HR_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE,
        PERMISSIONS.SCM_READ, PERMISSIONS.AI_CHAT, PERMISSIONS.AI_EXECUTE,
    ],
    [ROLES.GL_VIEWER]: [
        PERMISSIONS.GL_READ, PERMISSIONS.CRM_READ, PERMISSIONS.HR_READ,
        PERMISSIONS.PROJECT_READ, PERMISSIONS.SCM_READ, PERMISSIONS.AI_CHAT,
    ]
};

// Segregation of Duties (SoD) Rules
// Key: A permission that conflicts with others
// Value: Array of permissions that are incompatible with the key
export const SOD_MATRIX: Record<string, string[]> = {
    [PERMISSIONS.GL_POST]: [PERMISSIONS.GL_APPROVE], // Cannot Approve if you can Post (simplistic view, usually it's per transaction)
    [PERMISSIONS.GL_APPROVE]: [PERMISSIONS.GL_POST]
};

export const hasPermission = (userRole: string, permission: string): boolean => {
    const perms = ROLE_PERMISSIONS[userRole] || [];
    return perms.includes(permission);
};
