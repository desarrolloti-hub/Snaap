// Datos de ejemplo (simulando API)
const mockData = {
    host: {
        name: "Carlos Rodríguez",
        id: 1
    },
    properties: [
        {
            id: 1,
            title: "Hermoso apartamento en el centro",
            location: "Centro, Ciudad",
            price: 120,
            image: "https://via.placeholder.com/300x200",
            status: "active",
            guests: 4
        },
        {
            id: 2,
            title: "Casa de playa con vista al mar",
            location: "Zona Costera",
            price: 250,
            image: "https://via.placeholder.com/300x200",
            status: "active",
            guests: 6
        },
        {
            id: 3,
            title: "Loft moderno cerca del aeropuerto",
            location: "Zona Norte",
            price: 90,
            image: "https://via.placeholder.com/300x200",
            status: "inactive",
            guests: 2
        }
    ],
    reservations: [
        {
            id: 1,
            guest: "María González",
            property: "Hermoso apartamento en el centro",
            checkIn: "2025-01-15",
            checkOut: "2025-01-20",
            status: "confirmed",
            amount: 600
        },
        {
            id: 2,
            guest: "Juan Pérez",
            property: "Casa de playa con vista al mar",
            checkIn: "2025-01-18",
            checkOut: "2025-01-22",
            status: "pending",
            amount: 1000
        },
        {
            id: 3,
            guest: "Ana Martínez",
            property: "Loft moderno cerca del aeropuerto",
            checkIn: "2025-01-10",
            checkOut: "2025-01-12",
            status: "confirmed",
            amount: 180
        }
    ]
};

// Calcular estadísticas
function calculateStats(properties, reservations) {
    const totalProperties = properties.length;
    const totalGuests = properties.reduce((sum, prop) => sum + (prop.guests || 0), 0);
    const totalRevenue = reservations
        .filter(res => res.status === 'confirmed')
        .reduce((sum, res) => sum + res.amount, 0);
    const rating = 4.8; // Rating de ejemplo
    
    return {
        totalProperties,
        totalGuests,
        totalRevenue,
        rating
    };
}

// Actualizar estadísticas en el DOM
function updateStats(properties, reservations) {
    const stats = calculateStats(properties, reservations);
    
    const totalPropertiesEl = document.getElementById('totalProperties');
    const totalGuestsEl = document.getElementById('totalGuests');
    const revenueEl = document.getElementById('revenue');
    const ratingEl = document.getElementById('rating');
    
    if (totalPropertiesEl) totalPropertiesEl.textContent = stats.totalProperties;
    if (totalGuestsEl) totalGuestsEl.textContent = stats.totalGuests;
    if (revenueEl) revenueEl.textContent = `$${stats.totalRevenue}`;
    if (ratingEl) ratingEl.textContent = stats.rating.toFixed(1);
}

// Renderizar propiedades
function renderProperties(properties) {
    const propertiesGrid = document.getElementById('propertiesGrid');
    
    if (!propertiesGrid) return;
    
    if (!properties || properties.length === 0) {
        propertiesGrid.innerHTML = '<div class="loading-state">No hay propiedades registradas</div>';
        return;
    }
    
    propertiesGrid.innerHTML = properties.map(property => `
        <div class="property-card" data-id="${property.id}">
            <img src="${property.image}" alt="${property.title}" class="property-image">
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <p class="property-location">📍 ${property.location}</p>
                <p class="property-price">$${property.price} / noche</p>
                <span class="property-status ${property.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${property.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
                <div class="property-actions">
                    <button class="btn-edit" onclick="window.editProperty(${property.id})">Editar</button>
                    <button class="btn-delete" onclick="window.deleteProperty(${property.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Renderizar reservaciones
function renderReservations(reservations) {
    const tableBody = document.getElementById('reservationsTableBody');
    
    if (!tableBody) return;
    
    if (!reservations || reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="loading-state">No hay reservaciones recientes</td></tr>';
        return;
    }
    
    tableBody.innerHTML = reservations.map(reservation => `
        <tr>
            <td>${reservation.guest}</td>
            <td>${reservation.property}</td>
            <td>${formatDate(reservation.checkIn)} - ${formatDate(reservation.checkOut)}</td>
            <td>
                <span class="status-badge status-${reservation.status}">
                    ${getStatusText(reservation.status)}
                </span>
            </td>
            <td>$${reservation.amount}</td>
        </tr>
    `).join('');
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

// Obtener texto del estado
function getStatusText(status) {
    const statusMap = {
        'confirmed': 'Confirmada',
        'pending': 'Pendiente',
        'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
}

// Función para editar propiedad (ejemplo)
window.editProperty = function(propertyId) {
    console.log('Editar propiedad:', propertyId);
    alert(`Editar propiedad ${propertyId} - Funcionalidad en desarrollo`);
};

// Función para eliminar propiedad (ejemplo)
window.deleteProperty = function(propertyId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
        console.log('Eliminar propiedad:', propertyId);
        alert(`Propiedad ${propertyId} eliminada (simulación)`);
        // Aquí iría la lógica real de eliminación
        location.reload(); // Recargar para simular actualización
    }
};

// Función para agregar nueva propiedad
function addProperty() {
    alert('Agregar nueva propiedad - Funcionalidad en desarrollo');
    console.log('Abrir modal para agregar propiedad');
}

// Función para cargar estilos específicos del host
function loadHostStyles() {
    // Verificar si el CSS ya está cargado
    if (!document.querySelector('link[href*="homeHost.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/homeHost.css';
        document.head.appendChild(link);
    }
}

// Inicializar el dashboard
function initDashboard() {
    // Mostrar nombre del host
    const hostNameEl = document.getElementById('hostName');
    if (hostNameEl) {
        hostNameEl.textContent = mockData.host.name;
    }
    
    // Actualizar estadísticas
    updateStats(mockData.properties, mockData.reservations);
    
    // Renderizar propiedades
    renderProperties(mockData.properties);
    
    // Renderizar reservaciones
    renderReservations(mockData.reservations);
    
    // Configurar event listeners
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    if (addPropertyBtn) {
        addPropertyBtn.addEventListener('click', addProperty);
    }
}

// Cargar datos desde API (ejemplo)
async function loadDataFromAPI() {
    try {
        // Simular carga de API
        console.log('Cargando datos desde API...');
        
        // Aquí irían las llamadas reales a la API
        // const response = await fetch('/api/host/dashboard');
        // const data = await response.json();
        // return data;
        
        // Por ahora usamos mockData
        return mockData;
    } catch (error) {
        console.error('Error al cargar datos:', error);
        return null;
    }
}

// Función principal del controlador (la que llama el router)
export async function homeHostController() {
    console.log('Inicializando homeHostController...');
    
    // Cargar estilos específicos
    loadHostStyles();
    
    // Cargar datos (simulado)
    const data = await loadDataFromAPI();
    
    if (data) {
        // Inicializar el dashboard después de que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDashboard);
        } else {
            initDashboard();
        }
    } else {
        console.error('No se pudieron cargar los datos');
        const hostNameEl = document.getElementById('hostName');
        if (hostNameEl) {
            hostNameEl.textContent = 'Error al cargar';
        }
    }
}

// Exportar funciones para uso externo (si es necesario)
export { initDashboard, renderProperties, renderReservations, updateStats };