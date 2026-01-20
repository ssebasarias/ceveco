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
                            <div class="asesor-option-content">
                                <h3>ALEATORIO</h3>
                                <p>Te asignaremos un asesor disponible</p>
                            </div>
                            <div class="asesor-option-whatsapp">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
        const track = document.querySelector('.asesor-carousel-track');
        const cards = document.querySelectorAll('.asesor-card');
        const indicators = document.querySelectorAll('.asesor-indicator');

        // Mover el carrusel usando transform
        if (track) {
            const offset = -index * 100;
            track.style.transform = `translateX(${offset}%)`;
        }

        // Actualizar clases active
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
        if (this.productInfo) {
            return `Hola, me interesa el producto *${this.productInfo.nombre}*. ¿Podrías darme más información?`;
        } else {
            return `Hola, me gustaría recibir información sobre sus productos.`;
        }
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
