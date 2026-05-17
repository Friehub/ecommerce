import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Database Order Audit ---')
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  })
  console.log('Total Users:', users.length)
  console.log('Users list:', users)

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } }
    }
  })
  console.log('Total Orders:', orders.length)
  console.log('Orders:', orders.map(o => ({
    id: o.id,
    userId: o.userId,
    userEmail: o.user?.email,
    paymentMethod: o.paymentMethod,
    status: o.status,
    total: o.total.toString(),
    createdAt: o.createdAt
  })))

  const carts = await prisma.cart.findMany({
    include: {
      items: true
    }
  })
  console.log('Carts:', carts.map(c => ({
    id: c.id,
    userId: c.userId,
    itemsCount: c.items.length
  })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
