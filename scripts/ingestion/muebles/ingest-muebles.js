const db = require('../lib/db-config');
const excelParser = require('../lib/excel-parser');

class MueblesIngestor {
    async execute(filePath) {
        console.log('🚧 Muebles y Organización Ingestor - Not Implemented Yet');
        console.log(`File: ${filePath}`);
    }
}

if (require.main === module) {
    new MueblesIngestor().execute(process.argv[2]);
}

module.exports = MueblesIngestor;
