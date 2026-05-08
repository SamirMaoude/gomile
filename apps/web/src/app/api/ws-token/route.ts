import { makeProtectedRoute } from '@/lib/bff/route-factories';

export const GET = makeProtectedRoute('/auth/ws-token');