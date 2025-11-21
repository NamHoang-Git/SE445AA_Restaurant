export class InventoryMovementTransformStrategy {
    transform(stagingImports = [], stagingExports = []) {
        const docs = [];

        // IMPORT
        for (const imp of stagingImports) {
            if (!imp.import_id || !imp.product_id) continue;

            docs.push({
                movement_type: "IMPORT",
                movement_id: imp.import_id,
                product_id: imp.product_id,
                quantity: imp.quantity,
                unit_cost: imp.unit_cost,
                reason: "IMPORT",
                movement_date: imp.import_date,
                supplier: imp.supplier ?? null,
            });
        }

        // EXPORT
        for (const exp of stagingExports) {
            if (!exp.export_id || !exp.product_id) continue;

            docs.push({
                movement_type: "EXPORT",
                movement_id: exp.export_id,
                product_id: exp.product_id,
                quantity: exp.quantity,
                unit_cost: null,
                reason: exp.reason || "SALE",
                movement_date: exp.export_date,
                supplier: null,
            });
        }

        return docs;
    }
}
