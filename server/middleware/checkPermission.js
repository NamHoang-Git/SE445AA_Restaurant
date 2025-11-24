// Role-based permissions middleware

const PERMISSIONS = {
    ADMIN: ['*'], // All permissions
    MANAGER: [
        'employee:read',
        'employee:create',
        'employee:update',
        'shift:*',
        'performance:read',
        'report:read',
        'booking:*',
        'table:*'
    ],
    WAITER: [
        'order:read',
        'order:create',
        'order:update',
        'table:read',
        'table:update',
        'shift:read_own',
        'performance:read_own'
    ],
    CHEF: [
        'order:read',
        'order:update',
        'dish:update',
        'shift:read_own',
        'performance:read_own'
    ],
    CASHIER: [
        'order:read',
        'payment:*',
        'shift:read_own',
        'performance:read_own'
    ],
    USER: [
        'booking:create',
        'booking:read_own',
        'booking:cancel_own',
        'order:create',
        'order:read_own'
    ]
};

/**
 * Check if user has required permission
 * @param {String} permission - Permission to check (e.g., 'employee:read')
 */
export const checkPermission = (permission) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role || 'USER';

            if (!userRole) {
                return res.status(401).json({
                    message: "Unauthorized - No role assigned",
                    error: true,
                    success: false
                });
            }

            const userPermissions = PERMISSIONS[userRole] || [];

            // Admin has all permissions
            if (userPermissions.includes('*')) {
                return next();
            }

            // Check for exact permission match
            if (userPermissions.includes(permission)) {
                return next();
            }

            // Check for wildcard permission (e.g., 'shift:*' matches 'shift:read')
            const [resource, action] = permission.split(':');
            const wildcardPermission = `${resource}:*`;

            if (userPermissions.includes(wildcardPermission)) {
                return next();
            }

            return res.status(403).json({
                message: `Forbidden - Bạn không có quyền ${permission}`,
                error: true,
                success: false
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                error: true,
                success: false
            });
        }
    };
};

/**
 * Check if user has any of the required roles
 * @param {Array} roles - Array of allowed roles
 */
export const checkRole = (roles = []) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role || 'USER';

            if (!userRole) {
                return res.status(401).json({
                    message: "Unauthorized - No role assigned",
                    error: true,
                    success: false
                });
            }

            if (roles.includes(userRole)) {
                return next();
            }

            return res.status(403).json({
                message: `Forbidden - Chỉ ${roles.join(', ')} mới có quyền truy cập`,
                error: true,
                success: false
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Internal server error",
                error: true,
                success: false
            });
        }
    };
};

/**
 * Check if user is employee (not regular USER)
 */
export const isEmployee = (req, res, next) => {
    const employeeRoles = ['ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER'];
    return checkRole(employeeRoles)(req, res, next);
};

/**
 * Check if user is management (ADMIN or MANAGER)
 */
export const isManagement = (req, res, next) => {
    return checkRole(['ADMIN', 'MANAGER'])(req, res, next);
};

export default {
    checkPermission,
    checkRole,
    isEmployee,
    isManagement,
    PERMISSIONS
};
