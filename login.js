// Hardcoded users
const users = {
    "player": { password: "123", balance: 100000, isAdmin: false },
    "player2": { password: "123", balance: 100000, isAdmin: false },
    "admin": { password: "admin", isAdmin: true }
};

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!users[username] || users[username].password !== password) {
        loginMessage.textContent = 'Invalid username or password!';
        return;
    }
    // Save login state
    localStorage.setItem('slot_currentUser', username);
    localStorage.setItem('slot_isAdmin', users[username].isAdmin ? '1' : '0');
    // Save balance if not exists
    if (!localStorage.getItem('slot_balance_' + username) && !users[username].isAdmin) {
        localStorage.setItem('slot_balance_' + username, users[username].balance);
    }
    // Redirect
    if (users[username].isAdmin) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'home.html';
    }
}); 