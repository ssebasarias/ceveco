const XLSX = require('xlsx');

class ExcelParser {
    read(filePath) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            return XLSX.utils.sheet_to_json(sheet);
        } catch (error) {
            console.error('Error reading Excel file:', error.message);
            throw error;
        }
    }

    normalizeKeys(obj) {
        const newObj = {};
        Object.keys(obj).forEach(key => {
            const cleanKey = key.trim().toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[áéíóú]/g, (match) => 'aeiou'['áéíóú'.indexOf(match)])
                .replace(/[^a-z0-9_]/g, '');
            newObj[cleanKey] = obj[key];
        });
        return newObj;
    }

    processData(filePath) {
        const rawData = this.read(filePath);
        return rawData.map(row => this.normalizeKeys(row));
    }
}

module.exports = new ExcelParser();
