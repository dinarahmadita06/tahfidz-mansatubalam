/**
 * Test suite for summarizeCatatanBulanan helper
 * Validates all required test cases
 */

import { summarizeCatatanBulanan } from './summarizeCatatanBulanan';

// Test case descriptions
const testCases = [
  {
    name: 'Case 1: Empty catatan',
    input: [],
    expected: '–',
    description: 'Should return "–" when no catatan'
  },
  {
    name: 'Case 2: Single catatan',
    input: ['Perbaiki tajwid dengan lebih teliti'],
    expected: 'Perbaiki tajwid dengan lebih teliti',
    description: 'Should return single catatan as-is (truncated if needed)'
  },
  {
    name: 'Case 3: Single catatan (long)',
    input: ['Perbaiki tajwid dengan lebih teliti dan perhatikan setiap huruf, jangan terburu-buru dalam membaca'],
    expected: 'Perbaiki tajwid dengan lebih teliti dan perhatikan setiap h...',
    description: 'Should truncate long single catatan to 120 chars'
  },
  {
    name: 'Case 4: Multiple catatan with tajwid & makhraj keywords',
    input: [
      'Perbaiki tajwid dalam membaca surah',
      'Perhatikan pengucapan huruf dan makhraj',
      'Huruf ha perlu ditingkatkan artikulasinya'
    ],
    expected: 'Tajwid & Makhraj perlu diperbaiki.',
    description: 'Should summarize with top 2 matching categories'
  },
  {
    name: 'Case 5: Multiple catatan with kelancaran & irama keywords',
    input: [
      'Bacaan masih terbata-bata',
      'Perluas waqaf dan takhsis irama bacaan',
      'Kelancaran perlu ditingkatkan lagi'
    ],
    expected: 'Kelancaran perlu ditingkatkan.',
    description: 'Should identify dominant category (kelancaran)'
  },
  {
    name: 'Case 6: Multiple catatan with perkembangan positif',
    input: [
      'Siswa sudah bagus membaca',
      'Lanjutkan konsistensi dalam belajar',
      'Perkembangan stabil'
    ],
    expected: 'Perkembangan baik.',
    description: 'Should recognize positive progress keywords'
  },
  {
    name: 'Case 7: Multiple catatan with no matching keywords',
    input: [
      'Siswa masuk hari ini',
      'Hadir di kelas',
      'Mengikuti pembelajaran dengan baik'
    ],
    expected: 'Mengikuti pembelajaran dengan baik',
    description: 'Should fallback to last catatan when no keywords match'
  },
  {
    name: 'Case 8: Empty strings and null values',
    input: [null, '', '   ', 'Perbaiki tajwid', '', null],
    expected: 'Perbaiki tajwid',
    description: 'Should filter out empty/null values'
  },
  {
    name: 'Case 9: Multiple keywords, select top 2',
    input: [
      'Tajwid perlu diperbaiki terutama ikhfa',
      'Makhraj huruf ha dan kha perlu dilatih',
      'Kelancaran bacaan terbata-bata',
      'Keindahan bacaan belum ada'
    ],
    expected: 'Tajwid & Makhraj perlu diperbaiki.',
    description: 'Should select 2 categories with highest scores'
  },
  {
    name: 'Case 10: Very long summary truncated',
    input: [
      'Tajwid perlu diperbaiki',
      'Makhraj perlu ditingkatkan',
      'Kelancaran perlu ditingkatkan',
      'Keindahan bacaan perlu ditingkatkan'
    ],
    expected: 'Tajwid & Makhraj perlu diperbaiki.',
    description: 'Should handle long summary by selecting only 2 themes'
  }
];

// Run all test cases
console.log('🧪 Running Test Suite: summarizeCatatanBulanan\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  const result = summarizeCatatanBulanan(testCase.input);
  const passed = result === testCase.expected;

  if (passed) {
    console.log(`✅ ${testCase.name}`);
    passedTests++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"`);
    failedTests++;
  }
  console.log(`   ${testCase.description}\n`);
});

// Summary
console.log('=' * 60);
console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed\n`);

if (failedTests === 0) {
  console.log('✨ All tests passed! The summarizer is working correctly.\n');
} else {
  console.log(`⚠️  ${failedTests} test(s) failed. Please review the implementation.\n`);
}
