// --- Cek login ---
const username = localStorage.getItem('slot_currentUser');
const isAdmin = localStorage.getItem('slot_isAdmin') === '1';
if (!username || !isAdmin) {
    window.location.href = 'login.html';
}

// --- DOM ---
const adminOverrideForm = document.getElementById('admin-override-form');
const overrideUsernameInput = document.getElementById('override-username');
const forceResultSelect = document.getElementById('force-result');
const setOverrideBtn = document.getElementById('set-override-btn');
const clearOverrideBtn = document.getElementById('clear-override-btn');
const overrideStatus = document.getElementById('override-status');
const adminLogoutBtn = document.getElementById('admin-logout-btn');

setOverrideBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const target = overrideUsernameInput.value.trim();
    const forceResult = forceResultSelect.value;
    if (!target || target === username) {
        overrideStatus.textContent = 'Invalid target username!';
        return;
    }
    // Simpan override di localStorage
    localStorage.setItem('slot_adminOverride', JSON.stringify({
        targetUser: target,
        forceResult: forceResult
    }));
    updateOverrideStatus();
    overrideStatus.textContent = `Override set for Player ${target}: ${forceResult.charAt(0).toUpperCase() + forceResult.slice(1)}`;
});

clearOverrideBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.setItem('slot_adminOverride', '{}');
    updateOverrideStatus();
    overrideStatus.textContent = 'Override cleared.';
});

function updateOverrideStatus() {
    let override = JSON.parse(localStorage.getItem('slot_adminOverride') || '{}');
    if (override.targetUser && override.forceResult && override.forceResult !== 'random') {
        overrideStatus.textContent = `Override set for Player ${override.targetUser}: ${override.forceResult.charAt(0).toUpperCase() + override.forceResult.slice(1)}`;
    } else {
        overrideStatus.textContent = '';
    }
}

adminLogoutBtn.addEventListener('click', function() {
    localStorage.removeItem('slot_currentUser');
    localStorage.removeItem('slot_isAdmin');
    window.location.href = 'login.html';
});

// --- Init ---
updateOverrideStatus(); 