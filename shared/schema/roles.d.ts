export declare const ROLES: {
    readonly ADMIN: "admin";
    readonly GL_MANAGER: "gl_manager";
    readonly GL_USER: "gl_user";
    readonly GL_VIEWER: "gl_viewer";
};
export declare const PERMISSIONS: {
    readonly GL_READ: "gl.read";
    readonly GL_WRITE: "gl.write";
    readonly GL_APPROVE: "gl.approve";
    readonly GL_POST: "gl.post";
    readonly GL_CONFIG: "gl.config";
    readonly GL_CLOSE_PERIOD: "gl.close_period";
};
export declare const ROLE_PERMISSIONS: Record<string, string[]>;
export declare const SOD_MATRIX: Record<string, string[]>;
export declare const hasPermission: (userRole: string, permission: string) => boolean;
//# sourceMappingURL=roles.d.ts.map