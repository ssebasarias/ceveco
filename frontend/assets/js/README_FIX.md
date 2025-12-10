# JavaScript Architecture Note

Due to persistent issues with external script loading/execution in the current local development environment (specifically `ceveco-core.js` failing to execute), core functionalities have been temporarily injected directly into page-specific scripts:

1.  **`pages/home.js`**: Contains injected `renderProductCard`, `formatPrice`, `loadSharedComponents`, and `toggleMobileMenu`.
2.  **`pages/productos.html` (inline module script)**: Contains the same injected logic to ensure the catalog pages work independently.

## Future Refactoring
Once the environment issue (potential silent blocking or pathing constraint for root-level scripts) is resolved, this code should be moved back to a shared module (e.g., `core.js` or `utils.js`) and imported properly using ES Modules.

For now, do not remove the injected blocks marked with `// --- INJECTED DEPENDENCY ---` unless you are sure the external shared script is loading correctly.
