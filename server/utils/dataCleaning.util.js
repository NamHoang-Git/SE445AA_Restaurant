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
 * "lê hoàng cường" → "Lê Hoàng Cường"
 * "nguyễn v xuân" → "Nguyễn V Xuân"
 */
export function normalizeName(str) {
    if (!str || typeof str !== 'string') return '';

    // Remove extra spaces and convert to lowercase
    let cleaned = removeExtraSpaces(str).toLowerCase();

    // Capitalize first letter of each word (Unicode-aware)
    // Split by spaces, capitalize each word, then join back
    cleaned = cleaned
        .split(/\s+/)
        .map(word => {
            if (!word) return word;
            // Use Unicode-aware charAt to handle Vietnamese diacritics
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

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
 * "ng v a" → "nguyễn văn a"
 * "l t nga" → "lê thị nga"
 * "tr. thi b" → "trần thị b"
 */
export function expandAbbreviations(name) {
    if (!name || typeof name !== 'string') return '';

    // Split by spaces, expand each word, then join back
    const words = name.split(/\s+/);

    const expanded = words.map(word => {
        // Remove trailing dots for matching
        const cleanWord = word.replace(/\.$/, '');

        // Check if this word matches any abbreviation
        for (const [fullForm, abbreviations] of Object.entries(abbreviationRules)) {
            for (const abbr of abbreviations) {
                // Exact match (case-insensitive, ignoring trailing dots)
                if (cleanWord.toLowerCase() === abbr.replace(/\.$/, '').toLowerCase()) {
                    return fullForm;
                }
            }
        }

        // No match found, return original word
        return word;
    });

    return expanded.join(' ');
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
 * "cơm tấm sườn" → "Cơm Tấm Sườn"
 */
export function cleanProductName(str) {
    if (!str || typeof str !== 'string') return '';

    // Remove extra spaces
    let cleaned = removeExtraSpaces(str);

    // Convert to proper case (Unicode-aware)
    cleaned = cleaned
        .toLowerCase()
        .split(/\s+/)
        .map(word => {
            if (!word) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

    return cleaned;
}

/**
 * Full cleaning pipeline for user data
 */
export function cleanUserData(userData) {
    const cleaned = { ...userData };

    if (cleaned.name) {
        // Step 1: Remove extra spaces and lowercase
        let name = removeExtraSpaces(cleaned.name).toLowerCase();

        // Step 2: Remove numbers and special characters (keep letters, spaces, Vietnamese diacritics)
        // Keep: a-z, Vietnamese letters (à, á, ả, ã, ạ, ă, ằ, ắ, ẳ, ẵ, ặ, â, ầ, ấ, ẩ, ẫ, ậ, đ, è, é, ẻ, ẽ, ẹ, ê, ề, ế, ể, ễ, ệ, ì, í, ỉ, ĩ, ị, ò, ó, ỏ, õ, ọ, ô, ồ, ố, ổ, ỗ, ộ, ơ, ờ, ớ, ở, ỡ, ợ, ù, ú, ủ, ũ, ụ, ư, ừ, ứ, ử, ữ, ự, ỳ, ý, ỷ, ỹ, ỵ), spaces, dots
        name = name.replace(/[^a-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\s.]/g, '');

        // Step 3: Expand abbreviations (while lowercase)
        // "lê t nga" → "lê thị nga"
        name = expandAbbreviations(name);

        // Step 4: Capitalize each word (Unicode-aware) - AFTER expansion
        // "lê thị nga" → "Lê Thị Nga"
        name = name
            .split(/\s+/)
            .map(word => {
                if (!word) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');

        cleaned.name = name;
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
