'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RekapanFarmRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pemasaran/laporan');
  }, [router]);

  return <LoadingSpinner text="Mengarahkan ke Menu Laporan & Rekapitulasi..." />;
}
