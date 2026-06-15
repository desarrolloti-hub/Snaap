export function homeSysadminController() {
    loadStats();
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('snaap_current_user');
        window.location.href = '/';
    });
    
    checkAdminSession();
}

function loadStats() {
    const users = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    const events = JSON.parse(localStorage.getItem('eventos') || '[]');
    const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0);
    
    const totalUsersEl = document.getElementById('totalUsers');
    const totalEventsEl = document.getElementById('totalEvents');
    const totalAttendeesEl = document.getElementById('totalAttendees');
    
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalEventsEl) totalEventsEl.textContent = events.length;
    if (totalAttendeesEl) totalAttendeesEl.textContent = totalAttendees;
}

function checkAdminSession() {
    const currentUser = JSON.parse(localStorage.getItem('snaap_current_user') || 'null');
    if (!currentUser || currentUser.role !== 'sysadmin') {
        alert('Acceso denegado: No tienes permisos de administrador');
        window.location.href = '/';
    }
}