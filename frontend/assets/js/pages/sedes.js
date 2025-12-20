document.addEventListener('DOMContentLoaded', async () => {
    const sedesGrid = document.getElementById('sedes-grid');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');

    if (!sedesGrid || !loadingState || !loadingState) {
        console.error('Critical: Sedes DOM elements missing');
        return;
    }

    async function loadSedes() {
        try {
            const response = await API.get('/sedes');

            if (response.success && response.data.length > 0) {
                renderSedes(response.data);
                toggleState('success');
            } else {
                throw new Error('No sedes found');
            }
        } catch (error) {
            console.error('Error loading sedes:', error);
            toggleState('error');
        }
    }

    function toggleState(state) {
        if (!loadingState || !sedesGrid || !errorState) {
            console.error('DOM Elements not found');
            return;
        }

        console.log('Toggling state to:', state);

        if (state === 'loading') {
            loadingState.style.setProperty('display', 'flex', 'important');
            sedesGrid.style.setProperty('display', 'none', 'important');
            errorState.style.setProperty('display', 'none', 'important');
        } else if (state === 'success') {
            // Force hide loading state
            loadingState.classList.add('hidden');
            loadingState.style.setProperty('display', 'none', 'important');

            sedesGrid.style.removeProperty('display'); // Remove inline style first
            sedesGrid.style.setProperty('display', 'grid', 'important');
            sedesGrid.classList.remove('hidden');

            errorState.style.setProperty('display', 'none', 'important');
        } else {
            loadingState.style.setProperty('display', 'none', 'important');
            sedesGrid.style.setProperty('display', 'none', 'important');
            errorState.style.setProperty('display', 'block', 'important');
        }
    }

    // Debug log to confirm update
    console.log('Sedes JS v.FIX.2 loaded');

    function renderSedes(sedes) {
        sedesGrid.innerHTML = sedes.map(sede => createSedeCard(sede)).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    function createSedeCard(sede) {
        const isPrincipal = sede.es_principal;
        const lat = parseFloat(sede.latitud);
        const lng = parseFloat(sede.longitud);

        let query = '';
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            query = `${lat},${lng}`;
        } else {
            query = encodeURIComponent(`${sede.direccion}, ${sede.ciudad}, ${sede.departamento}, Colombia`);
        }

        const mapUrl = `https://maps.google.com/maps?q=${query}&hl=es&z=15&output=embed`;
        const directionsUrl = sede.link_google_maps ? sede.link_google_maps : `https://www.google.com/maps/dir/?api=1&destination=${query}`;

        // Parse services if JSON string
        let services = [];
        try {
            if (typeof sede.servicios === 'string') {
                services = JSON.parse(sede.servicios);
            } else if (Array.isArray(sede.servicios)) {
                services = sede.servicios;
            }
        } catch (e) {
            services = [];
        }

        return `
            <div class="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100 ${isPrincipal ? 'lg:col-span-2' : ''}">
                <div class="grid grid-cols-1 ${isPrincipal ? 'lg:grid-cols-2' : ''}">
                    <div class="relative h-64 ${isPrincipal ? 'lg:h-auto' : ''}">
                        <iframe
                            src="${mapUrl}"
                            width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
                            class="absolute inset-0 w-full h-full bg-gray-100">
                        </iframe>
                    </div>
                    <div class="p-5 md:p-8 flex flex-col justify-center">
                        <div class="mb-3 md:mb-4">
                            ${isPrincipal ? `
                            <span class="inline-block px-3 py-1 bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                                Sede Principal
                            </span>` : ''}
                            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">${sede.nombre}</h2>
                        </div>
                        
                        <div class="space-y-3 md:space-y-4 text-gray-600 text-sm md:text-base">
                            <div class="flex items-start gap-3">
                                <i data-lucide="map-pin" class="w-5 h-5 text-primary mt-1"></i>
                                <p>${sede.direccion}<br>${sede.ciudad}, ${sede.departamento}</p>
                            </div>
                            
                            ${sede.telefono ? `
                            <div class="flex items-center gap-3">
                                <i data-lucide="phone" class="w-5 h-5 text-primary"></i>
                                <p>${sede.telefono}</p>
                            </div>` : ''}

                            ${sede.horario_atencion ? `
                            <div class="flex items-start gap-3">
                                <i data-lucide="clock" class="w-5 h-5 text-primary mt-1"></i>
                                <p class="whitespace-pre-line">${sede.horario_atencion}</p>
                            </div>` : ''}
                        </div>

                        <div class="mt-6 md:mt-8">
                            <a href="${directionsUrl}" target="_blank"
                                class="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto gap-2">
                                <i data-lucide="navigation" class="w-4 h-4"></i>
                                Cómo llegar
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize
    loadSedes();
});
