const ExcelNormalizer = require('./lib/excel-normalizer');
const path = require('path');

const excelPath = path.join(__dirname, 'raw_data', 'SUZUKI SEPTIEMBRE 01 2025.xlsx');
const normalizer = new ExcelNormalizer();

try {
    const productos = normalizer.readAndNormalize(excelPath);
    console.log(`\n✅ Productos encontrados: ${productos.length}\n`);

    if (productos.length > 0) {
        console.log('Primer producto:');
        console.log(JSON.stringify(productos[0], null, 2));
    }
} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
}
