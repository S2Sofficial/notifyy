/**
 * Notifyy - Core Logic
 */

// Constants
const STORAGE_KEY = "opportunities";
const STORAGE_COMPANIES = "companies";
const ONE_HOUR = 3600000;
const ONE_DAY = 86400000;

// State
let opportunities = [];
let companies = [];
let audioCtx = null;

// DOM Elements
const form = document.getElementById('job-form');
const listActive = document.getElementById('list-active');
const listApplied = document.getElementById('list-applied');
const listExpired = document.getElementById('list-expired');
const btnNotify = document.getElementById('enable-notifications');

// --- Initialization ---

async function init() {
    loadData();
    loadCompanies();
    render();
    renderCompanies();
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('./service-worker.js');
            // Try Periodic Sync (Progressive Enhancement)
            if ('periodicSync' in reg) {
                const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
                if (status.state === 'granted') {
                    await reg.periodicSync.register('check-deadlines', { minInterval: ONE_HOUR });
                }
            }
        } catch (e) {
            console.error('SW Registration failed:', e);
        }
    }

    // Permission Button State
    if (Notification.permission === 'granted') {
        btnNotify.style.display = 'none';
    }

    // Start UI Loop
    requestAnimationFrame(uiLoop);

    // Initial Foreground Check
    checkNotifications();
}

function loadCompanies() {
    try {
        const raw = localStorage.getItem(STORAGE_COMPANIES);
        companies = raw ? JSON.parse(raw) : [];
    } catch (e) {
        companies = [];
    }
}

function saveCompanies() {
    try {
        localStorage.setItem(STORAGE_COMPANIES, JSON.stringify(companies));
    } catch (e) {}
}

function renderCompanies() {
    const container = document.getElementById('companies-list');
    if (!container) return;
    container.innerHTML = '';
    companies.forEach((c) => {
        const div = document.createElement('div');
        div.className = 'company-item item';
        const count = opportunities.filter(o => o.company === c).length;
        div.innerHTML = `
            <div class="item-header"><span class="company">${c}</span>
              <span class="role">${count} opp(s)</span></div>
            <div class="actions">
                <button class="btn-sm btn-primary" onclick="filterByCompany('${c}')">Show</button>
                <button class="btn-sm btn-ignore" onclick="removeCompany('${c}')">Remove</button>
            </div>`;
        container.appendChild(div);
    });
}

window.filterByCompany = (name) => {
    const filtered = opportunities.filter(o => o.company === name);
    // temporarily render filtered list in active column
    listActive.innerHTML = '';
    filtered.forEach(opp => listActive.appendChild(createItem(opp)));
};

window.removeCompany = (name) => {
    companies = companies.filter(c => c !== name);
    saveCompanies();
    renderCompanies();
};

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    opportunities = raw ? JSON.parse(raw) : [];
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
}

// --- Logic & Escallation ---

function getUrgencyLevel(msRemaining) {
    const days = msRemaining / ONE_DAY;
    if (days > 7) return 'green';
    if (days > 3) return 'orange';
    return 'red';
}

function shouldNotify(opp, now) {
    if (opp.status !== 'pending') return false;
    
    const remaining = opp.deadline - now;
    if (remaining <= 0) return false; // Expired, handled by UI

    const daysRemaining = remaining / ONE_DAY;
    const timeSinceLast = now - opp.lastNotifiedAt;
    
    let requiredInterval;

    if (daysRemaining > 15) requiredInterval = 3 * ONE_DAY;
    else if (daysRemaining > 7) requiredInterval = ONE_DAY;
    else if (daysRemaining > 3) requiredInterval = 12 * ONE_HOUR;
    else if (daysRemaining > 1) requiredInterval = 4 * ONE_HOUR;
    else requiredInterval = ONE_HOUR;

    return timeSinceLast >= requiredInterval;
}

// --- Notifications ---

btnNotify.addEventListener('click', async () => {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        btnNotify.style.display = 'none';
        new Notification("Notifyy", { body: "Notifications enabled." });
        checkNotifications();
    }
});

function playSound() {
    // Simple beep using Web Audio API to avoid external assets
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
}

function triggerNotification(opp) {
    if (Notification.permission !== 'granted') return;

    const remainingHours = ((opp.deadline - Date.now()) / ONE_HOUR).toFixed(1);
    
    // Fire Notification
    new Notification(`Deadline: ${opp.company}`, {
        body: `${opp.role} due in ${remainingHours} hours.`,
        icon: './icons/icon-192.png',
        tag: opp.id,
        requireInteraction: true,
        vibrate: [200, 100, 200]
    });

    // Foreground Sound
    if (document.visibilityState === 'visible') {
        playSound();
    }

    // Update State
    opp.lastNotifiedAt = Date.now();
    saveData();
}

function checkNotifications() {
    const now = Date.now();
    opportunities.forEach(opp => {
        if (shouldNotify(opp, now)) {
            triggerNotification(opp);
        }
    });
}

// --- UI & Rendering ---

function formatTime(ms) {
    if (ms < 0) return "EXPIRED";
    const d = Math.floor(ms / ONE_DAY);
    const h = Math.floor((ms % ONE_DAY) / ONE_HOUR);
    const m = Math.floor((ms % ONE_HOUR) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${d}d ${h}h ${m}m ${s}s`;
}

function createItem(opp) {
    const div = document.createElement('div');
    const now = Date.now();
    const remaining = opp.deadline - now;
    
    let urgencyClass = '';
    if (opp.status === 'pending') {
        if (remaining < 0) urgencyClass = 'status-expired';
        else urgencyClass = 'urgency-' + getUrgencyLevel(remaining);
    } else if (opp.status === 'applied') {
        urgencyClass = 'status-applied';
    } else {
        urgencyClass = 'status-expired';
    }

    div.className = `item ${urgencyClass}`;
    
    const linkHtml = opp.link ? `<div><a href="${opp.link}" target="_blank" style="color:var(--primary)">Link</a></div>` : '';
    div.innerHTML = `
        <div class="item-header">
            <span class="company">${opp.company}</span>
            <span class="role">${opp.role}</span>
        </div>
        ${linkHtml}
        <div class="countdown" id="timer-${opp.id}">Loading...</div>
        <div class="actions">
            ${opp.status === 'pending' ? `
                <button class="btn-sm btn-apply" onclick="updateStatus('${opp.id}', 'applied')">Applied</button>
                <button class="btn-sm btn-ignore" onclick="updateStatus('${opp.id}', 'ignored')">Ignore</button>
            ` : `<button class="btn-sm btn-ignore" onclick="deleteOpp('${opp.id}')">Delete</button>`}
        </div>
    `;
    return div;
}

function render() {
    listActive.innerHTML = '';
    listApplied.innerHTML = '';
    listExpired.innerHTML = '';

    const now = Date.now();

    // Sort active by nearest deadline
    const sorted = [...opportunities].sort((a, b) => a.deadline - b.deadline);

    sorted.forEach(opp => {
        const remaining = opp.deadline - now;
        
        if (opp.status === 'applied') {
            listApplied.appendChild(createItem(opp));
        } else if (opp.status === 'ignored') {
            listExpired.appendChild(createItem(opp));
        } else if (remaining < 0) {
            listExpired.appendChild(createItem(opp));
        } else {
            listActive.appendChild(createItem(opp));
        }
    });
}

function uiLoop() {
    const now = Date.now();
    opportunities.forEach(opp => {
        const el = document.getElementById(`timer-${opp.id}`);
        if (el) {
            el.textContent = formatTime(opp.deadline - now);
        }
    });
    
    // Check notifications periodically in foreground (every minute)
    if (Math.floor(now / 1000) % 60 === 0) {
        checkNotifications();
    }

    requestAnimationFrame(uiLoop);
}

// --- User Actions ---

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newOpp = {
        id: crypto.randomUUID(),
        company: document.getElementById('company').value,
        role: document.getElementById('role').value,
        link: document.getElementById('link').value || '',
        // deadline is date-only (YYYY-MM-DD). Parse as local midnight.
        deadline: (function(d){
            const val = document.getElementById('deadline').value;
            if (!val) return Date.now();
            const parts = val.split('-');
            const dt = new Date(parts[0], parts[1]-1, parts[2], 23, 59, 59);
            return dt.getTime();
        })(),
        status: 'pending',
        createdAt: Date.now(),
        lastNotifiedAt: 0
    };
    
    opportunities.push(newOpp);
    saveData();
    render();
    form.reset();
});

// Company form
const companyForm = document.getElementById('company-form');
if (companyForm) {
    companyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('company-name');
        const name = input.value.trim();
        if (!name) return;
        if (!companies.includes(name)) companies.push(name);
        saveCompanies();
        renderCompanies();
        input.value = '';
    });
}

window.updateStatus = (id, status) => {
    const idx = opportunities.findIndex(o => o.id === id);
    if (idx !== -1) {
        opportunities[idx].status = status;
        saveData();
        render();
    }
};

window.deleteOpp = (id) => {
    opportunities = opportunities.filter(o => o.id !== id);
    saveData();
    render();
};

// Start
init();
