'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RiwayatProduksiPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/susu-farm/produksi');
  }, [router]);

  return <LoadingSpinner text="Mengarahkan ke modul Produksi..." />;
}
