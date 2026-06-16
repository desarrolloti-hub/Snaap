const packagesDetails = {
    basico: {
        nombre: "Paquete Básico",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 50 invitados",
            "Capacidad de almacenamiento para 200 fotos",
            "Solo puedes subir fotos, dibujos y notas",
            "Duración: 24 horas después del evento",
        ]
    },
    estandar: {
        nombre: "Paquete Estándar",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 100 invitados",
            "Galería de fotos premium",
            "Música en vivo (1 hora)",
            "Soporte prioritario",
            "Duración: 48 horas después del evento",
            "Video streaming básico"
        ]
    },
    premium: {
        nombre: "Paquete Premium",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 150 invitados",
            "Galería de fotos + video",
            "Música en vivo (2 horas)",
            "Soporte 24/7",
            "Duración: 72 horas después del evento",
            "Video streaming HD",
            "Fotógrafo profesional"
        ]
    },
    empresarial: {
        nombre: "Paquete Empresarial",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 200 invitados",
            "Cobertura multimedia completa",
            "Soporte dedicado",
            "Duración: 7 días después del evento",
            "Streaming 4K",
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
            Swal.fire({
                title: 'Campo Requerido',
                text: 'Por favor, ingresa el nombre del evento',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (!selectedPackage) {
            Swal.fire({
                title: 'Campo Requerido',
                text: 'Por favor, selecciona un paquete',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
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
        
        Swal.fire({
            title: '¡Éxito!',
            text: `¡Evento "${eventName}" creado exitosamente!`,
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            form.reset();
            packageDetailsDiv.classList.add('hidden');
        });
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            Swal.fire({
                title: '¿Cancelar creación?',
                text: '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ff007a',
                cancelButtonColor: '#4db8ff',
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    form.reset();
                    packageDetailsDiv.classList.add('hidden');
                }
            });
        });
    }
}

export default { initCreateEvent };