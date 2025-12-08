/**
 * Sistema de Filtros Dinámicos Jerárquicos
 * Maneja la carga y renderización de subcategorías y atributos
 */

// Cargar filtros dinámicos
async function loadDynamicFilters(categoria) {
    const container = document.getElementById('dynamic-filters-container');
    container.innerHTML = '<div class="filter-loading"><div class="filter-loading-spinner"></div></div>';

    // Función para obtener icono según el nombre del atributo
    const getIconForAttribute = (nombre) => {
        const iconMap = {
            'cilindraje': 'gauge',
            'tipo de motor': 'zap',
            'tipo de frenos': 'disc',
            'freno': 'disc',
            'color': 'palette',
            'material': 'layers',
            'dimensiones': 'maximize-2',
            'alto': 'move-vertical',
            'ancho': 'move-horizontal',
            'profundo': 'box',
            'capacidad': 'package',
            'potencia': 'battery-charging',
            'voltaje': 'zap',
            'peso': 'weight',
            'tamaño': 'maximize',
            'resolución': 'monitor',
            'pantalla': 'monitor',
            'marca': 'award',
            'modelo': 'box',
            'año': 'calendar',
            'garantía': 'shield-check',
            'arranque': 'power',
            'transmisión': 'settings',
            'eficiencia': 'leaf',
            'smart': 'wifi',
            'madera': 'tree-deciduous',
            'tela': 'shirt',
        };

        const lowerName = nombre.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }
        return 'settings'; // Icono por defecto
    };

    try {
        const response = await ProductosAPI.getFilters(categoria);
        if (response.success && response.data) {
            const { subcategorias, atributos } = response.data;
            let html = '';

            // 1. Renderizar Subcategorías (si existen)
            if (subcategorias && subcategorias.length > 0) {
                html += `
                    <div class="filter-group">
                        <h4 class="filter-group-title">
                            <i data-lucide="folder" class="w-4 h-4"></i>
                            Subcategorías
                        </h4>
                        <div class="filter-options">
                            ${subcategorias.map(sub => {
                    const filterId = `filter-sub-${sub.id_subcategoria}`;
                    return `
                                    <label class="filter-option" for="${filterId}">
                                        <input 
                                            type="checkbox" 
                                            id="${filterId}"
                                            name="subcategoria" 
                                            value="${sub.id_subcategoria}" 
                                            onchange="applyFilters()" 
                                            class="filter-checkbox">
                                        <span class="filter-label">${sub.nombre}</span>
                                        <span class="filter-count">${sub.total_productos}</span>
                                    </label>
                                `;
                }).join('')}
                        </div>
                    </div>
                `;
            }

            // 2. Renderizar Atributos
            if (atributos && atributos.length > 0) {
                html += atributos.map(attr => {
                    const uniqueValues = [...new Set(attr.valores)].filter(v => v !== null);

                    if (uniqueValues.length === 0) return '';

                    const icon = getIconForAttribute(attr.nombre);

                    return `
                        <div class="filter-group">
                            <h4 class="filter-group-title">
                                <i data-lucide="${icon}" class="w-4 h-4"></i>
                                ${attr.nombre}
                                ${attr.unidad ? `<span class="filter-group-badge">${attr.unidad}</span>` : ''}
                            </h4>
                            <div class="filter-options">
                                ${uniqueValues.map(val => {
                        const safeVal = String(val).replace(/"/g, '&quot;');
                        const filterIdSafe = safeVal.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                        const filterId = `filter-${attr.id_atributo}-${filterIdSafe}`;
                        return `
                                        <label class="filter-option" for="${filterId}">
                                            <input 
                                                type="checkbox" 
                                                id="${filterId}"
                                                name="attr_${attr.id_atributo}" 
                                                value="${safeVal}" 
                                                onchange="applyFilters()" 
                                                class="filter-checkbox">
                                            <span class="filter-label">${val}</span>
                                        </label>
                                    `;
                    }).join('')}
                            </div>
                        </div>
                    `;
                }).filter(html => html !== '').join('');
            }

            // Si no hay filtros disponibles
            if (!html) {
                container.innerHTML = '<div class="filter-group"><p class="text-sm text-gray-500">No hay filtros disponibles para esta categoría</p></div>';
                return;
            }

            container.innerHTML = html;

            // Re-inicializar iconos de Lucide
            lucide.createIcons();

            // Actualizar botón de limpiar
            updateClearFiltersButton();
        }
    } catch (err) {
        console.error('Error loading filters', err);
        container.innerHTML = '<div class="filter-group"><p class="text-sm text-gray-500">No se pudieron cargar los filtros</p></div>';
    }
}

// Limpiar todos los filtros
function clearAllFilters() {
    // Limpiar checkboxes de atributos y subcategorías
    document.querySelectorAll('#dynamic-filters-container input[type="checkbox"]:checked').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Limpiar precio
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';

    // Ocultar botón de limpiar
    updateClearFiltersButton();

    // Aplicar filtros (sin filtros)
    applyFilters();
}

// Actualizar visibilidad del botón de limpiar filtros
function updateClearFiltersButton() {
    const hasActiveFilters =
        document.querySelectorAll('#dynamic-filters-container input[type="checkbox"]:checked').length > 0 ||
        document.getElementById('min-price').value !== '' ||
        document.getElementById('max-price').value !== '';

    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
        clearBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
    }
}
