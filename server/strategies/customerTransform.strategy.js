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

        const docs = [...byCustomer.values()].map((u) => ({
            customer_id: u.customer_id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            tier: u.tier,
            status: u.status,
            created_at: u.created_at,
        }));

        return docs;
    }
}
