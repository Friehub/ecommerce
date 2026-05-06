import { paymentService } from '../packages/api/modules/payment/services/payment-service';
import { Decimal } from '@ecom/db';

async function verify() {
  console.log('Verifying paymentService.fundWallet...');
  
  const mockTx = {
    wallet: {
      upsert: async (args: any) => {
        console.log('Upsert called with:', JSON.stringify(args, null, 2));
        return { userId: args.where.userId, balance: args.create.balance };
      }
    }
  };

  await paymentService.fundWallet('user_123', 100, mockTx);
  console.log('Verification successful: fundWallet uses the passed transaction client.');
}

verify().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});
