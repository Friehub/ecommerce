import { prisma } from '@ecom/db';
import { orderService } from '../../services/order-service';
import { userService } from '../../services/user-service';

async function test() {
  // Case 1: Plain prisma call (Must be fixed)
  const user = await userService.findUnique({ where: { id: '1' } });
  
  // Case 2: Different capture group (Must be fixed with different service)
  const order = await orderService.create({ data: { total: 100 } });
  
  // Case 3: Already correct (Must not generate advisory)
  const existing = await userService.findMany({ select: { id: true /* TODO: Select fields to reduce bloat */ } });
  
  console.log(user, order, existing);
}
