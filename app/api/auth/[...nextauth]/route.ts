import type { NextRequest } from 'next/server';
import { handlers, isAuthConfigured } from '@/auth';

const notConfigured = () => Response.json({ error: 'not_configured' }, { status: 503 });

export function GET(req: NextRequest) {
  return isAuthConfigured ? handlers.GET(req) : notConfigured();
}

export function POST(req: NextRequest) {
  return isAuthConfigured ? handlers.POST(req) : notConfigured();
}
