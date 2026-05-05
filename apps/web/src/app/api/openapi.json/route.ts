import { NextResponse } from 'next/server';
import { openApiDocument } from '@ecom/api/openapi';

export const dynamic = 'force-dynamic';

export const GET = () => {
  try {
    return NextResponse.json(openApiDocument);
  } catch (error) {
    console.error('[OpenAPI] Generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate OpenAPI spec', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};
