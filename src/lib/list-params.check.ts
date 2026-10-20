// Run: npx tsx src/lib/list-params.check.ts
import assert from 'node:assert'
import { parseListParams, pickParam } from './list-params'
const p = (s: string) => parseListParams(new URLSearchParams(s), ['name', 'createdAt'] as const, 'createdAt')
assert.deepStrictEqual(p(''), { q: '', dir: 'desc', sort: 'createdAt', skip: 0, take: 20 })
assert.deepStrictEqual(p('q=%20seed%20&page=3&pageSize=10&sort=name&dir=asc'), { q: 'seed', dir: 'asc', sort: 'name', skip: 20, take: 10 })
assert.deepStrictEqual(p('page=-1&pageSize=9999&sort=password&dir=sideways'), { q: '', dir: 'desc', sort: 'createdAt', skip: 0, take: 20 })
assert.deepStrictEqual(p('page=abc'), { q: '', dir: 'desc', sort: 'createdAt', skip: 0, take: 20 })
assert.equal(pickParam(new URLSearchParams('status=PENDING'), 'status', ['PENDING', 'SHIPPED'] as const), 'PENDING')
assert.equal(pickParam(new URLSearchParams('status=DROP'), 'status', ['PENDING'] as const), undefined)
console.log('list-params ok')
