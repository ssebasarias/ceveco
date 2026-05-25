/**
 * Reusable IntersectionObserver for scroll-triggered fade-in animations.
 * Elements with [data-fade-in] get the "in-view" class when they enter viewport.
 * Respects prefers-reduced-motion (CSS handles the actual no-animation case).
 */
(function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    function observeAll() {
        document.querySelectorAll('[data-fade-in]:not(.in-view)').forEach((el) => {
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeAll);
    } else {
        observeAll();
    }

    // Watch for dynamically added elements (e.g. product cards rendered after fetch)
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    window.__cevecoScrollObserver = { observeAll };
})();
