// Test enhanced Vietnamese name cleaning
import { cleanUserData } from './utils/dataCleaning.util.js';

const testCases = [
    { input: 'tran thi xuan', expected: 'Trần Thị Xuân' },
    { input: 'VKhiem', expected: 'Văn Khiêm' },
    { input: 'V Khiem', expected: 'Văn Khiêm' },
    { input: 'nguyễn văn a', expected: 'Nguyễn Văn A' },
    { input: 'lê hoàng cường', expected: 'Lê Hoàng Cường' },
    { input: 'NguyenVanA', expected: 'Nguyễn Văn A' },
];

console.log('Testing Enhanced Vietnamese Name Cleaning:\n');

testCases.forEach(({ input, expected }) => {
    const result = cleanUserData({ name: input }).name;
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} "${input}" → "${result}"`);
    if (result !== expected) {
        console.log(`   Expected: "${expected}"`);
    }
});
