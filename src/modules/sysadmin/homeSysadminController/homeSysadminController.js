export function homeSysadminController() {
    loadStyles();
    loadStats();
    loadRolesDistribution();
    loadRecentActivity();
    loadRecentEvents();
    setupEventListeners();
    checkAdminSession();
}

// Cargar estilos necesarios
function loadStyles() {
    const styles = [
        { href: '/src/css/components/homeSysadmin.css', id: 'home-sysadmin-style' }
    ];
    
    styles.forEach(style => {
        if (!document.querySelector(`link[href="${style.href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style.href;
            document.head.appendChild(link);
        }
    });
}

function loadStats() {
    const users = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    const events = JSON.parse(localStorage.getItem('eventos') || '[]');
    const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0);
    
    const lastMonthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return eventDate >= lastMonth;
    }).length;
    
    const previousMonthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return eventDate >= twoMonthsAgo && eventDate < lastMonth;
    }).length;
    
    const growthRate = previousMonthEvents === 0 ? 0 : Math.round(((lastMonthEvents - previousMonthEvents) / previousMonthEvents) * 100);
    
    const totalUsersEl = document.getElementById('totalUsers');
    const totalEventsEl = document.getElementById('totalEvents');
    const totalAttendeesEl = document.getElementById('totalAttendees');
    const growthRateEl = document.getElementById('growthRate');
    
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalEventsEl) totalEventsEl.textContent = events.length;
    if (totalAttendeesEl) totalAttendeesEl.textContent = totalAttendees;
    if (growthRateEl) growthRateEl.textContent = `${growthRate > 0 ? '+' : ''}${growthRate}%`;
}

function loadRolesDistribution() {
    const users = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    
    const sysadminCount = users.filter(u => u.role === 'sysadmin').length;
    const hostCount = users.filter(u => u.role === 'host').length;
    const visitorCount = users.filter(u => u.role === 'visitor').length;
    
    const sysadminEl = document.getElementById('sysadminCount');
    const hostEl = document.getElementById('hostCount');
    const visitorEl = document.getElementById('visitorCount');
    
    if (sysadminEl) sysadminEl.textContent = sysadminCount;
    if (hostEl) hostEl.textContent = hostCount;
    if (visitorEl) visitorEl.textContent = visitorCount;
}

function loadRecentActivity() {
    const logs = JSON.parse(localStorage.getItem('snaap_logs') || '[]');
    const recentLogs = logs.slice(-8).reverse();
    const container = document.getElementById('recentActivity');
    
    if (!container) return;
    
    if (recentLogs.length === 0) {
        container.innerHTML = '<div class="activity-item">No hay actividad reciente</div>';
        return;
    }
    
    container.innerHTML = recentLogs.map(log => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${getActivityIcon(log.type)}"></i>
            </div>
            <div class="activity-detail">
                <div class="activity-message">${escapeHtml(log.message || '')}</div>
                <div class="activity-time">${formatDate(log.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function loadRecentEvents() {
    const events = JSON.parse(localStorage.getItem('eventos') || '[]');
    const futureEvents = events
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    const container = document.getElementById('recentEvents');
    
    if (!container) return;
    
    if (futureEvents.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="loading">No hay eventos próximos</td></tr>';
        return;
    }
    
    container.innerHTML = futureEvents.map(event => `
        <tr>
            <td>${escapeHtml(event.title)}</td>
            <td>${new Date(event.date).toLocaleDateString()}</td>
            <td>${escapeHtml(event.location || 'No especificada')}</td>
            <td>${event.attendees || 0}</td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('snaap_current_user');
            window.location.href = '/';
        });
    }
}

function checkAdminSession() {
    const currentUser = JSON.parse(localStorage.getItem('snaap_current_user') || 'null');
    if (!currentUser || currentUser.role !== 'sysadmin') {
        alert('Acceso denegado: No tienes permisos de administrador');
        window.location.href = '/';
    }
}

function getActivityIcon(type) {
    const icons = {
        user_created: 'fa-user-plus',
        user_updated: 'fa-user-edit',
        user_deleted: 'fa-user-minus',
        event_created: 'fa-calendar-plus',
        event_updated: 'fa-calendar-alt',
        event_deleted: 'fa-calendar-minus',
        login: 'fa-sign-in-alt',
        logout: 'fa-sign-out-alt'
    };
    return icons[type] || 'fa-info-circle';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}