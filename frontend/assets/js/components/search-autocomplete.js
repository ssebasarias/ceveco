(function () {
    'use strict';

    function escHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // Self-inject CSS so this script is the only include needed
    (function ensureCss() {
        if (document.getElementById('search-autocomplete-css')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/css/components/search-autocomplete.css';
        link.id = 'search-autocomplete-css';
        document.head.appendChild(link);
    })();

    const DEBOUNCE_MS = 250;
    const MIN_QUERY = 2;

    function formatCOP(n) {
        if (n == null) return '';
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
    }

    function debounce(fn, ms) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    }

    function wireInput(input) {
        if (input.dataset.autocompleteWired === '1') return;
        input.dataset.autocompleteWired = '1';

        // Wrap input in a position-relative parent if needed and inject dropdown
        const wrap = input.parentElement;
        if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
        const dropdown = document.createElement('div');
        dropdown.className = 'search-autocomplete-dropdown';
        dropdown.setAttribute('role', 'listbox');
        wrap.appendChild(dropdown);

        let activeIndex = -1;
        let results = [];

        function render(items, loading, errorMsg) {
            if (loading === undefined) loading = false;
            if (errorMsg === undefined) errorMsg = null;
            results = items || [];
            activeIndex = -1;
            if (loading) {
                dropdown.innerHTML = '<div class="search-autocomplete-loading">Buscando…</div>';
                dropdown.classList.add('open');
                return;
            }
            if (errorMsg) {
                dropdown.innerHTML = '<div class="search-autocomplete-empty">' + errorMsg + '</div>';
                dropdown.classList.add('open');
                return;
            }
            if (!results.length) {
                dropdown.innerHTML = '<div class="search-autocomplete-empty">Sin resultados</div>';
                dropdown.classList.add('open');
                return;
            }
            var itemsHtml = results.map(function (p, i) {
                var webp = p.imagen || '/images/productos/placeholder.webp';
                var jpg = webp.replace(/\.webp$/i, '.jpg');
                return '<a class="search-autocomplete-item" href="/pages/detalle-producto.html?id=' + p.id_producto + '" data-index="' + i + '" role="option">' +
                    '<img src="' + jpg + '" alt="" class="search-autocomplete-thumb" loading="lazy" onerror="this.src=\'' + webp + '\'">' +
                    '<div class="search-autocomplete-info">' +
                        '<div class="search-autocomplete-name">' + escHtml(p.nombre) + '</div>' +
                        '<div class="search-autocomplete-meta">' + escHtml(p.marca || '') + ' · ' + escHtml(p.categoria || '') + '</div>' +
                    '</div>' +
                    '<div class="search-autocomplete-price">' + formatCOP(p.precio_actual) + '</div>' +
                '</a>';
            }).join('');
            var seeAll = '<a class="search-autocomplete-footer" href="/pages/productos.html?q=' + encodeURIComponent(input.value) + '">Ver todos los resultados →</a>';
            dropdown.innerHTML = itemsHtml + seeAll;
            dropdown.classList.add('open');
        }

        function close() {
            dropdown.classList.remove('open');
        }

        var search = debounce(function (q) {
            if (q.length < MIN_QUERY) { close(); return; }
            render([], true);
            fetch('/api/v1/search/autocomplete?q=' + encodeURIComponent(q))
                .then(function (r) { return r.json(); })
                .then(function (data) { render(data.data || []); })
                .catch(function () { render([], false, 'Error de conexión'); });
        }, DEBOUNCE_MS);

        input.addEventListener('input', function (e) { search(e.target.value.trim()); });
        input.addEventListener('focus', function () {
            if (input.value.trim().length >= MIN_QUERY) search(input.value.trim());
        });
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) close();
        });
        input.addEventListener('keydown', function (e) {
            var items = dropdown.querySelectorAll('.search-autocomplete-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                items.forEach(function (it, i) { it.classList.toggle('active', i === activeIndex); });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, -1);
                items.forEach(function (it, i) { it.classList.toggle('active', i === activeIndex); });
            } else if (e.key === 'Enter') {
                if (activeIndex >= 0 && items[activeIndex]) {
                    e.preventDefault();
                    window.location.href = items[activeIndex].href;
                } else if (input.value.trim().length >= MIN_QUERY) {
                    e.preventDefault();
                    window.location.href = '/pages/productos.html?q=' + encodeURIComponent(input.value.trim());
                }
            } else if (e.key === 'Escape') {
                close();
            }
        });
    }

    function init() {
        // Find search inputs in navbar (desktop + mobile) without modifying navbar HTML
        var candidates = [
            document.getElementById('search-input'),
            document.getElementById('mobile-search-input')
        ];
        // Also sweep for any text input with a search-like placeholder
        document.querySelectorAll('input[type="text"][placeholder*="Buscar"]').forEach(function (el) {
            candidates.push(el);
        });
        candidates.filter(Boolean).forEach(wireInput);
    }

    // Wait for navbar component to be loaded (Ceveco uses dynamic component injection)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    // Also re-wire after components:loaded event (navbar may load late)
    document.addEventListener('components:loaded', init);
    // Fallback: observe DOM for late-injected search inputs
    var obs = new MutationObserver(init);
    obs.observe(document.body, { childList: true, subtree: true });
})();
