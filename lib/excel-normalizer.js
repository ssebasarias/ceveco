/**
 * 🔄 Normalizador Inteligente de Excel v2.0
 * - Detecta y salta logos/encabezados
 * - Genera SKUs automáticos cuando no hay referencia
 * - Maneja múltiples formatos de Excel
 */

const XLSX = require('xlsx');

class ExcelNormalizer {
    constructor() {
        this.columnMappings = {
            ref: ['REF', 'REFERENCIA', 'CODIGO', 'SKU', 'REFERENCE', 'Ref', 'Referencia', 'REF.', 'CÓDIGO', 'Codigo', 'Código'],
            modelo: ['MODELO', 'MODEL', 'DESCRIPCION', 'DESCRIPCIÓN', 'NOMBRE', 'PRODUCTO', 'Modelo', 'CABINAS', 'EQUIPOS', 'Descripcion', 'Descripción'],
            categoria: ['CATEGORIA', 'CATEGORY', 'TIPO', 'LINEA', 'Categoria', 'MOTOSIERRA', 'GUADAÑA', 'SOPLADOR'],
            precio_contado: ['CONTADO', 'PRECIO', 'PRICE', 'PRECIO_CONTADO', 'VALOR', 'Contado'],
            precio_promo: ['PROMO', 'PROMOCION', 'OFERTA', 'DESCUENTO', 'PRECIO_PROMO', 'Promocion', 'Promoción', 'PROMOCIÓN']
        };

        this.skuCounter = {};
    }

    /**
     * Generar SKU automático cuando no hay referencia
     */
    generateSKU(nombre, categoria, marca) {
        const cleanNombre = nombre.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
        const cleanCategoria = (categoria || 'GEN').substring(0, 3).toUpperCase();
        const cleanMarca = (marca || 'XX').substring(0, 2).toUpperCase();

        const key = `${cleanMarca}-${cleanCategoria}`;
        if (!this.skuCounter[key]) {
            this.skuCounter[key] = 1;
        }
        const counter = this.skuCounter[key]++;

        return `${cleanMarca}-${cleanCategoria}-${counter.toString().padStart(3, '0')}`;
    }

    /**
     * Detectar columna
     */
    detectColumn(headers, possibleNames) {
        for (const name of possibleNames) {
            const found = headers.find(h =>
                h && h.toString().toUpperCase().trim().includes(name.toUpperCase())
            );
            if (found) return found;
        }
        return null;
    }

    /**
     * Leer y normalizar Excel (mejorado)
     */
    readAndNormalize(filePath) {
        console.log(`📂 Leyendo Excel: ${filePath}`);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Leer como array de arrays para detectar encabezados
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
        });

        if (rawData.length === 0) {
            throw new Error('El archivo Excel está vacío');
        }

        console.log(`📊 Total de filas en Excel: ${rawData.length}`);

        // CASO ESPECIAL: Detectar formato COMODISIMOS
        // Formato: Primera columna tiene categoría en una fila, luego productos sin encabezados
        let isComodisimosFormat = false;
        let comodisimosCategoria = null;

        // Verificar si es formato COMODISIMOS
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i];
            const firstCell = row[0] ? row[0].toString().toUpperCase() : '';

            // Si encuentra una fila con solo texto en primera columna y números en columnas 3-4
            if (firstCell && firstCell.length > 5 &&
                (firstCell.includes('SEMIORTOPEDICO') || firstCell.includes('ORTOPEDICO') ||
                    firstCell.includes('PILLOW') || firstCell.includes('COLCHON'))) {
                isComodisimosFormat = true;
                comodisimosCategoria = firstCell;
                console.log(`✅ Formato COMODISIMOS detectado - Categoría: ${comodisimosCategoria}`);
                break;
            }
        }

        // Encontrar fila de encabezados (salta logos y títulos)
        let headerRowIndex = -1;
        let headers = [];

        if (isComodisimosFormat) {
            // Para COMODISIMOS, crear encabezados sintéticos
            headers = ['REF. - MEDIDA', '', '', 'CONTADO', 'PROMOCION'];
            headerRowIndex = 2; // Empezar después de título y fecha
            console.log(`✅ Usando encabezados sintéticos para COMODISIMOS`);
        } else {
            // Búsqueda normal de encabezados
            for (let i = 0; i < Math.min(15, rawData.length); i++) {
                const row = rawData[i];
                const rowText = row.join(' ').toUpperCase();

                // Buscar fila que contenga palabras clave de columnas
                if (rowText.includes('REF') || rowText.includes('REFERENCIA') || rowText.includes('CODIGO') || rowText.includes('CÓDIGO') ||
                    (rowText.includes('MODELO') && rowText.includes('CONTADO')) ||
                    (rowText.includes('DESCRIPCION') && rowText.includes('CONTADO')) ||
                    (rowText.includes('DESCRIPCIÓN') && rowText.includes('CONTADO')) ||
                    (rowText.includes('CONTADO') && rowText.includes('PROMO'))) { // Formato MAXIMUEBLES
                    headerRowIndex = i;
                    headers = row.map(cell => cell ? cell.toString().trim() : '');
                    console.log(`✅ Encabezados encontrados en fila ${i + 1}: ${headers.join(', ')}`);
                    break;
                }
            }

            if (headerRowIndex === -1) {
                throw new Error('No se encontraron encabezados de columnas (REF, MODELO, CONTADO, etc.)');
            }
        }

        // Convertir datos a objetos
        const dataRows = rawData.slice(headerRowIndex + 1);
        const jsonData = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                if (header) {
                    obj[header] = row[index] || '';
                }
            });
            return obj;
        }).filter(row => {
            // Filtrar filas vacías
            return Object.values(row).some(v => v && v.toString().trim());
        });

        // Detectar columnas
        const refCol = this.detectColumn(headers, this.columnMappings.ref);
        const modeloCol = this.detectColumn(headers, this.columnMappings.modelo);
        const precioContadoCol = this.detectColumn(headers, this.columnMappings.precio_contado);
        const precioPromoCol = this.detectColumn(headers, this.columnMappings.precio_promo);

        console.log(`\n🔍 Mapeo de columnas:`);
        console.log(`  - Referencia: ${refCol || '⚠️  No encontrada (se generará automáticamente)'}`);
        console.log(`  - Modelo/Descripción: ${modeloCol || '❌ No encontrada'}`);
        console.log(`  - Precio Contado: ${precioContadoCol || '❌ No encontrada'}`);
        console.log(`  - Precio Promo: ${precioPromoCol || '⚠️  No encontrada (se usará precio contado)'}`);

        // Detectar categoría del nombre de la hoja
        let categoria = sheetName;

        // CASO ESPECIAL: Para COMODISIMOS, procesar con categoría dinámica
        if (isComodisimosFormat) {
            const comodisimosData = [];
            let currentCategoria = comodisimosCategoria;

            // Procesar filas directamente desde rawData
            for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                const row = rawData[i];
                const firstCell = row[0] ? row[0].toString().trim() : '';

                // Si la primera celda tiene solo texto y no números, es una nueva categoría
                if (firstCell && firstCell.length > 5 && !row[3] && !row[4]) {
                    currentCategoria = firstCell;
                    console.log(`  📂 Nueva categoría detectada: ${currentCategoria}`);
                    continue;
                }

                // Si tiene datos en columnas 3 y 4 (precios), es un producto
                if (row[0] && (row[3] || row[4])) {
                    comodisimosData.push({
                        'REF. - MEDIDA': row[0],
                        'CONTADO': row[3] || 0,
                        'PROMOCION': row[4] || row[3] || 0,
                        '_categoria': currentCategoria
                    });
                }
            }

            // Reemplazar jsonData con datos procesados de COMODISIMOS
            jsonData.length = 0;
            jsonData.push(...comodisimosData);
            console.log(`✅ ${comodisimosData.length} productos procesados de COMODISIMOS`);
        }

        // Normalizar datos
        const normalizedData = jsonData.map((row, index) => {
            try {
                // Obtener referencia o generar SKU
                let ref = refCol ? row[refCol]?.toString().trim() : '';

                // Obtener nombre/modelo
                let nombre = '';
                if (modeloCol) {
                    nombre = row[modeloCol]?.toString().trim() || '';
                }

                // Si no hay nombre, buscar en otras columnas
                if (!nombre) {
                    for (const header of headers) {
                        if (header && header !== refCol &&
                            !this.columnMappings.precio_contado.some(pc => pc.toUpperCase() === header.toUpperCase()) &&
                            !this.columnMappings.precio_promo.some(pp => pp.toUpperCase() === header.toUpperCase())) {
                            const value = row[header]?.toString().trim();
                            // Aceptar valores con más de 5 caracteres (no solo números)
                            if (value && value.length > 5 && !value.match(/^\d+$/)) {
                                nombre = value;
                                break;
                            }
                        }
                    }
                }

                // CASO ESPECIAL: MOTOS
                // Si el nombre es solo un año (2024, 2025, 2026) y la referencia es más descriptiva
                // Usar la referencia como nombre
                if (nombre && nombre.match(/^\d{4}$/) && ref && ref.length > 5) {
                    // Combinar: "REFERENCIA Modelo NOMBRE"
                    nombre = `${ref} Modelo ${nombre}`;
                } else if (nombre && nombre.match(/^MODELO \d{4}$/i) && ref && ref.length > 5) {
                    // Si dice "MODELO 2026", usar referencia + modelo
                    nombre = `${ref} ${nombre}`;
                }

                // CASO ESPECIAL: Si no hay nombre pero la referencia es descriptiva (> 10 caracteres)
                // Usar la referencia como nombre
                if (!nombre && ref && ref.length > 10) {
                    nombre = ref;
                }

                // Si no hay referencia, generar SKU automático
                if (!ref && nombre) {
                    ref = this.generateSKU(nombre, categoria, '');
                    console.log(`  ℹ️  SKU generado: ${ref} para "${nombre.substring(0, 40)}..."`);
                }

                // Si no hay ni ref ni nombre, omitir
                if (!ref || !nombre) {
                    console.warn(`⚠️  Fila ${index + headerRowIndex + 2}: Sin referencia ni nombre, omitida`);
                    return null;
                }
                // Parsear precios
                const parsePrecio = (value) => {
                    if (!value) return 0;
                    const str = value.toString().replace(/[^\d]/g, '');
                    return parseInt(str) || 0;
                };

                const precioContado = parsePrecio(row[precioContadoCol]);
                const precioPromo = parsePrecio(row[precioPromoCol]);

                return {
                    ref,
                    nombre,
                    categoria: row._categoria || categoria || 'GENERAL',
                    precio_contado: precioContado,
                    precio_promo: precioPromo || precioContado,
                    raw: row
                };
            } catch (error) {
                console.warn(`⚠️  Error en fila ${index + headerRowIndex + 2}: ${error.message}`);
                return null;
            }
        }).filter(item => item !== null);

        console.log(`\n✅ ${normalizedData.length} productos normalizados de ${jsonData.length} filas de datos`);

        // Mostrar muestra
        if (normalizedData.length > 0) {
            console.log(`\n📊 Muestra del primer producto:`);
            console.log(JSON.stringify(normalizedData[0], null, 2));
        }

        return normalizedData;
    }

    /**
     * Leer múltiples archivos Excel
     */
    readMultipleFiles(filePaths) {
        const allProducts = [];

        for (const filePath of filePaths) {
            try {
                console.log(`\n${'='.repeat(70)}`);
                const products = this.readAndNormalize(filePath);
                allProducts.push(...products);
            } catch (error) {
                console.error(`❌ Error leyendo ${filePath}: ${error.message}`);
            }
        }

        console.log(`\n${'='.repeat(70)}`);
        console.log(`📦 Total de productos de todos los archivos: ${allProducts.length}`);
        return allProducts;
    }
}

module.exports = ExcelNormalizer;

// Test si se ejecuta directamente
if (require.main === module) {
    const normalizer = new ExcelNormalizer();
    const filePath = process.argv[2];

    if (!filePath) {
        console.log('Uso: node excel-normalizer.js <archivo.xlsx>');
        process.exit(1);
    }

    try {
        console.log('\n🔍 Normalizando Excel...\n');
        const products = normalizer.readAndNormalize(filePath);

        console.log('\n✅ Normalización completada');
        console.log(`📦 ${products.length} productos listos para procesar`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}
