// src/utils/navigation.js
// Helper para redirecciones internas: usa navigateTo (SPA) si está disponible, si no usa window.location.href
export function navigateTo(path) {
    if (!path) return false;

    const target = typeof path === 'string' ? path : String(path);

    if (typeof window === 'undefined') {
        return false;
    }

    if (typeof window.navigateTo === 'function') {
        window.navigateTo(target);
        return true;
    }

    window.location.href = target;
    return true;
}

export function navigateOrHref(path) {
    try {
        return navigateTo(path);
    } catch (error) {
        console.error('navigateOrHref error:', error);
        if (typeof window !== 'undefined') {
            window.location.href = String(path);
        }
        return false;
    }
}

if (typeof window !== 'undefined') {
    window.go = window.go || navigateOrHref;
}

