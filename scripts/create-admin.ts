import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const email = 'admin@supermart.com'
  const password = 'admin123' // Change this to a secure password
  const name = 'Super Admin'

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    })

    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', email)
      console.log('   Use this email to login at /admin/login')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', admin.email)
    console.log('Password:', password)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 Login at: http://localhost:3000/admin/login')
    console.log('')
    console.log('⚠️  IMPORTANT: Change the password after first login!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
