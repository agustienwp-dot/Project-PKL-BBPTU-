/**
 * Utility Perhitungan Umur Presisi Excel DATEDIF (Tahun, Bulan, Hari)
 * Mengikuti Behaviour Excel DATEDIF(birthDate, today, "Y/YM/MD")
 */

export function calculateExcelDatedif(birthDateInput, targetDateInput = new Date()) {
  if (!birthDateInput) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalYears: 0,
      totalMonths: 0,
      formatted: '-',
    };
  }

  const birth = new Date(birthDateInput);
  const target = new Date(targetDateInput);

  if (isNaN(birth.getTime()) || birth > target) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalYears: 0,
      totalMonths: 0,
      formatted: '0 Th 0 Bln 0 Hr',
    };
  }

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  // Kasus jika hari target lebih kecil dari hari tanggal lahir (pinjam hari bulan sebelumnya)
  if (days < 0) {
    months -= 1;
    // Ambil total hari di bulan sebelum tanggal target
    const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  // Kasus jika bulan target lebih kecil dari bulan lahir
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalYears = years + months / 12 + days / 365.25;
  const totalMonths = years * 12 + months + days / 30;

  return {
    years,
    months,
    days,
    totalYears,
    totalMonths,
    formatted: `${years} Th ${months} Bln ${days} Hr`,
  };
}

/**
 * Logika Rekomendasi Otomatis (Distribusi vs Afkir) + Support Manual Override
 * @param {Object} ageResult Result dari calculateExcelDatedif
 * @param {Object} settings Object berisi batas_umur_distribusi & batas_umur_afkir
 * @param {Object} animal Record Sapi
 */
export function evaluateRecommendation(ageResult, settings = {}, animal = {}) {
  // Jika di-override manual per sapi
  if (animal.isManualOverride && animal.manualRecommendation) {
    return {
      recommendation: animal.manualRecommendation,
      isManual: true,
      sourceLabel: 'Manual (Override)',
    };
  }

  const batasDistribusi = parseFloat(settings.batas_umur_distribusi || '1.5');
  const batasAfkir = parseFloat(settings.batas_umur_afkir || '7.0');

  const ageYears = ageResult?.totalYears || 0;

  if (ageYears <= batasDistribusi) {
    return {
      recommendation: 'Distribusi',
      isManual: false,
      sourceLabel: 'Otomatis (Umur <= ' + batasDistribusi + ' Th)',
    };
  }

  if (ageYears >= batasAfkir) {
    return {
      recommendation: 'Afkir',
      isManual: false,
      sourceLabel: 'Otomatis (Umur >= ' + batasAfkir + ' Th)',
    };
  }

  return {
    recommendation: 'Produktif',
    isManual: false,
    sourceLabel: 'Otomatis (Umur Produktif)',
  };
}
