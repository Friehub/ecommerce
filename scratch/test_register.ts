import { userService } from '../packages/api/modules/iam/services/user-service';
import { prisma } from '../packages/db';

async function registerTest() {
  try {
    console.log('Attempting to register...');
    const res = await userService.register({
      email: 'test5@jumia.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Five',
      phone: '08055555555',
      role: 'BUYER' as any
    });
    console.log('Registered:', res.id);
  } catch (err: any) {
    console.error('Error during registration test:', err.message);
    if (err.message.includes('Unknown argument')) {
       console.log('PRISMA CLIENT IS STALE');
    }
  } finally {
    await prisma.$disconnect();
  }
}

registerTest();
