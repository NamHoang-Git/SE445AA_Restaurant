// Test Vietnamese name cleaning - Updated
import { cleanUserData } from './utils/dataCleaning.util.js';

const testCases = [
    { input: 'lê t nga', expected: 'Lê Thị Nga' },
    { input: 'nguyễn van a4', expected: 'Nguyễn Văn A' },
    { input: 'le t nga', expected: 'Le Thi Nga' },
    { input: 'nguyễn v xuân', expected: 'Nguyễn Văn Xuân' },
    { input: 'lê hoàng cường', expected: 'Lê Hoàng Cường' },
    { input: 'TRẦN VĂN A', expected: 'Trần Văn A' },
    { input: 'ng v a', expected: 'Nguyễn Văn A' },
    { input: 'l. t. nga', expected: 'Lê Thị Nga' },
    { input: 'nguyen v a123', expected: 'Nguyen Van A' },
];

console.log('Testing Vietnamese Name Cleaning:\n');

testCases.forEach(({ input, expected }) => {
    const result = cleanUserData({ name: input }).name;
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} "${input}" → "${result}"`);
    if (result !== expected) {
        console.log(`   Expected: "${expected}"`);
    }
});
