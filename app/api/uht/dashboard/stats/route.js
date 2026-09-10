import { GET as statsGet } from '@/app/api/dashboard/stats/route';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return statsGet(request);
}
