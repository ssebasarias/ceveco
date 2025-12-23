const XLSX = require('xlsx');

const wb = XLSX.readFile('raw_data/COMODISIMOS AGOSTO 15 2025.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

console.log('\nPrimeras 10 filas del Excel COMODISIMOS:\n');
data.slice(0, 10).forEach((row, idx) => {
    console.log(`Fila ${idx}:`, row);
});
