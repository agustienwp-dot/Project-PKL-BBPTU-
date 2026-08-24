'use client';

import React from 'react';

/**
 * Logo Kementerian Pertanian RI (Menggunakan foto asli persis yang diunggah)
 */
export function KementanLogo({ className = "w-12 h-12" }) {
  return (
    <img
      src="/logo-kementan.png"
      alt="Logo Kementerian Pertanian"
      className={`${className} object-contain shrink-0`}
    />
  );
}

/**
 * Logo BBPTUHPT Baturraden (Menggunakan foto asli persis yang diunggah)
 */
export function BBPTUHPTLogo({ className = "w-12 h-12" }) {
  return (
    <img
      src="/logo-bbptuhpt.png"
      alt="Logo BBPTUHPT Baturraden"
      className={`${className} object-contain shrink-0`}
    />
  );
}
