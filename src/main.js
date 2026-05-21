import { loadLayout } from '/src/modules/visitor/layout/loadLayout.js';
import { initRouter } from '/src/router/router.js';

(async () => {
    await loadLayout();
    initRouter();
})();