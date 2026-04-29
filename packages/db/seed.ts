import { PrismaClient, UserRole, SellerTier, SellerStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecom.dev' },
    update: {},
    create: {
      email: 'admin@ecom.dev',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  // 2. Create Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      commissionRate: 5.0,
    },
  })

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      slug: 'fashion',
      commissionRate: 15.0,
    },
  })

  // 3. Create Seller
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@ecom.dev' },
    update: {},
    create: {
      email: 'seller@ecom.dev',
      role: UserRole.SELLER,
      isActive: true,
    },
  })

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      businessName: 'Global Tech Store',
      tier: SellerTier.BRAND,
      status: SellerStatus.ACTIVE,
    },
  })

  // 4. Create Brand
  const brand = await prisma.brand.upsert({
    where: { slug: 'generic-brand' },
    update: {},
    create: {
      name: 'Generic Brand',
      slug: 'generic-brand',
      isVerified: true,
    },
  })

  // 5. Create Product
  const product = await prisma.product.create({
    data: {
      title: 'Super Phone Pro',
      slug: 'super-phone-pro',
      description: 'The best phone ever.',
      brandId: brand.id,
      categoryId: electronics.id,
      sellerId: seller.id,
      status: 'ACTIVE',
      variants: {
        create: {
          sku: 'PHONE-PRO-RED',
          price: 999.99,
          attributes: { color: 'Red', storage: '256GB' },
        },
      },
    },
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
