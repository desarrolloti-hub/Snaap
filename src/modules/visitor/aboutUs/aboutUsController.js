export async function aboutUsController() {
    const cssLink = document.querySelector('link[href="/src/css/components/aboutUs.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/aboutUs.css';
        document.head.appendChild(link);
    }
    
    const historiaTexto = "Primera línea con texto suave. Segunda línea que continúa la idea. Tercera línea para mantener la forma. Cuarta línea sin mensaje específico. Quinta línea para completar las cinco.";
    const inspiracionTexto = "Primera línea con texto suave. Segunda línea que continúa la idea. Tercera línea para mantener la forma. Cuarta línea sin mensaje específico. Quinta línea para completar las cinco.";
    
    const historiaP = document.getElementById('historia-texto');
    if (historiaP) historiaP.innerText = historiaTexto;
    const inspiracionP = document.getElementById('inspiracion-texto');
    if (inspiracionP) inspiracionP.innerText = inspiracionTexto;
    
    const imagenesCarrusel1 = [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543012474-9461f6764dfc?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop"
    ];
    const imagenesCarrusel2 = [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop"
    ];
    
    function setupCarrusel(carruselId, puntosId, imagenes) {
        const wrapper = document.getElementById(carruselId);
        const puntosContainer = document.getElementById(puntosId);
        if (!wrapper || !puntosContainer) return;
        
        wrapper.innerHTML = '';
        puntosContainer.innerHTML = '';
        
        imagenes.forEach((imgSrc, idx) => {
            const img = document.createElement('img');
            img.className = 'acerca-slide';
            if (idx === 0) img.classList.add('active');
            img.src = imgSrc;
            wrapper.appendChild(img);
            
            const punto = document.createElement('span');
            punto.className = 'carrusel-punto';
            if (idx === 0) punto.classList.add('active');
            puntosContainer.appendChild(punto);
        });
        
        const slides = wrapper.querySelectorAll('.acerca-slide');
        const puntos = puntosContainer.querySelectorAll('.carrusel-punto');
        let index = 0;
        
        puntos.forEach((punto, i) => {
            punto.addEventListener('click', () => {
                slides[index].classList.remove('active');
                puntos[index].classList.remove('active');
                index = i;
                slides[index].classList.add('active');
                puntos[index].classList.add('active');
            });
        });
        
        setInterval(() => {
            slides[index].classList.remove('active');
            puntos[index].classList.remove('active');
            index = (index + 1) % slides.length;
            slides[index].classList.add('active');
            puntos[index].classList.add('active');
        }, 4000);
    }
    
    setupCarrusel('carrusel-1', 'puntos-carrusel-1', imagenesCarrusel1);
    setupCarrusel('carrusel-2', 'puntos-carrusel-2', imagenesCarrusel2);
}