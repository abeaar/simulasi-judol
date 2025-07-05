// --- Hardcoded Data ---
const users = {
    "player1": { password: "123", balance: 1000, isAdmin: false },
    "admin01": { password: "admin", isAdmin: true }
};

const symbols = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎"];
const paytable = {
    "💎💎💎": 500,
    "⭐⭐⭐": 200,
    "🔔🔔🔔": 100,
    "🍊🍊🍊": 50,
    "🍋🍋🍋": 25,
    "🍒🍒🍒": 10
};
let adminOverride = {
    targetUser: null, // Username for which the override is set
    forceResult: "random" // "win", "lose", "jackpot", or "random"
};

// --- State ---
let currentUser = null;
let currentUsername = null;

// --- DOM Elements ---
const loginSection = document.getElementById('login-section');
const gameSection = document.getElementById('game-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');
const userBalance = document.getElementById('user-balance');
const betAmountInput = document.getElementById('bet-amount');
const spinBtn = document.getElementById('spin-btn');
const slotReels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const gameMessage = document.getElementById('game-message');
const logoutBtn = document.getElementById('logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminOverrideForm = document.getElementById('admin-override-form');
const overrideUsernameInput = document.getElementById('override-username');
const forceResultSelect = document.getElementById('force-result');
const setOverrideBtn = document.getElementById('set-override-btn');
const clearOverrideBtn = document.getElementById('clear-override-btn');
const overrideStatus = document.getElementById('override-status');

// --- Utility Functions ---
function showSection(section) {
    loginSection.classList.remove('active');
    gameSection.classList.remove('active');
    adminSection.classList.remove('active');
    section.classList.add('active');
}

function updateBalanceDisplay() {
    if (currentUser && typeof currentUser.balance === 'number') {
        userBalance.textContent = `Balance: $${currentUser.balance}`;
    }
}

function resetGameUI() {
    slotReels.forEach(reel => reel.innerHTML = '<span>?</span>');
    gameMessage.textContent = '';
    betAmountInput.value = 10;
}

function resetLoginForm() {
    loginForm.reset();
    loginMessage.textContent = '';
}

function resetAdminPanel() {
    adminOverrideForm.reset();
    overrideStatus.textContent = '';
}

// --- Login Logic ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!users[username] || users[username].password !== password) {
        loginMessage.textContent = 'Invalid username or password!';
        return;
    }
    currentUser = users[username];
    currentUsername = username;
    resetLoginForm();
    if (currentUser.isAdmin) {
        showSection(adminSection);
        resetAdminPanel();
    } else {
        showSection(gameSection);
        updateBalanceDisplay();
        resetGameUI();
    }
});

// --- Logout Logic ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        currentUsername = null;
        showSection(loginSection);
        resetLoginForm();
        resetGameUI();
    });
}
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', function() {
        currentUser = null;
        currentUsername = null;
        showSection(loginSection);
        resetLoginForm();
        resetAdminPanel();
    });
}

// --- Game Logic ---
if (spinBtn) {
    spinBtn.addEventListener('click', spinReels);
}

function spinReels() {
    if (!currentUser) return;
    let bet = parseInt(betAmountInput.value, 10);
    if (isNaN(bet) || bet < 1) {
        gameMessage.textContent = 'Invalid bet amount!';
        return;
    }
    if (currentUser.balance < bet) {
        gameMessage.textContent = 'Insufficient balance!';
        return;
    }
    // Deduct bet
    currentUser.balance -= bet;
    updateBalanceDisplay();

    // Determine result (check admin override first)
    let resultSymbols;
    if (
        adminOverride.targetUser === currentUsername &&
        adminOverride.forceResult !== 'random'
    ) {
        if (adminOverride.forceResult === 'win') {
            resultSymbols = generateForcedWin();
        } else if (adminOverride.forceResult === 'lose') {
            resultSymbols = generateForcedLoss();
        } else if (adminOverride.forceResult === 'jackpot') {
            resultSymbols = generateForcedJackpot();
        } else {
            resultSymbols = generateRandomSpin();
        }
        // Reset override after use
        adminOverride.targetUser = null;
        adminOverride.forceResult = 'random';
        updateOverrideStatus();
    } else {
        resultSymbols = generateRandomSpin();
    }

    // Display reels
    for (let i = 0; i < 3; i++) {
        slotReels[i].innerHTML = `<span>${resultSymbols[i]}</span>`;
    }

    // Check win/lose
    const resultKey = resultSymbols.join('');
    if (paytable[resultKey]) {
        let winAmount = paytable[resultKey] * bet;
        currentUser.balance += winAmount;
        updateBalanceDisplay();
        if (resultKey === '💎💎💎') {
            gameMessage.textContent = `Jackpot! You won $${winAmount}!`;
        } else {
            gameMessage.textContent = `You Won $${winAmount}!`;
        }
    } else {
        gameMessage.textContent = 'You Lost!';
    }
}

function generateRandomSpin() {
    return [0, 0, 0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
}

function generateForcedWin() {
    // Pick a random winning combination (not jackpot)
    const nonJackpotWins = Object.keys(paytable).filter(k => k !== '💎💎💎');
    const winKey = nonJackpotWins[Math.floor(Math.random() * nonJackpotWins.length)];
    return winKey.split('');
}

function generateForcedLoss() {
    // Generate a non-winning combination
    let result;
    do {
        result = generateRandomSpin();
    } while (paytable[result.join('')]);
    return result;
}

function generateForcedJackpot() {
    return ['💎', '💎', '💎'];
}

// --- Admin Panel Logic ---
if (setOverrideBtn) {
    setOverrideBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const target = overrideUsernameInput.value.trim();
        const forceResult = forceResultSelect.value;
        if (!target || !users[target] || users[target].isAdmin) {
            overrideStatus.textContent = 'Invalid target username!';
            return;
        }
        adminOverride.targetUser = target;
        adminOverride.forceResult = forceResult;
        updateOverrideStatus();
        overrideStatus.textContent = `Override set for Player ${target}: ${forceResult.charAt(0).toUpperCase() + forceResult.slice(1)}`;
    });
}
if (clearOverrideBtn) {
    clearOverrideBtn.addEventListener('click', function(e) {
        e.preventDefault();
        adminOverride.targetUser = null;
        adminOverride.forceResult = 'random';
        updateOverrideStatus();
        overrideStatus.textContent = 'Override cleared.';
    });
}

function updateOverrideStatus() {
    if (adminOverride.targetUser && adminOverride.forceResult !== 'random') {
        overrideStatus.textContent = `Override set for Player ${adminOverride.targetUser}: ${adminOverride.forceResult.charAt(0).toUpperCase() + adminOverride.forceResult.slice(1)}`;
    } else {
        overrideStatus.textContent = '';
    }
}

// --- Initial State ---
showSection(loginSection);
resetLoginForm();
resetGameUI();
resetAdminPanel(); 