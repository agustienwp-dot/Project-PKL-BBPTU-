'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'ADMIN_PEMASARAN') {
          router.replace('/pemasaran/dashboard');
        } else if (user.role === 'ADMIN_PENGEMASAN') {
          router.replace('/uht/dashboard');
        } else if (user.role === 'ADMIN_FARM') {
          router.replace('/susu-farm/dashboard');
        } else {
          router.replace('/superadmin');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <LoadingSpinner text="Mengarahkan..." />;
}
