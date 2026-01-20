/**
 * Modal de Selección de Asesor
 * Permite al usuario elegir un asesor o seleccionar uno aleatorio
 */

class AsesorModal {
    constructor() {
        this.asesores = [];
        this.currentIndex = 0;
        this.productInfo = null;
        this.init();
    }

    async init() {
        await this.loadAsesores();
        this.createModal();
        this.attachEventListeners();
    }

    async loadAsesores() {
        try {
            const response = await fetch('/api/v1/asesores');
            const data = await response.json();

            if (data.success) {
                this.asesores = data.data;
            }
        } catch (error) {
            console.error('Error cargando asesores:', error);
        }
    }

    createModal() {
        const modalHTML = `
            <div id="asesorModal" class="asesor-modal" style="display: none;">
                <div class="asesor-modal-overlay"></div>
                <div class="asesor-modal-content">
                    <button class="asesor-modal-close" aria-label="Cerrar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="asesor-modal-header">
                        <h2>Escoge tu Asesor</h2>
                    </div>

                    <div class="asesor-modal-body">
                        <!-- Opción: Aleatorio -->
                        <button class="asesor-option-random">
                            <div class="asesor-option-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                            </div>
                            <div class="asesor-option-text">
                                <h3>Escoger Aleatorio</h3>
                            </div>
                        </button>

                        <!-- Divider -->
                        <div class="asesor-divider">
                            <span>o elige tu asesor</span>
                        </div>

                        <!-- Título del Carrusel -->
                        <h3 class="asesor-carousel-title">Escoger Asesor</h3>

                        <!-- Carrusel de Asesores -->
                        <div class="asesor-carousel-container">
                            <button class="asesor-carousel-btn asesor-carousel-prev" aria-label="Anterior">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div class="asesor-carousel">
                                <div class="asesor-carousel-track" id="asesorCarouselTrack">
                                    <!-- Asesores se cargan dinámicamente -->
                                </div>
                            </div>

                            <button class="asesor-carousel-btn asesor-carousel-next" aria-label="Siguiente">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>

                        <!-- Indicadores del carrusel -->
                        <div class="asesor-carousel-indicators" id="asesorCarouselIndicators">
                            <!-- Indicadores se cargan dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.renderAsesores();
    }

    renderAsesores() {
        const track = document.getElementById('asesorCarouselTrack');
        const indicators = document.getElementById('asesorCarouselIndicators');

        if (!track || !indicators) return;

        // Renderizar tarjetas de asesores
        track.innerHTML = this.asesores.map((asesor, index) => `
            <div class="asesor-card ${index === 0 ? 'active' : ''}" data-index="${index}" data-asesor-id="${asesor.id_asesor}">
                <div class="asesor-card-inner">
                    <div class="asesor-card-image">
                        <img src="${asesor.foto_url}" alt="${asesor.nombre_completo}" loading="lazy">
                        <div class="asesor-card-badge">${asesor.especialidad}</div>
                    </div>
                    <div class="asesor-card-content">
                        <h3>${asesor.nombre_completo}</h3>
                        <div class="asesor-rating">
                            ${this.renderStars(asesor.calificacion_promedio)}
                            <span class="asesor-rating-text">${asesor.calificacion_promedio}</span>
                        </div>
                        <button class="asesor-select-btn" data-asesor-id="${asesor.id_asesor}" data-telefono="${asesor.telefono}" data-nombre="${asesor.nombre_completo}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Chatear con ${asesor.nombre_completo.split(' ')[0]}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Renderizar indicadores
        indicators.innerHTML = this.asesores.map((_, index) => `
            <button class="asesor-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Ir al asesor ${index + 1}"></button>
        `).join('');
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            stars += '<svg class="star star-full" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        }

        // Media estrella
        if (hasHalfStar) {
            stars += '<svg class="star star-half" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)"></polygon></svg>';
        }

        // Estrellas vacías
        for (let i = 0; i < emptyStars; i++) {
            stars += '<svg class="star star-empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        }

        return stars;
    }

    attachEventListeners() {
        const modal = document.getElementById('asesorModal');
        const closeBtn = modal.querySelector('.asesor-modal-close');
        const overlay = modal.querySelector('.asesor-modal-overlay');
        const randomBtn = modal.querySelector('.asesor-option-random');
        const prevBtn = modal.querySelector('.asesor-carousel-prev');
        const nextBtn = modal.querySelector('.asesor-carousel-next');

        // Cerrar modal
        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());

        // Opción aleatoria
        randomBtn.addEventListener('click', () => this.selectRandom());

        // Navegación del carrusel
        prevBtn.addEventListener('click', () => this.navigate('prev'));
        nextBtn.addEventListener('click', () => this.navigate('next'));

        // Indicadores
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('asesor-indicator')) {
                const index = parseInt(e.target.dataset.index);
                this.goToSlide(index);
            }
        });

        // Botones de selección
        modal.addEventListener('click', (e) => {
            const selectBtn = e.target.closest('.asesor-select-btn');
            if (selectBtn) {
                const telefono = selectBtn.dataset.telefono;
                const nombre = selectBtn.dataset.nombre;
                this.contactAsesor(telefono, nombre);
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    navigate(direction) {
        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.asesores.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.asesores.length) % this.asesores.length;
        }
        this.goToSlide(this.currentIndex);
    }

    goToSlide(index) {
        this.currentIndex = index;
        const cards = document.querySelectorAll('.asesor-card');
        const indicators = document.querySelectorAll('.asesor-indicator');

        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });

        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    async selectRandom() {
        try {
            const response = await fetch('/api/v1/asesores/random');
            const data = await response.json();

            if (data.success && data.data) {
                this.contactAsesor(data.data.telefono, data.data.nombre_completo);
            }
        } catch (error) {
            console.error('Error seleccionando asesor aleatorio:', error);
        }
    }

    contactAsesor(telefono, nombre) {
        const mensaje = this.buildWhatsAppMessage(nombre);
        const url = `https://wa.me/${telefono.replace(/\+/g, '')}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
        this.close();
    }

    buildWhatsAppMessage(nombreAsesor) {
        let mensaje = `Hola ${nombreAsesor}, `;

        if (this.productInfo) {
            mensaje += `me interesa el producto: *${this.productInfo.nombre}*`;
            if (this.productInfo.sku) {
                mensaje += ` (SKU: ${this.productInfo.sku})`;
            }
            mensaje += `. ¿Podrías darme más información?`;
        } else {
            mensaje += `me gustaría recibir información sobre sus productos.`;
        }

        return mensaje;
    }

    open(productInfo = null) {
        this.productInfo = productInfo;
        const modal = document.getElementById('asesorModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Reset al primer asesor
        this.goToSlide(0);
    }

    close() {
        const modal = document.getElementById('asesorModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        this.productInfo = null;
    }
}

// Inicializar el modal cuando el DOM esté listo
let asesorModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    asesorModalInstance = new AsesorModal();
});

// Función global para abrir el modal desde cualquier parte
function abrirModalAsesor(productInfo = null) {
    if (asesorModalInstance) {
        asesorModalInstance.open(productInfo);
    }
}
