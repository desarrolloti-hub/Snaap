const packagesDetails = {
    basico: {
        nombre: "Paquete Básico",
        precio: "$999 MXN",
        caracteristicas: [
            "Hasta 50 invitados",
            "Galería de fotos básica",
            "Música ambiental",
            "Soporte por email",
            "Duración: 4 horas"
        ]
    },
    estandar: {
        nombre: "Paquete Estándar",
        precio: "$1,999 MXN",
        caracteristicas: [
            "Hasta 150 invitados",
            "Galería de fotos premium",
            "Música en vivo (1 hora)",
            "Soporte prioritario",
            "Duración: 6 horas",
            "Video streaming básico"
        ]
    },
    premium: {
        nombre: "Paquete Premium",
        precio: "$3,499 MXN",
        caracteristicas: [
            "Hasta 300 invitados",
            "Galería de fotos + video",
            "Música en vivo (2 horas)",
            "Soporte 24/7",
            "Duración: 8 horas",
            "Video streaming HD",
            "Fotógrafo profesional"
        ]
    },
    empresarial: {
        nombre: "Paquete Empresarial",
        precio: "$5,999 MXN",
        caracteristicas: [
            "Invitados ilimitados",
            "Cobertura multimedia completa",
            "Banda en vivo",
            "Soporte dedicado",
            "Duración: 12 horas",
            "Video streaming 4K",
            "Equipo completo de producción",
            "Marca personalizada"
        ]
    }
};

export function initCreateEvent() {
    const form = document.getElementById('createEventForm');
    const packageSelect = document.getElementById('packageSelect');
    const packageDetailsDiv = document.getElementById('packageDetails');
    const packageInfo = document.getElementById('packageInfo');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (!form) return;
    
    packageSelect.addEventListener('change', function() {
        const selectedPackage = this.value;
        
        if (selectedPackage && packagesDetails[selectedPackage]) {
            const details = packagesDetails[selectedPackage];
            
            let html = `
                <p><strong>📦 ${details.nombre}</strong></p>
                <p><strong>💰 Precio:</strong> ${details.precio}</p>
                <div>
                    <strong>✨ Características incluidas:</strong>
                    <ul>
            `;
            
            details.caracteristicas.forEach(feature => {
                html += `<li>✓ ${feature}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
            
            packageInfo.innerHTML = html;
            packageDetailsDiv.classList.remove('hidden');
        } else {
            packageDetailsDiv.classList.add('hidden');
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('eventName').value.trim();
        const selectedPackage = packageSelect.value;
        
        if (!eventName) {
            alert('Por favor, ingresa el nombre del evento');
            return;
        }
        
        if (!selectedPackage) {
            alert('Por favor, selecciona un paquete');
            return;
        }
        
        const eventData = {
            id: 'EVENT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: eventName,
            package: selectedPackage,
            packageDetails: packagesDetails[selectedPackage],
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        let events = JSON.parse(localStorage.getItem('snaap_events') || '[]');
        events.push(eventData);
        localStorage.setItem('snaap_events', JSON.stringify(events));
        localStorage.setItem('snaap_current_event', JSON.stringify(eventData));
        
        alert(`¡Evento "${eventName}" creado exitosamente!`);
        
        form.reset();
        packageDetailsDiv.classList.add('hidden');
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.')) {
                form.reset();
                packageDetailsDiv.classList.add('hidden');
            }
        });
    }
}

export default { initCreateEvent };