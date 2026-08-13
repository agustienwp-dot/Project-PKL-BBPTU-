import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'FarmStock Pro - Manajemen Ternak & Penjualan Hewan',
  description: 'Sistem Fullstack Terpadu Manajemen Stok Ternak dan Penjualan Hewan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="bg-[#F5F5F0] text-slate-800 font-sans antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
