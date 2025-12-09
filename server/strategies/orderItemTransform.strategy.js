export class OrderItemTransformStrategy {
    /**
     * Nhận:
     * - stagingOrders: danh sách staging_order_items
     * - customerMap: Map(customer_id -> dim_customer._id)
     * - menuItemMap: Map(product_id -> dim_menu_item._id)
     *
     * Trả ra danh sách doc để insert vào dw_fact_order_items
     */
    transform(stagingOrders = [], customerMap = new Map(), menuItemMap = new Map()) {
        const docs = [];

        for (const o of stagingOrders) {
            if (!o.order_id || !o.product_id) continue;

            const customer_key = o.customer_id ? customerMap.get(o.customer_id) : null;
            const menu_item_key = menuItemMap.get(o.product_id) || null;

            // Calculate unit_price if missing or 0
            // unit_price = subtotal / quantity (before discount)
            let unitPrice = o.unit_price || 0;
            if (unitPrice === 0 && o.subtotal && o.quantity > 0) {
                unitPrice = o.subtotal / o.quantity;
            }

            docs.push({
                order_id: o.order_id,
                customer_id: o.customer_id,
                product_id: o.product_id,
                product_name: o.product_name,
                quantity: o.quantity,
                unit_price: unitPrice,
                subtotal: o.subtotal,
                discount: o.discount,
                total: o.total,
                payment_method: o.payment_method,
                payment_status: o.payment_status,
                order_status: o.order_status,
                ordered_at: o.ordered_at,
                completed_at: o.completed_at,
                voucher_id: o.voucher_id,
                table_number: o.table_number ?? null,

                // foreign key sang dimension
                customer_key,
                menu_item_key,
            });
        }

        return docs;
    }
}
