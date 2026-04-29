import { prisma } from '@ecom/db'
import { publishEvent } from '@/lib/events/bus'

export const userService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async createUser(data: { email: string; passwordHash: string; role?: any }) {
    const user = await prisma.user.create({
      data: {
        ...data,
      }
    });

    await publishEvent('user.created', { userId: user.id, email: user.email });
    
    return user;
  }
};
