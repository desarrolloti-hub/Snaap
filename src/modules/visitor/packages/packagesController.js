export async function packagesController() {
    const cssLink = document.querySelector('link[href="/src/css/components/packages.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/packages.css';
        document.head.appendChild(link);
    }
    
    const btns = document.querySelectorAll('.btn-snaap-pkg');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Botón clickeado:', btn.innerText);
            alert('Funcionalidad en desarrollo');
        });
    });
}