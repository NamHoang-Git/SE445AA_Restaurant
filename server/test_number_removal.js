// Quick test for number removal
import { cleanUserData } from './utils/dataCleaning.util.js';

console.log('Testing number removal:\n');

const test1 = cleanUserData({ name: 'nguyễn van a4' });
console.log(`Input:  "nguyễn van a4"`);
console.log(`Output: "${test1.name}"`);
console.log(`Expected: "Nguyễn Văn A" (no "4")`);
console.log(`Status: ${test1.name.includes('4') ? '❌ FAIL - Number still present!' : '✅ PASS'}\n`);

const test2 = cleanUserData({ name: 'le t nga123' });
console.log(`Input:  "le t nga123"`);
console.log(`Output: "${test2.name}"`);
console.log(`Expected: "Le Thị Nga" (no "123")`);
console.log(`Status: ${test2.name.includes('1') || test2.name.includes('2') || test2.name.includes('3') ? '❌ FAIL' : '✅ PASS'}`);
