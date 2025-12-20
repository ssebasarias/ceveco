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

        // Initialize Price Filter Accordion Logic
        // We need to re-bind this if the HTML structure for price changes to match accordion
        // But assuming the static HTML will be updated to match the new structure, we'll treat it as a group
        this.initAccordionGroups();
    }

    // Helper to initialize accordion behavior for existing and new groups
    initAccordionGroups() {
        const headers = this.container.querySelectorAll('.filter-group-header');
        headers.forEach(header => {
            // Remove old listener to avoid duplicates if re-running
            header.onclick = null;
            header.addEventListener('click', (e) => {
                const group = header.closest('.filter-group');
                this.toggleGroup(group);
            });
        });
    }

    toggleGroup(group) {
        if (!group) return;
        const isOpen = group.classList.contains('open');

        // Optional: Close others? For now, allow multiple open (true accordion)
        // group.parentElement.querySelectorAll('.filter-group.open').forEach(g => g.classList.remove('open'));

        if (isOpen) {
            group.classList.remove('open');
        } else {
            group.classList.add('open');
        }
    }

    async loadDynamicFilters(categoria) {
        const container = this.container.querySelector('#dynamic-filters-container');
        if (!container) return;

        container.innerHTML = '<div class="filter-loading"><div class="filter-loading-spinner"></div></div>';

        try {
            if (typeof window.ProductService === 'undefined') {
                console.error('ProductService is not defined');
                return;
            }

            const response = await window.ProductService.getFilters(categoria);
            if (response.success && response.data) {
                const { subcategorias, atributos } = response.data;
                let html = '';

                // Render Subcategories
                if (subcategorias && subcategorias.length > 0) {
                    html += this.renderFilterGroup({
                        id: 'subcategorias',
                        title: 'Subcategorías',
                        icon: 'folder',
                        isOpen: true, // Auto open first group
                        content: subcategorias.map(sub => {
                            const filterId = `filter-sub-${sub.slug}`;
                            return `
                                <label class="filter-option" for="${filterId}">
                                    <input 
                                        type="checkbox" 
                                        id="${filterId}"
                                        name="subcategoria" 
                                        value="${sub.slug}" 
                                        class="filter-checkbox">
                                    <span class="filter-label">${this.escapeHTML(sub.nombre)}</span>
                                </label>
                            `;
                        }).join('')
                    });
                }

                // Render Attributes
                if (atributos && atributos.length > 0) {
                    html += atributos.map(attr => {
                        const uniqueValues = [...new Set(attr.valores)].filter(v => v !== null);
                        if (uniqueValues.length === 0) return '';

                        const icon = this.getIconForAttribute(attr.nombre);
                        const content = uniqueValues.map(val => {
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
                                    <span class="filter-label">${this.escapeHTML(val)}</span>
                                </label>
                            `;
                        }).join('');

                        return this.renderFilterGroup({
                            id: `attr-${attr.id_atributo}`,
                            title: attr.nombre,
                            icon: icon,
                            unit: attr.unidad,
                            content: content
                        });

                    }).filter(h => h !== '').join('');
                }

                container.innerHTML = html || '<div class="filter-group"><div class="p-4 text-sm text-gray-500">No hay filtros disponibles</div></div>';

                // Re-initialize icons
                if (window.lucide) window.lucide.createIcons();

                // Re-bind accordions
                this.initAccordionGroups();

                // Add Checkbox Listeners for Badges
                this.bindCheckboxListeners();

            }
        } catch (err) {
            console.error('Error loading filters', err);
            container.innerHTML = '<div class="filter-group"><div class="p-4 text-sm text-gray-500">No se pudieron cargar los filtros</div></div>';
        }
    }

    renderFilterGroup({ id, title, icon, content, isOpen = false, unit = '' }) {
        const titleHtml = unit ? `${this.escapeHTML(title)} <span class="text-xs text-gray-400 ml-1">(${unit})</span>` : this.escapeHTML(title);

        return `
            <div class="filter-group ${isOpen ? 'open' : ''}" data-group-id="${id}">
                <button class="filter-group-header" type="button">
                    <div class="filter-group-title">
                        <i data-lucide="${icon}" class="w-4 h-4 filter-group-icon"></i>
                        <span>${titleHtml}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="filter-group-count-badge">0</span>
                        <i data-lucide="chevron-down" class="filter-chevron"></i>
                    </div>
                </button>
                <div class="filter-group-content">
                    <div class="filter-options scrollable">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    bindCheckboxListeners() {
        const checkboxes = this.container.querySelectorAll('.filter-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.updateGroupBadge(cb);
                this.triggerFilterChange();
            });
        });
    }

    updateGroupBadge(checkbox) {
        const group = checkbox.closest('.filter-group');
        if (!group) return;

        const countSpan = group.querySelector('.filter-group-count-badge');
        if (!countSpan) return;

        const checkedCount = group.querySelectorAll('.filter-checkbox:checked').length;

        countSpan.textContent = checkedCount;
        if (checkedCount > 0) {
            countSpan.classList.add('visible');
        } else {
            countSpan.classList.remove('visible');
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
            'bateria': 'battery',
            'potencia': 'activity',
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
        return 'settings-2';
    }

    escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[c];
        });
    }

    triggerFilterChange() {
        this.updateClearFiltersButton();
        this.onFilterChange();
    }

    updateClearFiltersButton() {
        const hasCheckboxFilters = this.container.querySelectorAll('#dynamic-filters-container input[type="checkbox"]:checked').length > 0;

        // Check price inputs manually if they exist (need to select them correctly from HTML structure)
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
        this.container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.updateGroupBadge(checkbox); // Update badges to 0
        });

        // Clear price
        const minInput = this.container.querySelector('#price-min');
        const maxInput = this.container.querySelector('#price-max');
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';

        this.updateClearFiltersButton();
        this.triggerFilterChange();
    }

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
