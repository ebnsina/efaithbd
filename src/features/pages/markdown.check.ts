// Run: npx tsx src/features/pages/markdown.check.ts
import assert from 'node:assert'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown, parseInline, parseMarkdown } from './markdown'

const t = (text: string, bold = false) => ({ text, bold })

assert.deepStrictEqual(parseInline('a **b** c'), [t('a '), t('b', true), t(' c')])
assert.deepStrictEqual(parseInline('**all**'), [t('all', true)])
assert.deepStrictEqual(parseInline('2 ** 3'), [t('2 ** 3')])
assert.deepStrictEqual(parseInline('<script>x</script>'), [t('<script>x</script>')])

assert.deepStrictEqual(
  parseMarkdown(
    'Intro line one\nline two\n\n## Our **Mission**\nWe ship.\n### Values\n- Fair **prices**\n- Fast\nAfter list\n\n\n#### not a heading',
  ),
  [
    { type: 'p', content: [t('Intro line one line two')] },
    { type: 'h2', content: [t('Our '), t('Mission', true)] },
    { type: 'p', content: [t('We ship.')] },
    { type: 'h3', content: [t('Values')] },
    { type: 'ul', items: [[t('Fair '), t('prices', true)], [t('Fast')]] },
    { type: 'p', content: [t('After list')] },
    { type: 'p', content: [t('#### not a heading')] },
  ],
)
assert.deepStrictEqual(parseMarkdown('Para\n- item'), [
  { type: 'p', content: [t('Para')] },
  { type: 'ul', items: [[t('item')]] },
])
assert.deepStrictEqual(parseMarkdown('\r\n  \r\n'), [])
console.log('markdown ok')

// {siteName} is substituted before parsing, so it works inside bold text and headings
const html = renderToStaticMarkup(createElement(Markdown, { source: '## About **{siteName}**', siteName: 'efaithbd.com' }))
assert.ok(html.includes('<strong>efaithbd.com</strong>') && !html.includes('{siteName}'), html)
console.log('siteName substitution ok')
