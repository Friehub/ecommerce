import { userService } from '../packages/api/modules/iam/services/user-service';
import { prisma } from '../packages/db';

async function addAddressTest() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'test5@jumia.com' } });
    if (!user) throw new Error('User not found');

    const addr = await userService.addAddress(user.id, {
      firstName: 'Test',
      lastName: 'Five',
      phone: '08055555555',
      streetAddress: '123 Jumia Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      isDefault: true
    });
    console.log('Address added:', addr.id);
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

addAddressTest();
