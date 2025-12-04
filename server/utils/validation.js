import {
    normalizeName,
    normalizePhone,
    normalizeEmail,
    expandAbbreviations,
    cleanProductName,
} from './dataCleaning.util.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
// VN: 0xxxxxxxxx, 10–11 số; hoặc +84...
const PHONE_RE = /^(0|\+?84)(\d{9,10})$/;

function safeStr(v) {
    return typeof v === 'string' ? v.trim() : '';
}

function safeNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function isoOrNull(v) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

export function validateUser(msg) {
    const errors = [];

    // 1. Clean data BEFORE validation
    let cleanName = normalizeName(msg.name);
    cleanName = expandAbbreviations(cleanName);
    const cleanEmail = normalizeEmail(msg.email);
    const cleanPhone = normalizePhone(msg.phone);

    const out = {
        customer_id: safeStr(msg.customer_id),
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        tier: safeStr(msg.tier || 'BRONZE'),
        status: safeStr(msg.status || 'Active'),
        created_at: isoOrNull(msg.created_at),
        _original_name: msg.name, // Keep original for debugging
        _original_phone: msg.phone,
    };

    // 2. Validate AFTER cleaning
    if (!out.customer_id) errors.push('customer_id required');
    if (out.email && !EMAIL_RE.test(out.email)) errors.push('email invalid');
    if (out.phone && !PHONE_RE.test(out.phone)) errors.push('phone invalid');

    return { ok: errors.length === 0, errors, data: out };
}

export function validateProduct(msg) {
    const errors = [];

    // Clean product name
    const cleanName = cleanProductName(msg.name);

    const out = {
        product_id: safeStr(msg.product_id),
        name: cleanName,
        price: safeNumber(msg.price),
        discount: safeNumber(msg.discount ?? 0) ?? 0,
        publish: !!msg.publish,
        category_ids: Array.isArray(msg.category_ids)
            ? msg.category_ids.map(String)
            : [],
        sub_category_id: msg.sub_category_id ? String(msg.sub_category_id) : null,
        slug: msg.slug ? safeStr(msg.slug) : null,
        created_at: isoOrNull(msg.created_at),
        _original_name: msg.name, // Keep original for debugging
    };

    if (!out.product_id) errors.push('product_id required');
    if (!out.name) errors.push('name required');
    if (out.price == null || out.price < 0) errors.push('price invalid');
    if (out.discount < 0) errors.push('discount invalid');

    return { ok: errors.length === 0, errors, data: out };
}

export function validateOrderItem(msg) {
    const errors = [];
    const out = {
        order_id: safeStr(msg.order_id),
        customer_id: msg.customer_id ? String(msg.customer_id) : null,
        product_id: msg.product_id ? String(msg.product_id) : null,
        product_name: safeStr(msg.product_name),
        quantity: safeNumber(msg.quantity),
        unit_price: safeNumber(msg.unit_price),
        subtotal: safeNumber(msg.subtotal),
        discount: safeNumber(msg.discount ?? 0) ?? 0,
        total: safeNumber(msg.total),
        payment_method: safeStr(msg.payment_method || 'CASH'),
        payment_status: safeStr(msg.payment_status || 'UNPAID'),
        order_status: safeStr(msg.order_status || 'PENDING'),
        ordered_at: isoOrNull(msg.ordered_at),
        completed_at: isoOrNull(msg.completed_at),
        voucher_id: msg.voucher_id ? String(msg.voucher_id) : null,
        table_number: msg.table_number ?? null,
    };

    // Relaxed validation for real CS445K data
    if (!out.order_id) errors.push('order_id required');
    if (!out.product_id) errors.push('product_id required');

    // Allow quantity = 0 (cancelled/refunded orders)
    if (out.quantity == null) errors.push('quantity required');

    // Allow unit_price = 0 (free items, promotions)
    if (out.unit_price == null) errors.push('unit_price required');

    // Allow total = 0 (free orders, vouchers)
    if (out.total == null) errors.push('total required');

    // Remove strict subtotal check - real data might have rounding differences

    return { ok: errors.length === 0, errors, data: out };
}

export function validateWhImport(msg) {
    const errors = [];
    const out = {
        import_id: safeStr(msg.import_id),
        product_id: safeStr(msg.product_id),
        product_name_raw: safeStr(msg.product_name_raw),  // NEW: raw product name
        quantity: safeNumber(msg.quantity),
        unit_cost: safeNumber(msg.unit_cost),
        import_date: isoOrNull(msg.import_date),
        supplier: safeStr(msg.supplier),
        warehouse_location: safeStr(msg.warehouse_location),  // NEW: warehouse location
    };

    if (!out.import_id) errors.push('import_id required');
    if (!out.product_id) errors.push('product_id required');
    if (out.quantity == null || out.quantity <= 0) errors.push('quantity invalid');
    if (out.unit_cost == null || out.unit_cost < 0) errors.push('unit_cost invalid');

    return { ok: errors.length === 0, errors, data: out };
}

export function validateWhExport(msg) {
    const errors = [];
    const out = {
        export_id: safeStr(msg.export_id),
        product_id: safeStr(msg.product_id),
        quantity: safeNumber(msg.quantity),
        reason: safeStr(msg.reason || 'SALE'),
        export_date: isoOrNull(msg.export_date),
    };

    if (!out.export_id) errors.push('export_id required');
    if (!out.product_id) errors.push('product_id required');
    if (out.quantity == null || out.quantity <= 0) errors.push('quantity invalid');

    return { ok: errors.length === 0, errors, data: out };
}