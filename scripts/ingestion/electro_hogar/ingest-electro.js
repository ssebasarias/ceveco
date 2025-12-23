const db = require('../lib/db-config');
const excelParser = require('../lib/excel-parser');

class ElectroIngestor {
    async execute(filePath) {
        console.log('🚧 Electro Hogar Ingestor - Not Implemented Yet');
        console.log(`File: ${filePath}`);
    }
}

if (require.main === module) {
    new ElectroIngestor().execute(process.argv[2]);
}

module.exports = ElectroIngestor;
