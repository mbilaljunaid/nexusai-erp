
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
    // AP
    AP_READ: "ap.read",
    AP_WRITE: "ap.write",
    // AR
    AR_READ: "ar.read",
    AR_WRITE: "ar.write",
    // Fixed Assets
    FA_READ: "fa.read",
    FA_WRITE: "fa.write",
    // Cash Management
    CASH_READ: "cash.read",
    CASH_WRITE: "cash.write",
    // CRM
    CRM_READ: "crm.read",
    CRM_WRITE: "crm.write",
    // HR
    HR_READ: "hr.read",
    HR_WRITE: "hr.write",
    // Projects / PPM
    PROJECT_READ: "project.read",
    PROJECT_WRITE: "project.write",
    // SCM
    SCM_READ: "scm.read",
    SCM_WRITE: "scm.write",
    // Manufacturing
    MFG_READ: "mfg.read",
    MFG_WRITE: "mfg.write",
    // Intercompany
    IC_READ: "ic.read",
    IC_WRITE: "ic.write",
    // Landed Cost Management
    LCM_READ: "lcm.read",
    // Lease / Real Estate
    LEASE_READ: "lease.read",
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
        PERMISSIONS.AP_READ, PERMISSIONS.AP_WRITE,
        PERMISSIONS.AR_READ, PERMISSIONS.AR_WRITE,
        PERMISSIONS.FA_READ, PERMISSIONS.FA_WRITE,
        PERMISSIONS.CASH_READ, PERMISSIONS.CASH_WRITE,
        PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
        PERMISSIONS.HR_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE,
        PERMISSIONS.SCM_READ, PERMISSIONS.MFG_READ,
        PERMISSIONS.IC_READ, PERMISSIONS.IC_WRITE,
        PERMISSIONS.LCM_READ, PERMISSIONS.LEASE_READ,
        PERMISSIONS.AI_CHAT, PERMISSIONS.AI_EXECUTE,
    ],
    [ROLES.GL_USER]: [
        PERMISSIONS.GL_READ, PERMISSIONS.GL_WRITE,
        PERMISSIONS.AP_READ, PERMISSIONS.AP_WRITE,
        PERMISSIONS.AR_READ, PERMISSIONS.AR_WRITE,
        PERMISSIONS.FA_READ, PERMISSIONS.CASH_READ,
        PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
        PERMISSIONS.HR_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE,
        PERMISSIONS.SCM_READ, PERMISSIONS.MFG_READ,
        PERMISSIONS.IC_READ, PERMISSIONS.LCM_READ, PERMISSIONS.LEASE_READ,
        PERMISSIONS.AI_CHAT, PERMISSIONS.AI_EXECUTE,
    ],
    [ROLES.GL_VIEWER]: [
        PERMISSIONS.GL_READ, PERMISSIONS.AP_READ, PERMISSIONS.AR_READ,
        PERMISSIONS.FA_READ, PERMISSIONS.CASH_READ,
        PERMISSIONS.CRM_READ, PERMISSIONS.HR_READ,
        PERMISSIONS.PROJECT_READ, PERMISSIONS.SCM_READ,
        PERMISSIONS.MFG_READ, PERMISSIONS.IC_READ,
        PERMISSIONS.LCM_READ, PERMISSIONS.LEASE_READ,
        PERMISSIONS.AI_CHAT,
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
