// --- Cek login ---
const username = localStorage.getItem('slot_currentUser');
const isAdmin = localStorage.getItem('slot_isAdmin') === '1';
if (!username || isAdmin) {
    window.location.href = 'login.html';
}

// --- Data ---
const symbols = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎"];
const paytable = {
    "💎💎💎💎💎💎": 500,
    "⭐⭐⭐⭐⭐⭐": 200,
    "🔔🔔🔔🔔🔔🔔": 100,
    "🍊🍊🍊🍊🍊🍊": 50,
    "🍋🍋🍋🍋🍋🍋": 25,
    "🍒🍒🍒🍒🍒🍒": 10
};

// --- DOM ---
const userBalance = document.getElementById('user-balance');
const betAmountInput = document.getElementById('bet-amount');
const spinBtn = document.getElementById('spin-btn');
const slotReels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3'),
    document.getElementById('reel-4'),
    document.getElementById('reel-5'),
    document.getElementById('reel-6'),
];
const gameMessage = document.getElementById('game-message');
const logoutBtn = document.getElementById('logout-btn');

function getBalance() {
    return parseInt(localStorage.getItem('slot_balance_' + username) || '0', 10);
}
function setBalance(val) {
    localStorage.setItem('slot_balance_' + username, val);
}
function updateBalanceDisplay() {
    userBalance.textContent = `SIsah uang Rp. ${getBalance()}`;
}
function resetGameUI() {
    slotReels.forEach(reel => reel.innerHTML = '<span>?</span>');

    gameMessage.textContent = '';
    betAmountInput.value = 1000;
}

logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('slot_currentUser');
    localStorage.removeItem('slot_isAdmin');
    window.location.href = 'login.html';
});

spinBtn.addEventListener('click', spinReels);

function spinReels() {
    let bet = parseInt(betAmountInput.value, 10);
    let balance = getBalance();
    if (isNaN(bet) || bet < 1) {
        gameMessage.textContent = 'Invalid bet amount!';
        return;
    }
    if (balance < bet) {
        gameMessage.textContent = 'Insufficient balance!';
        return;
    }
    // Deduct bet
    setBalance(balance - bet);
    updateBalanceDisplay();

    // --- Admin override logic ---
    let override = JSON.parse(localStorage.getItem('slot_adminOverride') || '{}');
    let resultSymbols;
    if (
        override.targetUser === username &&
        override.forceResult && override.forceResult !== 'random'
    ) {
        if (override.forceResult === 'win') {
            resultSymbols = generateForcedWin();
        } else if (override.forceResult === 'lose') {
            resultSymbols = generateForcedLoss();
        } else if (override.forceResult === 'jackpot') {
            resultSymbols = generateForcedJackpot();
        } else {
            resultSymbols = generateRandomSpin();
        }
        // Reset override after use
        localStorage.setItem('slot_adminOverride', '{}');
    } else {
        resultSymbols = generateRandomSpin();
    }

    // Display reels
    for (let i = 0; i < 6; i++) {
        slotReels[i].innerHTML = `<span>${resultSymbols[i]}</span>`;
    }

    // Check win/lose
    const resultKey = resultSymbols.join('');
    if (paytable[resultKey]) {
        let winAmount = paytable[resultKey] * bet;
        setBalance(getBalance() + winAmount);
        updateBalanceDisplay();
        if (resultKey === '💎💎💎💎💎💎') {
            gameMessage.textContent = `Jackpot! You won $${winAmount}!`;
        } else {
            gameMessage.textContent = `You Won $${winAmount}!`;
        }
    } else {
        gameMessage.textContent = 'You Lost!';
    }
}

function generateRandomSpin() {
    return [0, 0, 0, 0, 0, 0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
}
function generateForcedWin() {
    const nonJackpotWins = Object.keys(paytable).filter(k => k !== '💎💎💎💎💎💎');
    const winKey = nonJackpotWins[Math.floor(Math.random() * nonJackpotWins.length)];
    return winKey.split('');
}
function generateForcedLoss() {
    let result;
    do {
        result = generateRandomSpin();
    } while (paytable[result.join('')]);
    return result;
}
function generateForcedJackpot() {
    return ['💎', '💎', '💎','💎','💎','💎'];
}

// --- Init ---
updateBalanceDisplay();
resetGameUI(); 