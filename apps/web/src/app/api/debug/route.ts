// apps/web/src/app/api/debug/route.ts
import { prisma } from '@ecom/db';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const userService = prisma.user;

export async function GET() {
  // Enforce strict unauthenticated visitor protection via NextAuth
  const session = await auth();
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userCount = await userService.count();
    return NextResponse.json({ success: true, userCount });
  } catch (error: any) {
    // Strictly prevent exposing DB structure, stack trace, or ORM versions
    console.error('Database query failed in GET /api/debug:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
