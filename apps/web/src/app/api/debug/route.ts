import { prisma } from '@ecom/db';

const userService = prisma.user;
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userCount = await userService.count();
    return NextResponse.json({ success: true, userCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
