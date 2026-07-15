// src/modules/host/carroucelEvents/carroucelEventsController.js
import { carouselService } from '../../../services/carouselService.js';

let carouselItems = [];
let currentActiveIndex = 0;
let autoPlayInterval = null;
let isPaused = false;

export async function carroucelEventsController() {
    console.log('🔥 Carrusel de Eventos Controller iniciado');
    await loadCarouselImages();
    initCarousel();
}

async function loadCarouselImages() {
    const track = document.getElementById('snaap-carousel-track');
    if (!track) {
        console.warn('⚠️ No se encontró el contenedor del carrusel');
        return;
    }

    try {
        console.log('📤 Solicitando imágenes activas a Firestore...');
        const result = await carouselService.obtenerItemsActivos();
        
        console.log('📊 Resultado completo:', result);
        
        if (result.success && result.items && result.items.length > 0) {
            carouselItems = result.items.filter(item => item.active !== false);
            console.log(`📊 ${carouselItems.length} imágenes activas cargadas desde Firestore`);
            
            carouselItems.forEach((item, index) => {
                console.log(`   📌 [${index+1}] ${item.title} - URL: ${item.imageUrl ? 'Sí (Base64)' : 'No'}`);
            });
            
            if (carouselItems.length === 0) {
                console.log('ℹ️ No hay imágenes activas en Firestore');
                showEmptyMessage(track);
                return;
            }
        } else {
            console.log('ℹ️ No hay imágenes en Firestore');
            showEmptyMessage(track);
            return;
        }
    } catch (error) {
        console.error('❌ Error al cargar imágenes:', error);
        showEmptyMessage(track);
        return;
    }
    
    renderCarousel(track);
}

function showEmptyMessage(track) {
    track.innerHTML = `
        <div class="empty-carousel">
            <i class="fas fa-images"></i>
            <p>No hay eventos disponibles</p>
            <small>El administrador agregará imágenes pronto</small>
        </div>
    `;
}

function renderCarousel(track) {
    if (!track) return;
    track.innerHTML = '';
    
    if (carouselItems.length === 0) {
        showEmptyMessage(track);
        return;
    }
    
    carouselItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        let imgUrl = item.imageUrl || '';
        
        if (!imgUrl) {
            imgUrl = 'https://via.placeholder.com/600x400/1a1a2e/666?text=Sin+imagen';
        }
        
        const title = item.title || 'Evento';
        const subtitle = item.subtitle || '';
        const link = item.link || '/host/event-crud';
        
        card.innerHTML = `
            <img src="${imgUrl}" alt="${title}" loading="lazy" 
                 onerror="this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'image-error\\'><i class=\\'fas fa-image\\'></i><p>Imagen no disponible</p></div>'">
            <h3>${title}</h3>
            ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
        `;
        
        card.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(link);
            } else {
                window.location.href = link;
            }
        });
        
        track.appendChild(card);
    });
    
    updateCards(track);
    setupNavigation(track);
    startAutoPlay(track);
    setupPauseOnHover(track);
}

function updateCards(track) {
    const cards = track.querySelectorAll('.card');
    const total = cards.length;
    if (total === 0) return;
    
    if (currentActiveIndex >= total) {
        currentActiveIndex = 0;
    }
    
    cards.forEach((card, index) => {
        card.classList.remove('active', 'prev', 'next', 'hidden');
        if (index === currentActiveIndex) {
            card.classList.add('active');
        } else if (index === (currentActiveIndex - 1 + total) % total) {
            card.classList.add('prev');
        } else if (index === (currentActiveIndex + 1) % total) {
            card.classList.add('next');
        } else {
            card.classList.add('hidden');
        }
    });
}

function setupNavigation(track) {
    const prevBtn = document.getElementById('snaap-prev-btn');
    const nextBtn = document.getElementById('snaap-next-btn');
    
    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            move(-1, track);
            resetAutoPlay(track);
        });
    }
    
    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', (e) => {
            e.stopPropagation();
            move(1, track);
            resetAutoPlay(track);
        });
    }
}

function move(direction, track) {
    const total = carouselItems.length;
    if (total === 0) return;
    currentActiveIndex = (currentActiveIndex + direction + total) % total;
    updateCards(track);
}

function startAutoPlay(track) {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    
    if (carouselItems.length <= 1) return;
    
    autoPlayInterval = setInterval(() => {
        if (!isPaused) {
            move(1, track);
        }
    }, 4000);
}

function resetAutoPlay(track) {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    startAutoPlay(track);
}

function setupPauseOnHover(track) {
    track.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    
    track.addEventListener('mouseleave', () => {
        isPaused = false;
    });
}

function initCarousel() {
    console.log('✅ Carrusel inicializado');
    
    document.addEventListener('visibilitychange', () => {
        const track = document.getElementById('snaap-carousel-track');
        if (document.hidden) {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        } else {
            if (track) {
                startAutoPlay(track);
            }
        }
    });
}

export default carroucelEventsController;