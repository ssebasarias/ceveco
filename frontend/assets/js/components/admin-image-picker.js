/**
 * AdminImagePicker — Pista C (Admin Modal de Imágenes)
 *
 * Módulo independiente que controla la galería de imágenes del modal de
 * producto del panel admin: drag-and-drop para subir, click en estrella
 * para marcar como principal, drag-and-drop para reordenar, click en
 * papelera para eliminar y "Buscar imagen automáticamente" para disparar
 * el scraper.
 *
 * Pensado para administradores no técnicos: dropzone visible, controles
 * en hover, estado principal MUY destacado (borde amarillo + estrella +
 * badge), mensajes de error en español plano.
 *
 * API global:
 *   - window.AdminImagePicker.init(productId)
 *   - window.AdminImagePicker.reset()
 *   - window.AdminImagePicker.reload()
 *
 * Requiere los siguientes IDs en el DOM:
 *   - #img-dropzone, #img-file-input, #img-gallery, #img-status, #img-auto-scrape
 */
(function () {
    'use strict';

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

    let currentProductId = null;
    let dragSourceId = null;
    let isWired = false;

    function $(id) { return document.getElementById(id); }

    function authHeaders() {
        const h = {};
        try {
            if (window.AdminHelper && typeof window.AdminHelper.getAuthToken === 'function') {
                const t = window.AdminHelper.getAuthToken();
                if (t) h['Authorization'] = 'Bearer ' + t;
            }
        } catch (e) { /* ignore */ }
        return h;
    }

    function setStatus(msg, kind) {
        const el = $('img-status');
        if (!el) return;
        el.textContent = msg || '';
        el.classList.remove('is-error', 'is-success');
        if (kind === 'error') el.classList.add('is-error');
        if (kind === 'success') el.classList.add('is-success');
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function friendlyError(file, message) {
        if (!message) return `No se pudo subir ${file?.name || 'la imagen'}.`;
        const lower = String(message).toLowerCase();
        if (lower.includes('413') || lower.includes('grande') || lower.includes('large')) {
            return `${file?.name || 'La imagen'} es muy grande. Máximo 5 MB.`;
        }
        if (lower.includes('jpg') || lower.includes('png') || lower.includes('webp') || lower.includes('formato')) {
            return `${file?.name || 'El archivo'} no es una imagen válida. Usa JPG, PNG o WebP.`;
        }
        return message;
    }

    async function fetchGallery(productId) {
        try {
            const res = await fetch(`/api/v1/admin/productos/${productId}/imagenes`, {
                credentials: 'include',
                headers: authHeaders()
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error ${res.status} al cargar imágenes`);
            }
            const data = await res.json();
            return Array.isArray(data.data) ? data.data : [];
        } catch (err) {
            console.error('[AdminImagePicker] fetchGallery error:', err);
            setStatus('No se pudo cargar la galería de imágenes.', 'error');
            return [];
        }
    }

    function renderGallery(images) {
        const gallery = $('img-gallery');
        if (!gallery) return;
        if (!images || !images.length) {
            gallery.innerHTML = '<div class="img-gallery-empty">Aún no hay imágenes para este producto.</div>';
            return;
        }
        gallery.innerHTML = images.map(img => {
            const id = img.id_imagen != null ? img.id_imagen : img.id;
            const url = img.url_imagen || img.url || '';
            const alt = img.alt_text || `Imagen del producto ${currentProductId}`;
            const isPrincipal = !!img.es_principal;
            return `
                <div class="img-tile${isPrincipal ? ' is-principal' : ''}"
                     data-img-id="${escapeHtml(id)}" draggable="true">
                    ${isPrincipal ? '<span class="img-tile__badge">Principal</span>' : ''}
                    <img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" class="img-tile__img"
                         onerror="this.src='/assets/img/no-image.svg'">
                    <div class="img-tile__overlay">
                        <button type="button"
                                class="img-tile__action img-tile__action--star${isPrincipal ? ' is-active' : ''}"
                                data-action="set-principal"
                                aria-label="${isPrincipal ? 'Imagen principal' : 'Marcar como principal'}"
                                title="${isPrincipal ? 'Imagen principal' : 'Marcar como principal'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                 fill="${isPrincipal ? '#ca8a04' : 'none'}" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </button>
                        <button type="button"
                                class="img-tile__action img-tile__action--delete"
                                data-action="delete"
                                aria-label="Eliminar imagen"
                                title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
                                <path d="M10 11v6"></path>
                                <path d="M14 11v6"></path>
                                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function reload() {
        if (!currentProductId) return;
        const images = await fetchGallery(currentProductId);
        renderGallery(images);
    }

    function validateFile(file) {
        if (!file) return 'Archivo vacío.';
        if (file.size > MAX_FILE_SIZE) {
            return `${file.name} es muy grande. El máximo permitido es 5 MB.`;
        }
        const name = (file.name || '').toLowerCase();
        const ext = name.includes('.') ? name.split('.').pop() : '';
        if (!ALLOWED_EXT.includes(ext)) {
            return `${file.name} no es una imagen válida. Usa JPG, PNG o WebP.`;
        }
        if (file.type && !/^image\/(jpeg|png|webp)$/.test(file.type)) {
            return `${file.name} no es una imagen válida. Usa JPG, PNG o WebP.`;
        }
        return null;
    }

    async function uploadFiles(files) {
        if (!currentProductId) {
            setStatus('Guarda el producto antes de subir imágenes.', 'error');
            return;
        }
        const list = Array.from(files || []);
        if (!list.length) return;

        let ok = 0, fail = 0;
        for (const file of list) {
            const errMsg = validateFile(file);
            if (errMsg) {
                setStatus(errMsg, 'error');
                fail++;
                continue;
            }
            setStatus(`Subiendo ${file.name}...`);
            try {
                const fd = new FormData();
                fd.append('imagen', file);
                const res = await fetch(`/api/v1/admin/productos/${currentProductId}/imagenes`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: authHeaders(), // Content-Type lo pone el browser para FormData
                    body: fd
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success) {
                    const msg = friendlyError(file, data.message || `Error ${res.status}`);
                    setStatus(msg, 'error');
                    fail++;
                    continue;
                }
                ok++;
            } catch (err) {
                console.error('[AdminImagePicker] upload error:', err);
                setStatus(friendlyError(file, 'No se pudo subir (revisa tu conexión).'), 'error');
                fail++;
            }
        }
        if (ok > 0) {
            const verb = ok === 1 ? 'subida' : 'subidas';
            setStatus(`${ok} imagen${ok === 1 ? '' : 'es'} ${verb}${fail ? ` (${fail} con error)` : ''}.`, fail ? 'error' : 'success');
        }
        await reload();
    }

    async function setPrincipal(imgId) {
        if (!currentProductId || !imgId) return;
        try {
            const res = await fetch(`/api/v1/admin/productos/${currentProductId}/imagen-principal`, {
                method: 'PATCH',
                credentials: 'include',
                headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
                body: JSON.stringify({ imagen_id: parseInt(imgId, 10) })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setStatus(data.message || 'No se pudo marcar como principal.', 'error');
                return;
            }
            setStatus('Imagen principal actualizada.', 'success');
            await reload();
        } catch (err) {
            console.error('[AdminImagePicker] setPrincipal error:', err);
            setStatus('No se pudo marcar como principal.', 'error');
        }
    }

    async function deleteImage(imgId) {
        if (!currentProductId || !imgId) return;
        const confirmed = window.confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.');
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/v1/admin/productos/${currentProductId}/imagenes/${imgId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: authHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setStatus(data.message || 'No se pudo eliminar la imagen.', 'error');
                return;
            }
            setStatus('Imagen eliminada.', 'success');
            await reload();
        } catch (err) {
            console.error('[AdminImagePicker] delete error:', err);
            setStatus('No se pudo eliminar la imagen.', 'error');
        }
    }

    async function persistOrder() {
        if (!currentProductId) return;
        const gallery = $('img-gallery');
        if (!gallery) return;
        const tiles = Array.from(gallery.querySelectorAll('[data-img-id]'));
        const orden = tiles.map(el => parseInt(el.dataset.imgId, 10)).filter(n => !isNaN(n));
        if (!orden.length) return;
        try {
            const res = await fetch(`/api/v1/admin/productos/${currentProductId}/imagenes/orden`, {
                method: 'PATCH',
                credentials: 'include',
                headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
                body: JSON.stringify({ orden })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setStatus(data.message || 'No se pudo guardar el nuevo orden.', 'error');
                return;
            }
            setStatus('Orden guardado.', 'success');
        } catch (err) {
            console.error('[AdminImagePicker] reorder error:', err);
            setStatus('No se pudo guardar el nuevo orden.', 'error');
        }
    }

    async function runScrape() {
        if (!currentProductId) return;
        const btn = $('img-auto-scrape');
        if (btn) btn.disabled = true;
        setStatus('Buscando imagen oficial, esto puede tardar 30-60 segundos...');
        try {
            const res = await fetch(`/api/v1/admin/productos/${currentProductId}/scrape`, {
                method: 'POST',
                credentials: 'include',
                headers: authHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setStatus(data.message || 'No se pudo iniciar el scraping.', 'error');
                return;
            }
            setStatus('Scraping iniciado. Vamos a recargar las imágenes automáticamente cada 15 segundos durante 2 minutos.');

            // Polling suave de la galería cada 15s durante 2 minutos
            const start = Date.now();
            const expectedProductId = currentProductId;
            const interval = setInterval(async () => {
                if (currentProductId !== expectedProductId) {
                    clearInterval(interval);
                    return;
                }
                await reload();
                if (Date.now() - start > 2 * 60 * 1000) {
                    clearInterval(interval);
                    setStatus('Si no aparece la imagen, vuelve a intentar o súbela manualmente.', '');
                }
            }, 15000);
        } catch (err) {
            console.error('[AdminImagePicker] scrape error:', err);
            setStatus('No se pudo iniciar el scraping.', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // ----- Event wiring -----
    function onGalleryClick(e) {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;
        const tile = actionEl.closest('[data-img-id]');
        if (!tile) return;
        const imgId = tile.dataset.imgId;
        const action = actionEl.dataset.action;
        if (action === 'set-principal') setPrincipal(imgId);
        else if (action === 'delete') deleteImage(imgId);
    }

    function onGalleryDragStart(e) {
        const tile = e.target.closest('[data-img-id]');
        if (!tile) return;
        dragSourceId = tile.dataset.imgId;
        tile.classList.add('is-dragging');
        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', dragSourceId);
        } catch (err) { /* ignore */ }
    }

    function onGalleryDragOver(e) {
        const tile = e.target.closest('[data-img-id]');
        if (!tile) return;
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch (err) { /* ignore */ }
        document.querySelectorAll('#img-gallery .img-tile.is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
        if (dragSourceId && tile.dataset.imgId !== dragSourceId) {
            tile.classList.add('is-drop-target');
        }
    }

    function onGalleryDragLeave(e) {
        const tile = e.target.closest('[data-img-id]');
        if (tile) tile.classList.remove('is-drop-target');
    }

    function onGalleryDrop(e) {
        e.preventDefault();
        const targetTile = e.target.closest('[data-img-id]');
        const gallery = $('img-gallery');
        if (!gallery || !targetTile || !dragSourceId) return;
        const srcTile = gallery.querySelector(`[data-img-id="${CSS.escape(dragSourceId)}"]`);
        if (srcTile && srcTile !== targetTile) {
            gallery.insertBefore(srcTile, targetTile);
            persistOrder();
        }
        document.querySelectorAll('#img-gallery .img-tile.is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
    }

    function onGalleryDragEnd() {
        document.querySelectorAll('#img-gallery .img-tile').forEach(el => {
            el.classList.remove('is-dragging');
            el.classList.remove('is-drop-target');
        });
        dragSourceId = null;
    }

    function onDropzoneClick() {
        const input = $('img-file-input');
        if (input) input.click();
    }

    function onDropzoneKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onDropzoneClick();
        }
    }

    function onDropzoneDragOver(e) {
        e.preventDefault();
        const zone = $('img-dropzone');
        if (zone) zone.classList.add('is-dragover');
    }

    function onDropzoneDragLeave() {
        const zone = $('img-dropzone');
        if (zone) zone.classList.remove('is-dragover');
    }

    function onDropzoneDrop(e) {
        e.preventDefault();
        const zone = $('img-dropzone');
        if (zone) zone.classList.remove('is-dragover');
        if (e.dataTransfer && e.dataTransfer.files) {
            uploadFiles(e.dataTransfer.files);
        }
    }

    function onFileInputChange(e) {
        if (e.target.files && e.target.files.length) {
            uploadFiles(e.target.files);
            e.target.value = ''; // permitir re-subir mismo archivo
        }
    }

    function wireEventsOnce() {
        if (isWired) return;
        const zone = $('img-dropzone');
        const input = $('img-file-input');
        const gallery = $('img-gallery');
        const scrapeBtn = $('img-auto-scrape');

        if (zone) {
            zone.addEventListener('click', onDropzoneClick);
            zone.addEventListener('keydown', onDropzoneKeydown);
            zone.addEventListener('dragover', onDropzoneDragOver);
            zone.addEventListener('dragenter', onDropzoneDragOver);
            zone.addEventListener('dragleave', onDropzoneDragLeave);
            zone.addEventListener('drop', onDropzoneDrop);
        }
        if (input) {
            input.addEventListener('change', onFileInputChange);
        }
        if (gallery) {
            gallery.addEventListener('click', onGalleryClick);
            gallery.addEventListener('dragstart', onGalleryDragStart);
            gallery.addEventListener('dragover', onGalleryDragOver);
            gallery.addEventListener('dragleave', onGalleryDragLeave);
            gallery.addEventListener('drop', onGalleryDrop);
            gallery.addEventListener('dragend', onGalleryDragEnd);
        }
        if (scrapeBtn) {
            scrapeBtn.addEventListener('click', runScrape);
        }
        isWired = true;
    }

    // ----- Public API -----
    async function init(productId) {
        const id = parseInt(productId, 10);
        if (isNaN(id) || id <= 0) {
            console.warn('[AdminImagePicker] init: productId inválido', productId);
            reset();
            return;
        }
        currentProductId = id;
        // Reset wiring si el DOM se reconstruyó (modal lazy-injected en index/productos)
        // Comprobamos si los listeners siguen en su sitio: si el dropzone ya no existe,
        // marcamos isWired = false para re-bindear.
        if (!document.getElementById('img-dropzone')) {
            isWired = false;
        }
        setStatus('');
        wireEventsOnce();
        await reload();
    }

    function reset() {
        currentProductId = null;
        dragSourceId = null;
        const gallery = $('img-gallery');
        if (gallery) {
            gallery.innerHTML = '<div class="img-gallery-empty">Aún no hay imágenes para este producto.</div>';
        }
        setStatus('');
    }

    window.AdminImagePicker = { init, reset, reload };
})();
