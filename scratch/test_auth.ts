import { userService } from './packages/api/modules/iam/services/user-service';
import { prisma } from './packages/db';

async function testAuth() {
  try {
    const email = 'test@jumia.com';
    const password = 'password123';
    
    console.log('Testing auth for:', email);
    const user = await userService.validateCredentials(email, password);
    
    if (user) {
      console.log('Success! User found:', user.id);
    } else {
      console.log('Failed: Invalid credentials');
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
