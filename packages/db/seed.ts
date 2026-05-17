import { PrismaClient, UserRole, SellerTier, SellerStatus, DisputeStatus, PackageStatus, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🌱 Seeding database...')

  const userService = prisma.user;
  const categoryService = prisma.category;
  const brandService = prisma.brand;
  const warehouseService = prisma.warehouse;
  const sellerService = prisma.seller;
  const productService = prisma.product;
  const affiliateAgentService = prisma.affiliateAgent;
  const referralLinkService = prisma.referralLink;
  const orderService = prisma.order;
  const flashSaleService = prisma.flashSale;
  const bannerService = prisma.banner;

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
  await userService.upsert({
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
    { name: 'Phones & Tablets', slug: 'phones-tablets', commission: 5 },
    { name: 'Electronics', slug: 'electronics', commission: 5 },
    { name: 'Fashion', slug: 'fashion', commission: 15 },
    { name: 'Computing', slug: 'computing', commission: 7 },
    { name: 'Health & Beauty', slug: 'health-beauty', commission: 10 },
    { name: 'Home & Office', slug: 'home-office', commission: 8 },
    { name: 'Baby Products', slug: 'baby-products', commission: 12 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await categoryService.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, commissionRate: cat.commission }
    });
    createdCategories.push(c);
  }

  // 3. Create Brands
  const brandData = [
    { name: 'Apple', description: 'Innovation and design excellence from Cupertino.', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', banner: 'https://images.unsplash.com/photo-1611186871348-b1ec696e5237?q=80&w=1200' },
    { name: 'Samsung', description: 'Empowering the world with cutting-edge technology.', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', banner: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200' },
    { name: 'HP', description: 'Computing power and printing solutions for everyone.', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg', banner: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1200' },
    { name: 'Nike', description: 'Just do it. Performance apparel and footwear.', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', banner: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200' },
    { name: 'Adidas', description: 'Through sport, we have the power to change lives.', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', banner: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=1200' },
    { name: 'Sony', description: 'Creativity and technology for the ultimate experience.', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', banner: 'https://images.unsplash.com/photo-1526510747491-58f92ad296b1?q=80&w=1200' }
  ];
  const createdBrands = [];
  for (const brand of brandData) {
    const b = await brandService.upsert({
      where: { slug: brand.name.toLowerCase().replace(/ /g, '-') },
      update: {
        logoUrl: brand.logo,
        bannerUrl: brand.banner,
        description: brand.description,
        isVerified: true
      },
      create: { 
        name: brand.name, 
        slug: brand.name.toLowerCase().replace(/ /g, '-'), 
        logoUrl: brand.logo,
        bannerUrl: brand.banner,
        description: brand.description,
        isVerified: true 
      }
    });
    createdBrands.push(b);
  }

  // 4. Create Warehouse
  const warehouse = await warehouseService.upsert({
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
    const user = await userService.upsert({
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

    const seller = await sellerService.upsert({
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
  console.log('📦 Creating 200 products with high-quality assets...');
  
  const categoryImages: Record<string, string[]> = {
    'Electronics': [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800', // Headphones
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800', // Watch
      'https://images.unsplash.com/photo-1526170315870-ef68a8fdc18b?q=80&w=800', // Camera
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=800', // Earbuds
      'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800'  // Speakers
    ],
    'Fashion': [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800', // Nike Shoe
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800', // Clothing
      'https://images.unsplash.com/photo-1511499767390-a7335b719484?q=80&w=800', // Sunglasses
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800', // Shoes
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=800'  // Fashion items
    ],
    'Computing': [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800', // Laptop
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800', // Tablet
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800', // MacBook
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800', // PC
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800'  // Monitor
    ],
    'Home & Office': [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800', // Chair
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800', // Lamp
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800', // Table
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800', // Desk
      'https://images.unsplash.com/photo-1538688543446-5900fbdf6a3e?q=80&w=800'  // Decor
    ],
    'Health & Beauty': [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800', // Perfume
      'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=800', // Skincare
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800', // Beauty
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800', // Cosmetic
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800'  // Makeup
    ],
    'Phones & Tablets': [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800', // Phone
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800', // Tablet
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800', // Mobile
    ],
    'Baby Products': [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800', // Toys
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800', // Baby room
    ]
  };

  const createdProducts = [];
  const createdVariants = [];
  for (const seller of createdSellers) {
    for (let j = 1; j <= 10; j++) {
      const brand = createdBrands[Math.floor(Math.random() * createdBrands.length)];
      const category = createdCategories[Math.floor(Math.random() * createdCategories.length)];
      const title = `${brand.name} ${category.name} Edition ${j}`;
      const slug = `${brand.slug}-${category.slug}-${seller.id}-${j}`;
      
      const images = categoryImages[category.name] || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'];
      const imageUrl = images[j % images.length];

      const product = await productService.create({
        data: {
          title,
          slug,
          description: `The premium ${title} by ${brand.name}. Engineered for performance and style by ${seller.businessName}.`,
          brandId: brand.id,
          categoryId: category.id,
          sellerId: seller.id,
          status: 'ACTIVE',
          isOfficial: Math.random() > 0.5,
          isGlobal: Math.random() > 0.7,
          isExpress: Math.random() > 0.6,
          media: {
            create: [
              { url: imageUrl, position: 0 }
            ]
          },
          variants: {
            create: [
              {
                sku: `${slug.toUpperCase()}-STD`,
                price: new Decimal(Math.floor(Math.random() * 150000) + 5000),
                attributes: { color: 'Titanium', finish: 'Matte' },
                stockLevels: {
                  create: {
                    sellerId: seller.id,
                    warehouseId: warehouse.id,
                    qtyOnHand: 250,
                  }
                }
              }
            ]
          }
        },
        include: { variants: { include: { product: true } } }
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
    const user = await userService.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: 'BUYER' as any,
        isActive: true,
        firstName: `User`,
        lastName: `${k}`,
        addresses: {
          create: {
            firstName: 'User',
            lastName: `${k}`,
            phone: '08012345678',
            streetAddress: `${k} Horizon View`,
            city: 'Victoria Island',
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
    const user = await userService.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: 'AGENT' as any,
        isActive: true,
      },
    });
    const agent = await affiliateAgentService.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: 'ACTIVE',
        commissionRate: new Decimal(8.0)
      }
    });
    await referralLinkService.upsert({
      where: { slug: `PARTNER${l}` },
      update: {},
      create: {
        agentId: agent.id,
        slug: `PARTNER${l}`,
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

    await orderService.create({
      data: {
        userId: buyer.id,
        status: status,
        subtotal: variant.price,
        shippingFee: new Decimal(1200),
        discount: new Decimal(0),
        total: variant.price.add(1200),
        paymentMethod: 'PAYSTACK',
        addressId: addressId,
        packages: {
          create: {
            sellerId: createdSellers[Math.floor(Math.random() * createdSellers.length)].id,
            warehouseId: warehouse.id,
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

  // 10. Create Flash Sales
  console.log('⚡ Creating flash sales...');
  for (let i = 0; i < 6; i++) {
    const variant = createdVariants[Math.floor(Math.random() * createdVariants.length)];
    const salePrice = variant.price.mul(0.7); // 30% off
    await flashSaleService.create({
      data: {
        variantId: variant.id,
        sellerId: variant.product.sellerId,
        salePrice: salePrice,
        qtyLimit: 50,
        qtySold: Math.floor(Math.random() * 40),
        startTime: new Date(),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
      }
    });
  }

  // 11. Create CMS Content (Banners)
  console.log('🖼️  Creating homepage banners...');
  const banners = [
    { 
      title: 'Digital Horizon', 
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600', 
      link: '/category/computing', 
      position: 1 
    },
    { 
      title: 'Vogue Essentials', 
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600', 
      link: '/category/fashion', 
      position: 2 
    },
    { 
      title: 'Legacy Audio', 
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600', 
      link: '/category/electronics', 
      position: 3 
    }
  ];

  for (const banner of banners) {
    await bannerService.create({
      data: {
        title: banner.title,
        imageUrl: banner.imageUrl,
        link: banner.link,
        position: banner.position,
        isActive: true
      }
    });
  }

  console.log('✅ Seed completed with premium assets.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
