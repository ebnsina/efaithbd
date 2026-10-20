// Run: npx tsx src/lib/list-search.check.ts
import assert from 'node:assert'
import * as v from 'valibot'
import { listSearchSchema, toPrismaPage } from './list-search'

const parse = (input: unknown) => v.parse(listSearchSchema, input)
assert.deepStrictEqual(parse({}), { q: '', page: 1, sort: '', dir: 'desc' })
assert.deepStrictEqual(parse({ q: ' seed ', page: 3, sort: 'name', dir: 'asc' }), { q: 'seed', page: 3, sort: 'name', dir: 'asc' })
assert.deepStrictEqual(parse({ page: -1, dir: 'sideways', q: 5 }), { q: '', page: 1, sort: '', dir: 'desc' })
assert.deepStrictEqual(toPrismaPage(parse({ page: 2, sort: 'password' }), ['name', 'createdAt'], 'createdAt'), {
  orderBy: { createdAt: 'desc' },
  skip: 20,
  take: 20,
})
assert.deepStrictEqual(toPrismaPage(parse({ sort: 'name', dir: 'asc' }), ['name'], 'name').orderBy, { name: 'asc' })
console.log('list-search ok')
