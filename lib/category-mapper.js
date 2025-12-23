/**
 * 🗺️ Mapeo de Categorías y Subcategorías
 * Define las 4 categorías principales y sus subcategorías
 */

const CATEGORY_MAPPING = {
    // ========================================
    // 1. ELECTRO HOGAR
    // ========================================
    'ELECTRO_HOGAR': {
        id_categoria: 1,
        nombre: 'Electro Hogar',
        keywords: ['TV', 'TELEVISOR', 'NEVERA', 'LAVADORA', 'ESTUFA', 'MICROONDAS', 'AIRE', 'SONIDO', 'AUDIO', 'CABINA'],
        subcategorias: {
            'TELEVISORES': {
                id_subcategoria: 4,
                keywords: ['TV', 'TELEVISOR', 'TELEVISORES', 'PANTALLA', 'SMART TV']
            },
            'NEVERAS': {
                id_subcategoria: 5,
                keywords: ['NEVERA', 'NEVERAS', 'REFRIGERADOR', 'FRIGOBAR']
            },
            'LAVADORAS': {
                id_subcategoria: 6,
                keywords: ['LAVADORA', 'LAVADORAS', 'SECADORA']
            },
            'ESTUFAS': {
                id_subcategoria: 7,
                keywords: ['ESTUFA', 'ESTUFAS', 'COCINA']
            },
            'AIRES_ACONDICIONADOS': {
                id_subcategoria: 8,
                keywords: ['AIRE', 'AIRES', 'ACONDICIONADO', 'CLIMA']
            },
            'AUDIO': {
                id_subcategoria: null, // Crear si no existe
                keywords: ['CABINA', 'PARLANTE', 'SOUND', 'AUDIO', 'BOCINA', 'ALTAVOZ']
            }
        }
    },

    // ========================================
    // 2. MUEBLES Y ORGANIZACIÓN
    // ========================================
    'MUEBLES': {
        id_categoria: 2,
        nombre: 'Muebles y Organización',
        keywords: ['COLCHON', 'COLCHONES', 'SEMIORTOPEDICO', 'ORTOPEDICO', 'PILLOW', 'ESCRITORIO', 'SILLA', 'MESA', 'ARCHIVADOR', 'ESTANTERIA'],
        subcategorias: {
            'COLCHONES': {
                id_subcategoria: null, // Crear si no existe
                keywords: ['COLCHON', 'COLCHONES', 'SEMIORTOPEDICO', 'ORTOPEDICO', 'PILLOW', 'CSO', 'COP'],
                tipos: ['Semiortopédico', 'Ortopédico', 'Pillow Top', 'Resortado', 'Espuma']
            },
            'ESCRITORIOS': {
                id_subcategoria: null,
                keywords: ['ESCRITORIO', 'DESK', 'MESA DE TRABAJO']
            },
            'SILLAS': {
                id_subcategoria: null,
                keywords: ['SILLA', 'SILLAS', 'ASIENTO']
            },
            'ARCHIVADORES': {
                id_subcategoria: null,
                keywords: ['ARCHIVADOR', 'ARCHIVO', 'GAVETA']
            }
        }
    },

    // ========================================
    // 3. MOTOS
    // ========================================
    'MOTOS': {
        id_categoria: 3,
        nombre: 'Motos',
        keywords: ['MOTO', 'MOTOS', 'WAVE', 'AX4', 'CB', 'XR', 'MODELO 202'],
        subcategorias: {
            'MOTOS_URBANAS': {
                id_subcategoria: null,
                keywords: ['WAVE', 'URBAN', 'CITY', '110', '125']
            },
            'MOTOS_DEPORTIVAS': {
                id_subcategoria: null,
                keywords: ['CB', 'XR', 'SPORT', 'DEPORTIVA', '150', '190']
            }
        }
    },

    // ========================================
    // 4. HERRAMIENTAS STIHL
    // ========================================
    'STIHL': {
        id_categoria: 4,
        nombre: 'Herramientas STIHL',
        keywords: ['STIHL', 'MOTOSIERRA', 'GUADAÑA', 'SOPLADOR', 'DESBROZADORA'],
        subcategorias: {
            'MOTOSIERRAS': {
                id_subcategoria: null,
                keywords: ['MOTOSIERRA', 'SIERRA', 'GTA', 'MS']
            },
            'GUADAÑAS': {
                id_subcategoria: null,
                keywords: ['GUADAÑA', 'GUADAÑAS', 'DESBROZADORA', 'FS']
            },
            'SOPLADORES': {
                id_subcategoria: null,
                keywords: ['SOPLADOR', 'SOPLADORES', 'BG', 'BR']
            }
        }
    }
};

/**
 * Detectar categoría y subcategoría desde texto
 */
function detectCategory(text) {
    const upperText = text.toUpperCase();

    // Buscar en cada categoría principal
    for (const [catKey, catData] of Object.entries(CATEGORY_MAPPING)) {
        // Verificar keywords de categoría
        for (const keyword of catData.keywords) {
            if (upperText.includes(keyword)) {
                // Buscar subcategoría
                for (const [subKey, subData] of Object.entries(catData.subcategorias)) {
                    for (const subKeyword of subData.keywords) {
                        if (upperText.includes(subKeyword)) {
                            return {
                                categoria: catData.nombre,
                                id_categoria: catData.id_categoria,
                                subcategoria: subKey.replace(/_/g, ' ').toLowerCase(),
                                id_subcategoria: subData.id_subcategoria,
                                tipo: subData.tipos ? detectTipo(upperText, subData.tipos) : null
                            };
                        }
                    }
                }

                // Si encontró categoría pero no subcategoría
                return {
                    categoria: catData.nombre,
                    id_categoria: catData.id_categoria,
                    subcategoria: null,
                    id_subcategoria: null,
                    tipo: null
                };
            }
        }
    }

    // Default: Electro Hogar
    return {
        categoria: 'Electro Hogar',
        id_categoria: 1,
        subcategoria: null,
        id_subcategoria: null,
        tipo: null
    };
}

/**
 * Detectar tipo/atributo (ej: Semiortopédico)
 */
function detectTipo(text, tipos) {
    for (const tipo of tipos) {
        if (text.includes(tipo.toUpperCase())) {
            return tipo;
        }
    }
    return null;
}

/**
 * Detectar marca desde texto
 */
function detectBrand(text) {
    const upperText = text.toUpperCase();

    const brands = {
        'LG': { id: 5, keywords: ['LG', '32LR', '43LM', '50UA'] },
        'Samsung': { id: 6, keywords: ['SAMSUNG', 'UN', 'QN'] },
        'Kalley': { id: 2, keywords: ['KALLEY', 'K-GTV', 'K-LED'] },
        'Haceb': { id: 7, keywords: ['HACEB', 'NEV', 'LAV'] },
        'Honda': { id: 8, keywords: ['HONDA', 'WAVE', 'CB', 'XR'] },
        'Suzuki': { id: 9, keywords: ['SUZUKI', 'AX4', 'GN'] },
        'Hyundai': { id: 10, keywords: ['HYUNDAI', 'HYLED'] },
        'STIHL': { id: 11, keywords: ['STIHL', 'MS', 'FS', 'BG', 'GTA'] },
        'Inval': { id: 12, keywords: ['INVAL', 'AR'] },
        'Comodisimos': { id: 13, keywords: ['CSO', 'COP', 'SEMIORTOPEDICO'] }
    };

    for (const [brand, data] of Object.entries(brands)) {
        for (const keyword of data.keywords) {
            if (upperText.includes(keyword)) {
                return { nombre: brand, id: data.id };
            }
        }
    }

    return { nombre: 'Genérica', id: 1 };
}

module.exports = {
    CATEGORY_MAPPING,
    detectCategory,
    detectBrand,
    detectTipo
};
