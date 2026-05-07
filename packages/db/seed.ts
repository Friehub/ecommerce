import { PrismaClient, UserRole, SellerTier, SellerStatus, DisputeStatus, PackageStatus, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🌱 Seeding database...')

  const passwordHash = await bcrypt.hash('password123', 12);
  const Decimal = Prisma.Decimal;

  // 1. Clean existing data (idempotency)
  console.log('🧹 Cleaning existing data...');
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "User", "Product", "Seller", "Category", "Brand", "Order", "OrderPackage", "OrderLine", "ProductVariant", "StockLevel", "AffiliateAgent", "ReferralLink", "Review", "Dispute" CASCADE;
    `);
    console.log('✅ Tables truncated.');
  } catch (err) {
    console.error('❌ Truncate failed:', err);
    // Continue anyway, maybe tables are already empty
  }

  // 1. Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@ecom.dev' },
    update: {},
    create: {
      email: 'admin@ecom.dev',
      passwordHash,
      role: 'ADMIN' as any,
      isActive: true,
    },
  })

  // 2. Create Categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', commission: 5 },
    { name: 'Fashion', slug: 'fashion', commission: 15 },
    { name: 'Computing', slug: 'computing', commission: 7 },
    { name: 'Health & Beauty', slug: 'health-beauty', commission: 10 },
    { name: 'Home & Office', slug: 'home-office', commission: 8 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, commissionRate: cat.commission }
    });
    createdCategories.push(c);
  }

  // 3. Create Brands
  const brandNames = ['Apple', 'Samsung', 'HP', 'Nike', 'Adidas', 'L\'Oreal', 'Dell', 'Sony'];
  const createdBrands = [];
  for (const name of brandNames) {
    const b = await prisma.brand.upsert({
      where: { slug: name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/ /g, '-'), isVerified: true }
    });
    createdBrands.push(b);
  }

  // 4. Create Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'main-wh' },
    update: {},
    create: {
      id: 'main-wh',
      name: 'Main Jumia Hub',
      address: 'Lagos, Nigeria',
      type: 'JUMIA_HUB',
    },
  })

  // 5. Create 20 Sellers
  console.log('👥 Creating 20 sellers...');
  const createdSellers = [];
  for (let i = 1; i <= 20; i++) {
    const email = `seller${i}@ecom.dev`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: 'SELLER' as any,
        isActive: true,
        firstName: `Seller`,
        lastName: `${i}`
      },
    });

    const seller = await prisma.seller.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: `Store ${i} Ltd`,
        tier: i % 5 === 0 ? 'BRAND' as any : 'STANDARD' as any,
        status: 'ACTIVE' as any,
      },
    });
    createdSellers.push(seller);
  }

  // 6. Create 200 Products (10 per seller)
  console.log('📦 Creating 200 products...');
  const createdProducts = [];
  const createdVariants = [];
  for (const seller of createdSellers) {
    for (let j = 1; j <= 10; j++) {
      const brand = createdBrands[Math.floor(Math.random() * createdBrands.length)];
      const category = createdCategories[Math.floor(Math.random() * createdCategories.length)];
      const title = `${brand.name} ${category.name} Item ${j}`;
      const slug = `${brand.slug}-${category.slug}-${seller.id}-${j}`;

      const product = await prisma.product.create({
        data: {
          title,
          slug,
          description: `High quality ${title} from ${seller.businessName}.`,
          brandId: brand.id,
          categoryId: category.id,
          sellerId: seller.id,
          status: 'ACTIVE',
          media: {
            create: [
              { url: `https://picsum.photos/seed/${slug}/400/400`, position: 0 }
            ]
          },
          variants: {
            create: [
              {
                sku: `${slug.toUpperCase()}-STD`,
                price: new Decimal(Math.floor(Math.random() * 50000) + 1000),
                attributes: { color: 'Black', size: 'Standard' },
                stockLevels: {
                  create: {
                    sellerId: seller.id,
                    warehouseId: warehouse.id,
                    qtyOnHand: 100,
                  }
                }
              }
            ]
          }
        },
        include: { variants: true }
      });
      createdProducts.push(product);
      createdVariants.push(...product.variants);
    }
  }

  // 7. Create 50 Users (Buyers) with addresses
  console.log('👤 Creating 50 buyers...');
  const createdBuyers = [];
  for (let k = 1; k <= 50; k++) {
    const email = `buyer${k}@ecom.dev`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: 'BUYER' as any,
        isActive: true,
        firstName: `Buyer`,
        lastName: `${k}`,
        addresses: {
          create: {
            firstName: 'Buyer',
            lastName: `${k}`,
            phone: '08012345678',
            streetAddress: `${k} Main St`,
            city: 'Lagos',
            state: 'Lagos',
            isDefault: true
          }
        }
      },
      include: { addresses: true }
    });
    createdBuyers.push(user);
  }

  // 8. Create 5 Affiliate Agents
  console.log('🤝 Creating 5 affiliate agents...');
  for (let l = 1; l <= 5; l++) {
    const email = `agent${l}@ecom.dev`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: 'AGENT' as any,
        isActive: true,
      },
    });
    const agent = await prisma.affiliateAgent.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: 'ACTIVE',
        commissionRate: new Decimal(5.0)
      }
    });
    await prisma.referralLink.upsert({
      where: { slug: `AGENT${l}` },
      update: {},
      create: {
        agentId: agent.id,
        slug: `AGENT${l}`,
        targetType: 'HOME'
      }
    });
  }

  // 9. Create 50 Orders
  console.log('🛒 Creating 50 orders...');
  const orderStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  for (let m = 0; m < 50; m++) {
    const buyer = createdBuyers[Math.floor(Math.random() * createdBuyers.length)];
    const variant = createdVariants[Math.floor(Math.random() * createdVariants.length)];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as any;
    const addressId = buyer.addresses[0]?.id;

    await prisma.order.create({
      data: {
        userId: buyer.id,
        status: status,
        subtotal: variant.price,
        shippingFee: new Decimal(500),
        discount: new Decimal(0),
        total: variant.price.add(500),
        paymentMethod: 'WALLET',
        addressId: addressId,
        packages: {
          create: {
            sellerId: createdSellers[Math.floor(Math.random() * createdSellers.length)].id,
            status: (status === 'DELIVERED' || status === 'COMPLETED') ? 'DELIVERED' as any : 'PENDING' as any,
            lines: {
              create: {
                variantId: variant.id,
                quantity: 1,
                unitPrice: variant.price,
              }
            }
          }
        }
      }
    });
  }

  // 10. Create 50 Reviews
  console.log('⭐ Creating 50 reviews...');
  for (let n = 0; n < 50; n++) {
    const buyer = createdBuyers[Math.floor(Math.random() * createdBuyers.length)];
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    await prisma.review.create({
      data: {
        userId: buyer.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 3) + 3,
        comment: 'Great product, highly recommended!',
        status: 'APPROVED'
      }
    });
  }

  // 11. Create 20 Disputes
  console.log('⚖️ Creating 20 disputes...');
  for (let o = 0; o < 20; o++) {
    const buyer = createdBuyers[Math.floor(Math.random() * createdBuyers.length)];
    const seller = createdSellers[Math.floor(Math.random() * createdSellers.length)];
    const order = await prisma.order.findFirst({ where: { userId: buyer.id } });
    if (order) {
      await prisma.dispute.create({
        data: {
          orderId: order.id,
          buyerId: buyer.id,
          sellerId: seller.id,
          reason: 'Item not as described',
          status: 'OPEN' as any
        }
      });
    }
  }

  console.log('✅ Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
