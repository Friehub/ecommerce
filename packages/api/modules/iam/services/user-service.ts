import { prisma } from '@ecom/db'
import bcrypt from 'bcryptjs'
import { publishEvent, redis, generateId } from '@ecom/shared'
import type { RegisterInput, AddressInput, SellerOnboardingInput } from '../schemas/index.js'
import { notificationService } from '../../notification/services/notification-service.js'
import { emailTemplates } from '../../notification/services/email-templates.js'

export const userService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { addresses: true, sellerProfile: true },
    })
  },

  async register({ email, password, firstName, lastName, phone, role }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('EMAIL_IN_USE')

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, role },
    })

    await publishEvent('user.created', { userId: user.id, email: user.email, role })
    return user
  },

  async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return null

    // E07: Check isActive BEFORE expensive bcrypt to prevent timing oracle
    // Return null instead of throwing to avoid leaking account status
    if (!user.isActive) return null

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return null

    return user
  },

  async addAddress(userId: string, data: AddressInput) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        })
      }
      return tx.userAddress.create({ data: { ...data, userId } as any })
    });
  },

  async getAddresses(userId: string) {
    return prisma.userAddress.findMany({ where: { userId } })
  },

  async deleteAddress(id: string, userId: string) {
    return prisma.userAddress.deleteMany({ where: { id, userId } })
  },

  async updateProfile(id: string, data: { firstName: string; lastName: string; phone?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async requestPhoneOTP(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
    if (!user?.phone) throw new Error('NO_PHONE_NUMBER');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis with 10 min TTL
    await redis.set(`otp:phone:${userId}`, otp, 'EX', 600);

    // Dispatch via SMS
    await notificationService.sendNotification(
      userId, 
      'SYSTEM', 
      'Phone Verification', 
      `Your Jumia verification code is: ${otp}. Valid for 10 minutes.`
    );

    return { success: true };
  },

  async verifyPhoneOTP(userId: string, otp: string) {
    const storedOtp = await redis.get(`otp:phone:${userId}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('INVALID_OR_EXPIRED_OTP');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true }
    });

    await redis.del(`otp:phone:${userId}`);
    return { success: true };
  },

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: true };

    const token = generateId();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiresAt: expires }
    });

    const template = (emailTemplates as any).PASSWORD_RESET({ 
      email: user.email, 
      token, 
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' 
    });

    await notificationService.sendNotification(
      user.id,
      'SYSTEM',
      template.subject,
      template.html
    );

    return { success: true };
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gte: new Date() }
      }
    });

    if (!user) throw new Error('INVALID_OR_EXPIRED_TOKEN');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    return { success: true };
  },

  async upsertOAuthAccount(provider: string, providerAccountId: string, profile: { email: string; firstName?: string; lastName?: string }) {
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: 'BUYER'
        }
      });
      await publishEvent('user.created', { userId: user.id, email: user.email, role: 'BUYER' });
    }

    await prisma.oAuthAccount.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      update: { userId: user.id },
      create: { provider, providerAccountId, userId: user.id }
    });

    return user;
  }
}
