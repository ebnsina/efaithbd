// Run: npx tsx src/features/admin-pages/markdown-preview.check.ts
import assert from 'node:assert'
import { parseMarkdown, splitBold } from './markdown-preview'

assert.deepStrictEqual(parseMarkdown('Intro line one\nline two\n\n## Mission\n### Sub\n- a\n- **b**\n\nEnd'), [
  { type: 'p', text: 'Intro line one line two' },
  { type: 'h2', text: 'Mission' },
  { type: 'h3', text: 'Sub' },
  { type: 'ul', items: ['a', '**b**'] },
  { type: 'p', text: 'End' },
])
assert.deepStrictEqual(parseMarkdown('# not a heading\r\n-not a list'), [
  { type: 'p', text: '# not a heading -not a list' },
])
assert.deepStrictEqual(parseMarkdown('  \n\n'), [])
assert.deepStrictEqual(splitBold('a **b** c **d**'), ['a ', 'b', ' c ', 'd', ''])
assert.deepStrictEqual(splitBold('no ** pair'), ['no ** pair'])
console.log('markdown-preview ok')
