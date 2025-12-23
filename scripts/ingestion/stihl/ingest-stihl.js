const db = require('../lib/db-config');
const excelParser = require('../lib/excel-parser');

class StihlIngestor {
    async execute(filePath) {
        console.log('🚧 Herramientas STIHL Ingestor - Not Implemented Yet');
        console.log(`File: ${filePath}`);
    }
}

if (require.main === module) {
    new StihlIngestor().execute(process.argv[2]);
}

module.exports = StihlIngestor;
