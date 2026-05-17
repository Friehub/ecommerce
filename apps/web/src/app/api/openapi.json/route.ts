import { NextResponse } from 'next/server';
import { openApiDocument } from '@ecom/api/openapi';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export const GET = async () => {
  // Gate raw OpenAPI schema json delivery strictly under ADMIN session to prevent reconnaissance leaks
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json(openApiDocument);
  } catch (error) {
    console.error('[OpenAPI] Generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate OpenAPI spec' }, { status: 500 });
  }
};
