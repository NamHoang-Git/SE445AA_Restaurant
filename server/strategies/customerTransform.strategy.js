export class CustomerTransformStrategy {
    /**
     * Nhận vào danh sách stagingUsers (từ collection staging_users)
     * Trả ra danh sách doc để insert vào dw_dim_customers
     * - Dedupe theo customer_id
     */
    transform(stagingUsers = []) {
        const byCustomer = new Map();

        for (const u of stagingUsers) {
            if (!u.customer_id) continue;

            // nếu có nhiều bản ghi cùng customer_id, giữ bản đầu tiên
            if (!byCustomer.has(u.customer_id)) {
                byCustomer.set(u.customer_id, u);
            }
        }

        const docs = [...byCustomer.values()].map((u) => {
            // Map user role to customer tier
            // If user has a role (employee), default to BRONZE
            // Otherwise use the tier field if present
            let customerTier = 'BRONZE';

            if (u.tier) {
                // Check if tier is a role (ADMIN, CASHIER, etc.)
                const roles = ['ADMIN', 'MANAGER', 'CASHIER', 'CHEF', 'WAITER', 'TABLE', 'USER'];
                if (roles.includes(u.tier)) {
                    // Employee - default to BRONZE
                    customerTier = 'BRONZE';
                } else {
                    // Already a customer tier
                    customerTier = u.tier;
                }
            }

            return {
                customer_id: u.customer_id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                tier: customerTier,
                status: u.status,
                created_at: u.created_at,
            };
        });

        return docs;
    }
}
