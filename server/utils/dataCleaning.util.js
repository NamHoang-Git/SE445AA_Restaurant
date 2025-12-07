// utils/dataCleaning.util.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load abbreviation rules
let abbreviationRules = {};
try {
    const rulesPath = path.join(__dirname, '../config/abbreviation_rules.json');
    const rulesData = fs.readFileSync(rulesPath, 'utf8');
    abbreviationRules = JSON.parse(rulesData);
} catch (err) {
    console.warn('⚠️ Could not load abbreviation_rules.json:', err.message);
}

/**
 * Remove extra spaces and trim
 * "  hello   world  " → "hello world"
 */
export function removeExtraSpaces(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\s+/g, ' ').trim();
}

/**
 * Normalize name: proper case, remove extra spaces
 * "  NGUYEN van a  " → "Nguyen Van A"
 * "le t nga" → "Le T Nga"
 */
export function normalizeName(str) {
    if (!str || typeof str !== 'string') return '';

    // Remove extra spaces and convert to lowercase
    let cleaned = removeExtraSpaces(str).toLowerCase();

    // Capitalize first letter of each word
    cleaned = cleaned.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

    return cleaned;
}

/**
 * Normalize phone number
 * "+84912345678" → "0912345678"
 * "(+84)912345678" → "0912345678"
 * "84912345678" → "0912345678"
 */
export function normalizePhone(str) {
    if (!str || typeof str !== 'string') return '';

    // Remove all non-digit characters
    let cleaned = str.replace(/\D/g, '');

    // Convert +84 or 84 prefix to 0
    if (cleaned.startsWith('84')) {
        cleaned = '0' + cleaned.substring(2);
    }

    return cleaned;
}

/**
 * Normalize email: lowercase and trim
 * "  USER@EXAMPLE.COM  " → "user@example.com"
 */
export function normalizeEmail(str) {
    if (!str || typeof str !== 'string') return '';
    return removeExtraSpaces(str).toLowerCase();
}

/**
 * Expand abbreviations in Vietnamese names
 * "Ng V A" → "Nguyen Van A"
 * "L T Nga" → "Le Thi Nga"
 * "Tr. Thi B" → "Tran Thi B"
 */
export function expandAbbreviations(name) {
    if (!name || typeof name !== 'string') return '';

    let expanded = name;

    // Iterate through abbreviation rules
    for (const [fullForm, abbreviations] of Object.entries(abbreviationRules)) {
        for (const abbr of abbreviations) {
            // Create regex to match abbreviation as whole word
            // Match at start of string or after space, followed by space or dot or end
            const regex = new RegExp(`\\b${escapeRegex(abbr)}(?=\\s|\\.|$)`, 'gi');
            expanded = expanded.replace(regex, fullForm);
        }
    }

    return expanded;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clean product name: remove extra spaces, proper case
 * "  COM TAM  " → "Com Tam"
 */
export function cleanProductName(str) {
    if (!str || typeof str !== 'string') return '';

    // Remove extra spaces
    let cleaned = removeExtraSpaces(str);

    // Convert to proper case (first letter of each word capitalized)
    cleaned = cleaned.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

    return cleaned;
}

/**
 * Full cleaning pipeline for user data
 */
export function cleanUserData(userData) {
    const cleaned = { ...userData };

    if (cleaned.name) {
        cleaned.name = normalizeName(cleaned.name);
        // Disable expandAbbreviations - causes issues with full names
        // cleaned.name = expandAbbreviations(cleaned.name);
    }

    if (cleaned.email) {
        cleaned.email = normalizeEmail(cleaned.email);
    }

    if (cleaned.phone) {
        cleaned.phone = normalizePhone(cleaned.phone);
    }

    return cleaned;
}

/**
 * Full cleaning pipeline for product data
 */
export function cleanProductData(productData) {
    const cleaned = { ...productData };

    if (cleaned.name) {
        cleaned.name = cleanProductName(cleaned.name);
    }

    return cleaned;
}
