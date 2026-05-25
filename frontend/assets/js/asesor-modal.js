/**
 * Modal de Selección de Asesor — diseño limpio sin carrusel
 *
 * UX:
 *   - Header sobrio (sin gradient pesado).
 *   - Grid de tarjetas de asesor (2 columnas en escritorio, 1 en móvil).
 *   - Cada tarjeta: avatar circular con iniciales, nombre, sede + especialidad,
 *     rating, una sola CTA "Cotizar con {nombre}".
 *   - Opción "Asignar asesor aleatorio" como link discreto al pie, no como
 *     banner verde dominante.
 */

class AsesorModal {
    constructor() {
        this.asesores = [];
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
                this.asesores = data.data || [];
            }
        } catch (error) {
            console.error('Error cargando asesores:', error);
        }
    }

    /**
     * Iniciales del nombre completo, fallback "AS" si nada se puede extraer.
     */
    static getInitials(nombre) {
        if (!nombre) return 'AS';
        const parts = String(nombre).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    /**
     * Color de fondo determinístico a partir del nombre, basado en hash simple.
     */
    static getAvatarColor(nombre) {
        const palette = ['#FE2418', '#091C49', '#00458E', '#FFD23F', '#FF6B35', '#004E89', '#10B981', '#7C3AED'];
        let h = 0;
        for (let i = 0; i < (nombre || '').length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
        return palette[h % palette.length];
    }

    static escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    renderStars(rating) {
        const r = Number(rating) || 0;
        const full = Math.floor(r);
        const half = (r - full) >= 0.5;
        const empty = 5 - full - (half ? 1 : 0);
        const star = (cls) => `<svg class="asesor-star ${cls}" viewBox="0 0 24 24" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        return star('asesor-star-full').repeat(full)
             + (half ? star('asesor-star-half') : '')
             + star('asesor-star-empty').repeat(empty);
    }

    createModal() {
        const modalHTML = `
            <div id="asesorModal" class="asesor-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="asesorModalTitle">
                <div class="asesor-modal-overlay" data-asesor-close></div>
                <div class="asesor-modal-content">
                    <button class="asesor-modal-close" data-asesor-close aria-label="Cerrar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="asesor-modal-header">
                        <h2 id="asesorModalTitle">Escoge tu asesor</h2>
                        <p class="asesor-modal-subtitle">Cualquiera de nuestro equipo puede atenderte. Elige uno o déjanos asignar uno disponible.</p>
                    </div>

                    <div class="asesor-modal-body">
                        <div class="asesor-grid" id="asesorGrid"></div>
                    </div>

                    <div class="asesor-modal-footer">
                        <button class="asesor-random-link" type="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="16 3 21 3 21 8"></polyline>
                                <line x1="4" y1="20" x2="21" y2="3"></line>
                                <polyline points="21 16 21 21 16 21"></polyline>
                                <line x1="15" y1="15" x2="21" y2="21"></line>
                                <line x1="4" y1="4" x2="9" y2="9"></line>
                            </svg>
                            Asignarme un asesor disponible
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.renderAsesores();
    }

    renderAsesores() {
        const grid = document.getElementById('asesorGrid');
        if (!grid) return;

        if (!this.asesores.length) {
            grid.innerHTML = `
                <div class="asesor-empty">
                    No hay asesores disponibles en este momento. Intenta más tarde.
                </div>
            `;
            return;
        }

        grid.innerHTML = this.asesores.map(a => {
            const nombre = a.nombre_completo || `${a.nombre || ''} ${a.apellido || ''}`.trim() || 'Asesor';
            const initials = AsesorModal.getInitials(nombre);
            const color = AsesorModal.getAvatarColor(nombre);
            const firstName = nombre.split(/\s+/)[0];
            const sede = a.sede_nombre || a.sede || '';
            const especialidad = a.especialidad || '';
            const subtitle = [sede, especialidad].filter(Boolean).join(' · ');
            const rating = a.calificacion_promedio || 0;
            const tel = (a.telefono || '').replace(/\+/g, '');

            return `
                <button type="button" class="asesor-card"
                        data-asesor-id="${AsesorModal.escapeHtml(a.id_asesor || '')}"
                        data-telefono="${AsesorModal.escapeHtml(tel)}"
                        data-nombre="${AsesorModal.escapeHtml(nombre)}">
                    <span class="asesor-avatar" style="background:${color}">${AsesorModal.escapeHtml(initials)}</span>
                    <span class="asesor-card-info">
                        <span class="asesor-card-name">${AsesorModal.escapeHtml(nombre)}</span>
                        ${subtitle ? `<span class="asesor-card-sub">${AsesorModal.escapeHtml(subtitle)}</span>` : ''}
                        <span class="asesor-card-rating">
                            ${this.renderStars(rating)}
                            <span class="asesor-card-rating-num">${Number(rating).toFixed(1)}</span>
                        </span>
                    </span>
                    <span class="asesor-card-cta">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Cotizar con ${AsesorModal.escapeHtml(firstName)}
                    </span>
                </button>
            `;
        }).join('');
    }

    attachEventListeners() {
        const modal = document.getElementById('asesorModal');
        if (!modal) return;

        // Cerrar (botón X o overlay)
        modal.addEventListener('click', (e) => {
            if (e.target.closest('[data-asesor-close]')) {
                this.close();
            }
        });

        // Asesor random (footer)
        const randomBtn = modal.querySelector('.asesor-random-link');
        if (randomBtn) randomBtn.addEventListener('click', () => this.selectRandom());

        // Click en tarjeta de asesor
        const grid = document.getElementById('asesorGrid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.asesor-card');
                if (!card) return;
                this.contactAsesor(card.dataset.telefono, card.dataset.nombre);
            });
        }

        // ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') this.close();
        });
    }

    async selectRandom() {
        try {
            const response = await fetch('/api/v1/asesores/random');
            const data = await response.json();
            if (data.success && data.data) {
                this.contactAsesor(data.data.telefono, data.data.nombre_completo);
            } else if (this.asesores.length) {
                // Fallback: random local
                const pick = this.asesores[Math.floor(Math.random() * this.asesores.length)];
                this.contactAsesor(pick.telefono, pick.nombre_completo);
            }
        } catch (error) {
            console.error('Error seleccionando asesor aleatorio:', error);
        }
    }

    contactAsesor(telefono, nombre) {
        if (!telefono) {
            console.warn('Asesor sin teléfono. No se puede abrir WhatsApp.');
            return;
        }
        const mensaje = this.buildWhatsAppMessage(nombre);
        const tel = String(telefono).replace(/\D/g, '');
        const url = `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank', 'noopener');
        this.close();
    }

    buildWhatsAppMessage(nombreAsesor) {
        const firstName = (nombreAsesor || '').split(/\s+/)[0];
        const greeting = firstName ? `Hola ${firstName}` : 'Hola';

        if (this.productInfo) {
            const p = this.productInfo;
            const nombre = p.nombre || p.name || '';
            const marca = (typeof p.marca === 'object' ? p.marca?.nombre : p.marca) || p.brand || '';
            const id = p.id_producto || p.id || '';
            return `${greeting}, estoy interesado en cotizar el siguiente producto:\n\n` +
                   `Producto: ${nombre}\n` +
                   (marca ? `Marca: ${marca}\n` : '') +
                   (id ? `ID: ${id}\n` : '') +
                   `\n¿Podrías darme más información?`;
        }
        return `${greeting}, me gustaría recibir información sobre sus productos.`;
    }

    open(productInfo = null) {
        this.productInfo = productInfo;
        const modal = document.getElementById('asesorModal');
        if (!modal) return;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('asesorModal');
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = '';
        this.productInfo = null;
    }
}

let asesorModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    asesorModalInstance = new AsesorModal();
});

function abrirModalAsesor(productInfo = null) {
    if (asesorModalInstance) {
        asesorModalInstance.open(productInfo);
    }
}
window.abrirModalAsesor = abrirModalAsesor;

// Event delegation: cualquier botón con clase .js-quote-product
// o data-action="cotizar" (legacy core.js createProductCard) abre el modal.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-quote-product, [data-action="cotizar"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.id || btn.dataset.productId;
    const cached = (window.__productosCache && id) ? window.__productosCache[id] : null;
    const productInfo = cached || {
        id_producto: id,
        nombre: btn.dataset.name || '',
        marca: btn.dataset.brand || '',
        imagen: btn.dataset.image || ''
    };
    abrirModalAsesor(productInfo);
});
