export class FiltersSidebar {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.onFilterChange = options.onFilterChange || (() => { });
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
    }

    async init() {
        try {
            const response = await fetch('../components/filters-sidebar.html');
            if (!response.ok) throw new Error('Failed to load sidebar HTML');

            const html = await response.text();
            this.container.innerHTML = html;

            this.bindEvents();

            // Initial lucide icons
            if (window.lucide) window.lucide.createIcons();

        } catch (error) {
            console.error('Error initializing FiltersSidebar:', error);
        }
    }

    bindEvents() {
        // Mobile toggle
        const toggleBtn = this.container.querySelector('#filters-toggle-mobile');
        const wrapper = this.container.querySelector('#filters-wrapper');
        if (toggleBtn && wrapper) {
            toggleBtn.addEventListener('click', () => {
                wrapper.classList.toggle('hidden');
                // Re-create icons when showing if needed
                if (!wrapper.classList.contains('hidden') && window.lucide) {
                    window.lucide.createIcons();
                }
            });
        }

        // Clear filters
        const clearBtn = this.container.querySelector('#clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Price filter
        const priceBtn = this.container.querySelector('#apply-price-filter');
        if (priceBtn) {
            priceBtn.addEventListener('click', () => this.triggerFilterChange());
        }
    }

    async loadDynamicFilters(categoria) {
        const container = this.container.querySelector('#dynamic-filters-container');
        if (!container) return;

        container.innerHTML = '<div class="filter-loading"><div class="filter-loading-spinner"></div></div>';

        try {
            // Check if ProductosAPI is available
            if (typeof ProductosAPI === 'undefined') {
                console.error('ProductosAPI is not defined');
                return;
            }

            const response = await ProductosAPI.getFilters(categoria);
            if (response.success && response.data) {
                const { subcategorias, atributos } = response.data;
                let html = '';

                // Render Subcategories
                if (subcategorias && subcategorias.length > 0) {
                    html += `
                        <div class="filter-group">
                            <h4 class="filter-group-title">
                                <i data-lucide="folder" class="w-4 h-4"></i>
                                Subcategorías
                            </h4>
                            <div class="filter-options">
                                ${subcategorias.map(sub => {
                        const filterId = `filter-sub-${sub.slug}`;
                        return `
                                        <label class="filter-option" for="${filterId}">
                                            <input 
                                                type="checkbox" 
                                                id="${filterId}"
                                                name="subcategoria" 
                                                value="${sub.slug}" 
                                                class="filter-checkbox">
                                            <span class="filter-label">${sub.nombre}</span>
                                        </label>
                                    `;
                    }).join('')}
                            </div>
                        </div>
                    `;
                }

                // Render Attributes
                if (atributos && atributos.length > 0) {
                    html += atributos.map(attr => {
                        const uniqueValues = [...new Set(attr.valores)].filter(v => v !== null);
                        if (uniqueValues.length === 0) return '';

                        const icon = this.getIconForAttribute(attr.nombre);

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
                            const filterId = `filter-${attr.id_atributo}-${safeVal.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
                            return `
                                            <label class="filter-option" for="${filterId}">
                                                <input 
                                                    type="checkbox" 
                                                    id="${filterId}"
                                                    name="attr_${attr.id_atributo}" 
                                                    value="${safeVal}" 
                                                    class="filter-checkbox">
                                                <span class="filter-label">${val}</span>
                                            </label>
                                        `;
                        }).join('')}
                                </div>
                            </div>
                        `;
                    }).filter(h => h !== '').join('');
                }

                container.innerHTML = html || '<div class="filter-group"><p class="text-sm text-gray-500">No hay filtros disponibles</p></div>';

                // Re-initialize icons
                if (window.lucide) window.lucide.createIcons();

                // Add event listeners
                container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', () => this.triggerFilterChange());
                });

            }
        } catch (err) {
            console.error('Error loading filters', err);
            container.innerHTML = '<div class="filter-group"><p class="text-sm text-gray-500">No se pudieron cargar los filtros</p></div>';
        }
    }

    getIconForAttribute(nombre) {
        const iconMap = {
            'cilindraje': 'gauge',
            'tipo de motor': 'zap',
            'tipo de frenos': 'disc',
            'color': 'palette',
            'material': 'layers',
            'dimensiones': 'maximize-2',
            'capacidad': 'package',
            'potencia': 'battery-charging',
            'voltaje': 'zap',
            'peso': 'weight',
            'tamaño': 'maximize',
            'marca': 'tag',
            'modelo': 'box',
            'año': 'calendar',
        };

        const lowerName = nombre.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }
        return 'settings';
    }

    triggerFilterChange() {
        this.updateClearFiltersButton();
        // Since we want to reset to page 1 on filter change, the callback should handle that
        this.onFilterChange();
    }

    updateClearFiltersButton() {
        const hasCheckboxFilters = this.container.querySelectorAll('#dynamic-filters-container input[type="checkbox"]:checked').length > 0;
        const minInput = this.container.querySelector('#price-min');
        const maxInput = this.container.querySelector('#price-max');
        const hasPriceFilters = (minInput && minInput.value) || (maxInput && maxInput.value);

        const hasActiveFilters = hasCheckboxFilters || hasPriceFilters;

        const clearBtn = this.container.querySelector('#clear-filters-btn');
        if (clearBtn) {
            clearBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
        }
    }

    clearAllFilters() {
        // Clear checkboxes
        this.container.querySelectorAll('#dynamic-filters-container input[type="checkbox"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear price
        const minInput = this.container.querySelector('#price-min');
        const maxInput = this.container.querySelector('#price-max');
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';

        this.updateClearFiltersButton();
        this.triggerFilterChange();
    }

    // New method to retrieve current filter state
    getFilterValues() {
        const minInput = this.container.querySelector('#price-min');
        const maxInput = this.container.querySelector('#price-max');

        const values = {
            precioMin: minInput && minInput.value ? Number(minInput.value) : null,
            precioMax: maxInput && maxInput.value ? Number(maxInput.value) : null,
            subcategoria: null,
            atributos: null
        };

        // Subcategories
        const selectedSubcategories = [];
        this.container.querySelectorAll('input[name="subcategoria"]:checked').forEach(input => {
            selectedSubcategories.push(input.value);
        });
        if (selectedSubcategories.length > 0) {
            values.subcategoria = selectedSubcategories[0];
        }

        // Attributes
        const selectedAttrs = {};
        this.container.querySelectorAll('#dynamic-filters-container input:checked').forEach(input => {
            if (input.name === 'subcategoria') return;

            const attrId = input.name.replace('attr_', '');
            if (!selectedAttrs[attrId]) selectedAttrs[attrId] = [];
            selectedAttrs[attrId].push(input.value);
        });

        if (Object.keys(selectedAttrs).length > 0) {
            values.atributos = JSON.stringify(selectedAttrs);
        }

        return values;
    }
}
