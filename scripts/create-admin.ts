import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/server/db.server'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env')
if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters')

async function main(email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10)
  // .env is the source of truth: re-running resets the password and keeps the role ADMIN
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'ADMIN' },
    create: { email, password: hashed, name: process.env.ADMIN_NAME || 'Admin', role: 'ADMIN' },
  })
  const others = await prisma.user.findMany({
    where: { role: 'ADMIN', NOT: { id: admin.id } },
    select: { email: true },
  })
  console.log(`Admin ready: ${admin.email}`)
  if (others.length) console.log(`Other admins still exist: ${others.map((u) => u.email).join(', ')}`)
}

main(email, password)
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
