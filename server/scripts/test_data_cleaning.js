// scripts/test_data_cleaning.js
import {
    normalizeName,
    normalizePhone,
    normalizeEmail,
    expandAbbreviations,
    cleanProductName,
    removeExtraSpaces,
} from '../utils/dataCleaning.util.js';

console.log('🧪 Testing Data Cleaning Functions\n');

// Test 1: normalizeName
console.log('=== Test 1: normalizeName ===');
const testNames = [
    '  NGUYEN van a  ',
    'le t nga',
    'TRAN thi B',
    '   hoang   van   c   ',
];

testNames.forEach(name => {
    const cleaned = normalizeName(name);
    console.log(`"${name}" → "${cleaned}"`);
});

// Test 2: expandAbbreviations
console.log('\n=== Test 2: expandAbbreviations ===');
const testAbbr = [
    'Ng V A',
    'L T Nga',
    'Tr. Thi B',
    'Ph. Van C',
    'H. Hoang D',
];

testAbbr.forEach(name => {
    const expanded = expandAbbreviations(name);
    console.log(`"${name}" → "${expanded}"`);
});

// Test 3: Full name cleaning pipeline
console.log('\n=== Test 3: Full Name Cleaning Pipeline ===');
const testFullNames = [
    '  NGUYEN van b  ',
    'le t nga',
    'Ng V A',
    'Tr. Thi B',
];

testFullNames.forEach(name => {
    const normalized = normalizeName(name);
    const expanded = expandAbbreviations(normalized);
    console.log(`"${name}" → "${normalized}" → "${expanded}"`);
});

// Test 4: normalizePhone
console.log('\n=== Test 4: normalizePhone ===');
const testPhones = [
    '+84912345678',
    '(+84)912345678',
    '84912345678',
    '0912345678',
    '  0987654321  ',
];

testPhones.forEach(phone => {
    const cleaned = normalizePhone(phone);
    console.log(`"${phone}" → "${cleaned}"`);
});

// Test 5: normalizeEmail
console.log('\n=== Test 5: normalizeEmail ===');
const testEmails = [
    '  USER@EXAMPLE.COM  ',
    'Test.User@Gmail.COM',
    'admin@COMPANY.vn',
];

testEmails.forEach(email => {
    const cleaned = normalizeEmail(email);
    console.log(`"${email}" → "${cleaned}"`);
});

// Test 6: cleanProductName
console.log('\n=== Test 6: cleanProductName ===');
const testProducts = [
    '  COM TAM  ',
    'CAFE SUA',
    '  banh   mi  ',
    'PHO BO',
];

testProducts.forEach(product => {
    const cleaned = cleanProductName(product);
    console.log(`"${product}" → "${cleaned}"`);
});

console.log('\n✅ All tests completed!');
