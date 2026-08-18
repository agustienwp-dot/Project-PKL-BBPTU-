import * as XLSX from 'xlsx';

/**
 * Export JSON array data to Excel file (.xlsx)
 * @param {Array<Object>} data Array of objects to export
 * @param {string} fileName Name of the downloaded file (e.g., 'Data_Produksi_Susu.xlsx')
 * @param {string} sheetName Name of the worksheet tab (e.g., 'Hasil Perah')
 */
export function exportToExcel(data, fileName = 'Export_Data.xlsx', sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport.');
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-fit column widths
    const columnWidths = Object.keys(data[0] || {}).map(key => {
      const maxLen = Math.max(
        key.toString().length,
        ...data.map(row => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 3, 10), 50) };
    });
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const name = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(workbook, name);
  } catch (err) {
    console.error('Error exporting to Excel:', err);

    // Fallback: CSV export with UTF-8 BOM
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        let val = row[header] ?? '';
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fallbackName = fileName.replace('.xlsx', '') + '.csv';
    link.setAttribute('download', fallbackName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default exportToExcel;
