import 'dotenv/config'
import { PrismaClient } from '@/generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Delete all existing data
  console.log('🗑️  Deleting existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.user.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.productSection.deleteMany()
  await prisma.midBanner.deleteMany()
  await prisma.featureCard.deleteMany()
  await prisma.footerLink.deleteMany()
  await prisma.footerSection.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.contactInfo.deleteMany()
  await prisma.basicSettings.deleteMany()
  await prisma.footerSettings.deleteMany()
  await prisma.menuItem.deleteMany()
  console.log('✅ Existing data deleted')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@supermart.com' },
    update: {},
    create: {
      email: 'admin@supermart.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create categories with realistic images
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic gadgets and devices',
      image:
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      image:
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Home decor and living essentials',
      image:
        'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=600&fit=crop',
    },
    {
      name: 'Beauty',
      slug: 'beauty',
      description: 'Beauty and personal care',
      image:
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
    },
    {
      name: 'Groceries',
      slug: 'groceries',
      description: 'Daily grocery and essentials',
      image:
        'https://images.unsplash.com/photo-1543168256-418811576931?w=800&h=600&fit=crop',
    },
    {
      name: 'Baby Care',
      slug: 'baby-care',
      description: 'Baby food and care products',
      image:
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    },
    {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Sports gear and outdoor items',
      image:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
    },
    {
      name: 'Automotive',
      slug: 'automotive',
      description: 'Vehicle parts and accessories',
      image:
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and educational materials',
      image:
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop',
    },
    {
      name: 'Furniture',
      slug: 'furniture',
      description: 'Furniture and home essentials',
    },
    {
      name: 'Kitchen Appliances',
      slug: 'kitchen-appliances',
      description: 'Kitchen tools and appliances',
    },
    {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Health supplements and wellness items',
    },
    {
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      description: 'Pet food and accessories',
      image:
        'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=600&fit=crop',
    },
    {
      name: 'Jewelry',
      slug: 'jewelry',
      description: 'Jewelry and ornaments',
      image:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes and sandals',
      image:
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=600&fit=crop',
    },
    {
      name: 'Mobile Accessories',
      slug: 'mobile-accessories',
      description: 'Phone accessories and gadgets',
      image:
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop',
    },
    {
      name: 'Computer & Gaming',
      slug: 'computer-gaming',
      description: 'Computers, gaming gear and accessories',
      image:
        'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=600&fit=crop',
    },
    {
      name: 'Travel & Luggage',
      slug: 'travel-luggage',
      description: 'Travel bags and accessories',
      image:
        'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&h=600&fit=crop',
    },
    {
      name: 'Stationery',
      slug: 'stationery',
      description: 'Office and school supplies',
      image:
        'https://images.unsplash.com/photo-1606602747656-297166738ea8?w=800&h=600&fit=crop',
    },
    {
      name: 'Tools & Hardware',
      slug: 'tools-hardware',
      description: 'Hardware and repair tools',
      image:
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop',
    },
    {
      name: 'Home Cleaning',
      slug: 'home-cleaning',
      description: 'Cleaning products and essentials',
      image:
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Update categories with missing images
  await prisma.category.update({
    where: { slug: 'furniture' },
    data: {
      image:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    },
  })
  await prisma.category.update({
    where: { slug: 'kitchen-appliances' },
    data: {
      image:
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
    },
  })
  await prisma.category.update({
    where: { slug: 'health-wellness' },
    data: {
      image:
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
    },
  })

  // Create Menu Items with Mega Menu
  console.log('Creating menu items...')

  // Home menu
  await prisma.menuItem.create({
    data: {
      label: 'Home',
      url: '/',
      type: 'CUSTOM',
      order: 1,
      active: true,
      megaMenu: false,
    },
  })

  // Categories menu with mega menu
  const categoriesMenu = await prisma.menuItem.create({
    data: {
      label: 'Categories',
      url: '/categories',
      type: 'CUSTOM',
      order: 2,
      active: true,
      megaMenu: true,
      featured: true,
    },
  })

  // Add popular categories as submenu items
  const popularCategories = [
    'electronics',
    'fashion',
    'home-living',
    'beauty',
    'groceries',
    'mobile-accessories',
    'computer-gaming',
    'footwear',
  ]
  let subOrder = 1
  for (const catSlug of popularCategories) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
    if (cat) {
      await prisma.menuItem.create({
        data: {
          label: cat.name,
          url: `/categories/${cat.slug}`,
          type: 'CATEGORY',
          targetId: cat.id,
          parentId: categoriesMenu.id,
          order: subOrder++,
          active: true,
        },
      })
    }
  }

  // Hot Deals menu
  await prisma.menuItem.create({
    data: {
      label: 'Hot Deals',
      url: '/products?filter=hot-deals',
      type: 'CUSTOM',
      order: 3,
      active: true,
      featured: true,
    },
  })

  // New Arrivals menu
  await prisma.menuItem.create({
    data: {
      label: 'New Arrivals',
      url: '/products?filter=new',
      type: 'CUSTOM',
      order: 4,
      active: true,
    },
  })

  // Featured menu
  await prisma.menuItem.create({
    data: {
      label: 'Featured',
      url: '/products?filter=featured',
      type: 'CUSTOM',
      order: 5,
      active: true,
    },
  })

  // Contact menu
  await prisma.menuItem.create({
    data: {
      label: 'Contact',
      url: '/contact',
      type: 'CUSTOM',
      order: 6,
      active: true,
    },
  })

  console.log('✅ Menu items created')

  // Get all categories for product creation
  const electronicsCategory = await prisma.category.findUnique({
    where: { slug: 'electronics' },
  })

  const fashionCategory = await prisma.category.findUnique({
    where: { slug: 'fashion' },
  })

  const homeCategory = await prisma.category.findUnique({
    where: { slug: 'home-living' },
  })

  const beautyCategory = await prisma.category.findUnique({
    where: { slug: 'beauty' },
  })

  // Product templates for variety
  const productTemplates = {
    electronics: [
      {
        name: 'Wireless Headphones',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
      {
        name: 'Smart Watch',
        basePrice: 4500,
        image:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      },
      {
        name: 'Bluetooth Speaker',
        basePrice: 1800,
        image:
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      },
      {
        name: 'Laptop',
        basePrice: 45000,
        image:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      },
      {
        name: 'Smartphone',
        basePrice: 25000,
        image:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      },
      {
        name: 'Power Bank',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
      },
      {
        name: 'USB Cable',
        basePrice: 250,
        image:
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
      },
      {
        name: 'Keyboard',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      },
      {
        name: 'Mouse',
        basePrice: 800,
        image:
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      },
      {
        name: 'Webcam',
        basePrice: 2200,
        image:
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
      },
    ],
    fashion: [
      {
        name: 'Cotton T-Shirt',
        basePrice: 500,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      },
      {
        name: 'Jeans Pant',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      },
      {
        name: 'Formal Shirt',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
      },
      {
        name: 'Polo Shirt',
        basePrice: 800,
        image:
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
      },
      {
        name: 'Hoodie',
        basePrice: 1800,
        image:
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
      },
      {
        name: 'Sneakers',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      },
      {
        name: 'Watch',
        basePrice: 3000,
        image:
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500',
      },
      {
        name: 'Sunglasses',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      },
      {
        name: 'Belt',
        basePrice: 600,
        image:
          'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=500',
      },
      {
        name: 'Backpack',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      },
    ],
    home: [
      {
        name: 'Bed Sheet',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
      },
      {
        name: 'Pillow',
        basePrice: 450,
        image:
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
      },
      {
        name: 'Table Lamp',
        basePrice: 800,
        image:
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500',
      },
      {
        name: 'Wall Clock',
        basePrice: 650,
        image:
          'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500',
      },
      {
        name: 'Curtain',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500',
      },
      {
        name: 'Vase',
        basePrice: 400,
        image:
          'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500',
      },
      {
        name: 'Photo Frame',
        basePrice: 350,
        image:
          'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500',
      },
      {
        name: 'Carpet',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1600166898405-da9535204843?w=500',
      },
      {
        name: 'Cushion',
        basePrice: 350,
        image:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
      },
      {
        name: 'Storage Box',
        basePrice: 600,
        image:
          'https://images.unsplash.com/photo-1603794067602-9feaa4f70e0c?w=500',
      },
    ],
    beauty: [
      {
        name: 'Face Cream',
        basePrice: 450,
        image:
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      },
      {
        name: 'Shampoo',
        basePrice: 350,
        image:
          'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500',
      },
      {
        name: 'Body Lotion',
        basePrice: 550,
        image:
          'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500',
      },
      {
        name: 'Lipstick',
        basePrice: 400,
        image:
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
      },
      {
        name: 'Perfume',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
      },
      {
        name: 'Face Mask',
        basePrice: 250,
        image:
          'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500',
      },
      {
        name: 'Hair Oil',
        basePrice: 300,
        image:
          'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500',
      },
      {
        name: 'Sunscreen',
        basePrice: 650,
        image:
          'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=500',
      },
      {
        name: 'Nail Polish',
        basePrice: 200,
        image:
          'https://images.unsplash.com/photo-1519862170344-6cd5e49cb996?w=500',
      },
      {
        name: 'Makeup Kit',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500',
      },
    ],
  }

  let productCount = 0

  // Create products for Electronics
  if (electronicsCategory) {
    for (let i = 0; i < 25; i++) {
      const template =
        productTemplates.electronics[i % productTemplates.electronics.length]
      const variant = Math.floor(i / productTemplates.electronics.length)
      const variantName =
        variant > 0
          ? ` ${
              ['Pro', 'Plus', 'Max', 'Ultra', 'Lite'][variant - 1] ||
              `V${variant}`
            }`
          : ''

      const product = {
        name: `${template.name}${variantName}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}${variantName
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `High-quality ${template.name}${variantName} with amazing features`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.4 - 0.2))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.3 + Math.random() * 0.3)
        ),
        stock: Math.floor(Math.random() * 80) + 20,
        images: [template.image],
        categoryId: electronicsCategory.id,
        featured: i < 8,
        active: true,
      }

      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })

      // Add variants for some electronics products (every 3rd product)
      if (i % 3 === 0) {
        const variantTypes = [
          {
            name: 'Color',
            values: [
              { en: 'Black', bn: 'কালো' },
              { en: 'Silver', bn: 'রুপালী' },
              { en: 'Gold', bn: 'সোনালী' },
            ],
          },
          {
            name: 'Storage',
            values: [
              { en: '64GB', bn: '৬৪জিবি' },
              { en: '128GB', bn: '১২৮জিবি' },
              { en: '256GB', bn: '২৫৬জিবি' },
            ],
          },
        ]
        const variantType = variantTypes[i % variantTypes.length]

        for (let v = 0; v < 2; v++) {
          const val = variantType.values[v]
          await prisma.productVariant.create({
            data: {
              productId: createdProduct.id,
              name: variantType.name,
              value: val.en,
              price: v * 500,
              stock: Math.floor(Math.random() * 50) + 10,
              sku: `${product.slug}-${val.en
                .toLowerCase()
                .replace(/\s+/g, '-')}`,
            },
          })
        }
      }

      productCount++
    }
  }

  // Create products for Fashion
  if (fashionCategory) {
    for (let i = 0; i < 25; i++) {
      const template =
        productTemplates.fashion[i % productTemplates.fashion.length]
      const variant = Math.floor(i / productTemplates.fashion.length)
      const colors = [
        'Black',
        'Blue',
        'Red',
        'White',
        'Green',
        'Yellow',
        'Navy',
        'Grey',
      ]
      const colorsBn = [
        'কালো',
        'নীল',
        'লাল',
        'সাদা',
        'সবুজ',
        'হলুদ',
        'নেভি',
        'ধূসর',
      ]
      const colorIndex = variant % colors.length
      const colorName = variant > 0 ? ` - ${colors[colorIndex]}` : ''
      const colorNameBn = variant > 0 ? ` - ${colorsBn[colorIndex]}` : ''

      const product = {
        name: `${template.name}${colorName}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}${colorName
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `Stylish ${template.name}${colorName} for everyday wear`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.3 - 0.15))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.4 + Math.random() * 0.3)
        ),
        stock: Math.floor(Math.random() * 100) + 30,
        images: [template.image],
        categoryId: fashionCategory.id,
        featured: i < 8,
        active: true,
      }

      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })

      // Add size variants for fashion products (every 2nd product)
      if (i % 2 === 0) {
        const sizes = [
          { en: 'S', bn: 'এস' },
          { en: 'M', bn: 'এম' },
          { en: 'L', bn: 'এল' },
          { en: 'XL', bn: 'এক্সএল' },
        ]

        for (let v = 0; v < 3; v++) {
          const size = sizes[v]
          await prisma.productVariant.create({
            data: {
              productId: createdProduct.id,
              name: 'Size',
              value: size.en,
              price: 0,
              stock: Math.floor(Math.random() * 60) + 20,
              sku: `${product.slug}-size-${size.en.toLowerCase()}`,
            },
          })
        }
      }

      productCount++
    }
  }

  // Create products for Home & Living
  if (homeCategory) {
    for (let i = 0; i < 25; i++) {
      const template = productTemplates.home[i % productTemplates.home.length]
      const variant = Math.floor(i / productTemplates.home.length)
      const sizes = ['Small', 'Medium', 'Large', 'XL', 'Set of 2', 'Set of 4']
      const sizesBn = ['ছোট', 'মাঝারি', 'বড়', 'এক্সএল', '২টি সেট', '৪টি সেট']
      const sizeIndex = variant % sizes.length
      const sizeName = variant > 0 ? ` - ${sizes[sizeIndex]}` : ''
      const sizeNameBn = variant > 0 ? ` - ${sizesBn[sizeIndex]}` : ''

      const product = {
        name: `${template.name}${sizeName}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}${sizeName
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `Premium quality ${template.name}${sizeName} for your home`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.35 - 0.15))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.35 + Math.random() * 0.25)
        ),
        stock: Math.floor(Math.random() * 60) + 20,
        images: [template.image],
        categoryId: homeCategory.id,
        featured: i < 8,
        active: true,
      }

      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })

      // Add material variants for home products (every 4th product)
      if (i % 4 === 0) {
        const materials = [
          { en: 'Cotton', bn: 'কটন' },
          { en: 'Polyester', bn: 'পলিয়েস্টার' },
          { en: 'Silk', bn: 'সিল্ক' },
        ]

        for (let v = 0; v < 2; v++) {
          const material = materials[v]
          await prisma.productVariant.create({
            data: {
              productId: createdProduct.id,
              name: 'Material',
              value: material.en,
              price: v * 200,
              stock: Math.floor(Math.random() * 40) + 15,
              sku: `${product.slug}-${material.en.toLowerCase()}`,
            },
          })
        }
      }

      productCount++
    }
  }

  // Create products for Beauty
  if (beautyCategory) {
    for (let i = 0; i < 25; i++) {
      const template =
        productTemplates.beauty[i % productTemplates.beauty.length]
      const variant = Math.floor(i / productTemplates.beauty.length)
      const brands = ['Premium', 'Natural', 'Organic', 'Luxury', 'Professional']
      const brandsBn = [
        'প্রিমিয়াম',
        'ন্যাচারাল',
        'অর্গানিক',
        'লাক্সারি',
        'প্রফেশনাল',
      ]
      const brandIndex = variant % brands.length
      const brandName = variant > 0 ? `${brands[brandIndex]} ` : ''
      const brandNameBn = variant > 0 ? `${brandsBn[brandIndex]} ` : ''

      const product = {
        name: `${brandName}${template.name}`,
        slug: `${brandName.toLowerCase().replace(/\s+/g, '-')}${template.name
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `${brandName}${template.name} for beautiful skin and hair`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.4 - 0.2))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.5 + Math.random() * 0.3)
        ),
        stock: Math.floor(Math.random() * 70) + 25,
        images: [template.image],
        categoryId: beautyCategory.id,
        featured: i < 8,
        active: true,
      }

      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })

      // Add volume variants for beauty products (every 3rd product)
      if (i % 3 === 0) {
        const volumes = [
          { en: '50ml', bn: '৫০মিলি' },
          { en: '100ml', bn: '১০০মিলি' },
          { en: '200ml', bn: '২০০মিলি' },
        ]

        for (let v = 0; v < 2; v++) {
          const volume = volumes[v]
          await prisma.productVariant.create({
            data: {
              productId: createdProduct.id,
              name: 'Volume',
              value: volume.en,
              price: v * 150,
              stock: Math.floor(Math.random() * 50) + 20,
              sku: `${product.slug}-${volume.en.toLowerCase()}`,
            },
          })
        }
      }

      productCount++
    }
  }

  console.log(`✅ ${productCount} products created`)

  // Create sample coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off on first order',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 1000,
      maxDiscount: 500,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 100,
      active: true,
    },
  })

  console.log('✅ Sample coupon created')

  // Seed Basic Settings
  const settings = await prisma.basicSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'SuperMart',
      promoText: 'Free shipping on orders over 500 Taka',
      promoActive: true,
    },
  })
  console.log('✅ Basic settings created')

  // Create banners
  await prisma.banner.createMany({
    data: [
      {
        image:
          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop',
        link: '/products',
        order: 1,
        active: true,
      },
      {
        image:
          'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=500&fit=crop',
        link: '/products',
        order: 2,
        active: true,
      },
    ],
  })
  console.log('✅ Banners created')

  // Create product sections
  await prisma.productSection.createMany({
    data: [
      {
        title: 'Featured Products',
        type: 'FEATURED',
        order: 1,
        limit: 12,
        active: true,
      },
      {
        title: 'New Arrivals',
        type: 'NEW_ARRIVAL',
        order: 2,
        limit: 12,
        active: true,
      },
      {
        title: 'Hot Deals',
        type: 'HOT_DEALS',
        order: 3,
        limit: 12,
        active: true,
      },
    ],
  })
  console.log('✅ Product sections created')

  // Create mid banner
  await prisma.midBanner.create({
    data: {
      image:
        'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200&h=300&fit=crop',
      link: '/products',
      position: 2,
      active: true,
    },
  })
  console.log('✅ Mid banner created')

  // Create feature cards
  await prisma.featureCard.createMany({
    data: [
      {
        title: 'Free Shipping',
        description: 'On orders over 500 Taka',
        icon: 'truck',
        order: 1,
        active: true,
      },
      {
        title: '24/7 Support',
        description: 'Always here to help',
        icon: 'headphones',
        order: 2,
        active: true,
      },
      {
        title: 'Secure Payment',
        description: 'COD & bKash available',
        icon: 'shield',
        order: 3,
        active: true,
      },
      {
        title: 'Easy Returns',
        description: '7 days return policy',
        icon: 'credit-card',
        order: 4,
        active: true,
      },
    ],
  })
  console.log('✅ Feature cards created')

  // Create Contact Info
  await prisma.contactInfo.create({
    data: {
      phone: '09613-800800',
      email: 'support@supermart.com',
    },
  })
  console.log('✅ Contact Info created')

  // Create Footer Settings
  await prisma.footerSettings.create({
    data: {
      phone: '09613-800800',
      email: 'support@supermart.com',
      paymentMethods: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Nagad_logo.svg/1200px-Nagad_logo.svg.png',
        'https://seeklogo.com/images/V/visa-logo-6F4057663D-seeklogo.com.png',
        'https://seeklogo.com/images/M/mastercard-logo-6C29F0B667-seeklogo.com.png',
        'https://www.logo.wine/a/logo/American_Express/American_Express-Logo.wine.svg',
        'https://seeklogo.com/images/B/bkash-logo-835789094B-seeklogo.com.png',
      ],
      showPaymentMethods: true,
      enableNewsletter: true,
    },
  })
  console.log('✅ Footer settings created')

  // Create Footer Sections
  const companySection = await prisma.footerSection.create({
    data: {
      title: 'COMPANY',
      order: 1,
    },
  })

  const accountSection = await prisma.footerSection.create({
    data: {
      title: 'MY ACCOUNT',
      order: 2,
    },
  })

  const serviceSection = await prisma.footerSection.create({
    data: {
      title: 'CUSTOMER SERVICE',
      order: 3,
    },
  })

  console.log('✅ Footer Sections created')

  // Create Footer Links
  await prisma.footerLink.createMany({
    data: [
      // Company Section
      {
        sectionId: companySection.id,
        label: 'About Us',
        url: '/about',
        order: 1,
      },
      {
        sectionId: companySection.id,
        label: 'Career',
        url: '/career',
        order: 2,
      },
      {
        sectionId: companySection.id,
        label: 'Contact Us',
        url: '/contact',
        order: 3,
      },
      {
        sectionId: companySection.id,
        label: 'Privacy Policy',
        url: '/privacy',
        order: 4,
      },
      {
        sectionId: companySection.id,
        label: 'Terms & Condition',
        url: '/terms',
        order: 5,
      },
      // Account Section
      {
        sectionId: accountSection.id,
        label: 'Sign In',
        url: '/login',
        order: 1,
      },
      {
        sectionId: accountSection.id,
        label: 'Orders',
        url: '/orders',
        order: 2,
      },
      {
        sectionId: accountSection.id,
        label: 'Addresses',
        url: '/addresses',
        order: 3,
      },
      {
        sectionId: accountSection.id,
        label: 'My Wishlist',
        url: '/wishlist',
        order: 4,
      },
      {
        sectionId: accountSection.id,
        label: 'Order History',
        url: '/order-history',
        order: 5,
      },
      {
        sectionId: accountSection.id,
        label: 'Track My Order',
        url: '/track-order',
        order: 6,
      },
      // Service Section
      {
        sectionId: serviceSection.id,
        label: 'Payment Methods',
        url: '/payment-methods',
        order: 1,
      },
      {
        sectionId: serviceSection.id,
        label: 'Support Center',
        url: '/support',
        order: 2,
      },
      {
        sectionId: serviceSection.id,
        label: 'How To Shop',
        url: '/how-to-shop',
        order: 3,
      },
      {
        sectionId: serviceSection.id,
        label: 'Featured Recommendation',
        url: '/featured',
        order: 4,
      },
      {
        sectionId: serviceSection.id,
        label: 'Cancellation, Return & Refund',
        url: '/returns',
        order: 5,
      },
    ],
  })

  console.log('✅ Footer Links created')

  // Create Social Links
  await prisma.socialLink.createMany({
    data: [
      {
        platform: 'facebook',
        url: 'https://facebook.com/supermart',
        icon: 'facebook',
        order: 1,
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/supermart',
        icon: 'twitter',
        order: 2,
      },
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/company/supermart',
        icon: 'linkedin',
        order: 3,
      },
      {
        platform: 'youtube',
        url: 'https://youtube.com/@supermart',
        icon: 'youtube',
        order: 4,
      },
    ],
  })

  console.log('✅ Social Links created')
  console.log('🎉 Seed completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
