"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.SOD_MATRIX = exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.ROLES = void 0;
// Basic Role Definitions
exports.ROLES = {
    ADMIN: "admin",
    GL_MANAGER: "gl_manager",
    GL_USER: "gl_user",
    GL_VIEWER: "gl_viewer"
};
// Permission Constants
exports.PERMISSIONS = {
    GL_READ: "gl.read",
    GL_WRITE: "gl.write",
    GL_APPROVE: "gl.approve",
    GL_POST: "gl.post",
    GL_CONFIG: "gl.config",
    GL_CLOSE_PERIOD: "gl.close_period"
};
// Role-Permission Mapping (In a real app, this might be DB driven)
exports.ROLE_PERMISSIONS = {
    [exports.ROLES.ADMIN]: Object.values(exports.PERMISSIONS),
    [exports.ROLES.GL_MANAGER]: [
        exports.PERMISSIONS.GL_READ,
        exports.PERMISSIONS.GL_WRITE,
        exports.PERMISSIONS.GL_APPROVE,
        exports.PERMISSIONS.GL_POST,
        exports.PERMISSIONS.GL_CONFIG,
        exports.PERMISSIONS.GL_CLOSE_PERIOD
    ],
    [exports.ROLES.GL_USER]: [
        exports.PERMISSIONS.GL_READ,
        exports.PERMISSIONS.GL_WRITE
    ],
    [exports.ROLES.GL_VIEWER]: [
        exports.PERMISSIONS.GL_READ
    ]
};
// Segregation of Duties (SoD) Rules
// Key: A permission that conflicts with others
// Value: Array of permissions that are incompatible with the key
exports.SOD_MATRIX = {
    [exports.PERMISSIONS.GL_POST]: [exports.PERMISSIONS.GL_APPROVE], // Cannot Approve if you can Post (simplistic view, usually it's per transaction)
    [exports.PERMISSIONS.GL_APPROVE]: [exports.PERMISSIONS.GL_POST]
};
const hasPermission = (userRole, permission) => {
    const perms = exports.ROLE_PERMISSIONS[userRole] || [];
    return perms.includes(permission);
};
exports.hasPermission = hasPermission;
//# sourceMappingURL=roles.js.map