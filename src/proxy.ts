import { auth } from '@/lib/auth'

// One gate for every admin API route, so a new route can't ship unprotected
export const proxy = auth((req) => {
  if (req.auth?.user?.role !== 'ADMIN') {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
})

export const config = { matcher: '/api/admin/:path*' }
