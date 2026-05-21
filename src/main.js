import { loadLayout } from '/src/modules/visitor/layout/loadLayout.js';
import { initRouter } from '/src/router/router.js';   // ← Ruta correcta

(async () => {
    await loadLayout();
    initRouter();
})();