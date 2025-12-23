/**
 * Test Rápido de Excel Parsing
 */
const path = require('path');
// Import logic from the new ingestion lib if possible, or original lib
// Since we want to test the NEW structure mostly, let's use the new lib
const excelParser = require('../../ingestion/lib/excel-parser');

async function testExcel(fileName = 'SUZUKI SEPTIEMBRE 01 2025.xlsx') {
    const rawDataPath = path.join(__dirname, '../../../raw_data', fileName);
    console.log(`📂 Leyendo Excel: ${rawDataPath}`);

    try {
        const data = excelParser.processData(rawDataPath);
        console.log(`\n📦 Filas encontradas: ${data.length}`);

        if (data.length > 0) {
            console.log('\n🔍 Primera fila (Ejemplo):');
            console.log(data[0]);
        }

        console.log('\n✅ Lectura de Excel exitosa (usando ingestion/lib/excel-parser)');
    } catch (err) {
        console.error('❌ Error leyendo excel:', err.message);
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const file = args[0] || 'SUZUKI SEPTIEMBRE 01 2025.xlsx';
    testExcel(file);
}
