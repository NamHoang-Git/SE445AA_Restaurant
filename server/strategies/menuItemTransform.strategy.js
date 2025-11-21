export class MenuItemTransformStrategy {
    /**
     * Nhận vào danh sách stagingProducts
     * Trả ra danh sách doc để insert vào dw_dim_menu_items
     * - Dedupe theo product_id
     */
    transform(stagingProducts = []) {
        const byProduct = new Map();

        for (const p of stagingProducts) {
            if (!p.product_id) continue;

            if (!byProduct.has(p.product_id)) {
                byProduct.set(p.product_id, p);
            }
        }

        const docs = [...byProduct.values()].map((p) => ({
            product_id: p.product_id,
            name: p.name,
            price: p.price,
            discount: p.discount,
            publish: p.publish,
            category_ids: p.category_ids,
            sub_category_id: p.sub_category_id,
            slug: p.slug,
            created_at: p.created_at,
        }));

        return docs;
    }
}
