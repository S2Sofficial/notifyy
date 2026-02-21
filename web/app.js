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
const btnExport = document.getElementById('export-data');
const btnImport = document.getElementById('import-data');
const inputImportFile = document.getElementById('import-data-file');

// --- Initialization ---

async function init() {
    loadData();
    loadCompanies();
    render();
    renderCompanies();
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('./service-worker.js?v=20260221-2');
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
        const parsed = raw ? JSON.parse(raw) : [];
        companies = Array.isArray(parsed)
            ? parsed.map(normalizeCompanyEntry).filter(Boolean)
            : [];
    } catch (e) {
        companies = [];
    }
}

function normalizeCompanyEntry(entry) {
    if (typeof entry === 'string') {
        return {
            name: entry,
            link: '',
            createdAt: 0
        };
    }

    if (entry && typeof entry === 'object' && typeof entry.name === 'string') {
        return {
            name: entry.name,
            link: typeof entry.link === 'string' ? entry.link : '',
            createdAt: Number(entry.createdAt) || 0
        };
    }

    return null;
}

function companyUrl(link) {
    const trimmed = (link || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
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

    const sorted = [...companies].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    sorted.forEach((company) => {
        const div = document.createElement('div');
        div.className = 'company-item item';

        const header = document.createElement('div');
        header.className = 'item-header';

        const nameEl = document.createElement('span');
        nameEl.className = 'company';
        nameEl.textContent = company.name;
        header.appendChild(nameEl);

        div.appendChild(header);

        if (company.link) {
            const linkEl = document.createElement('div');
            linkEl.className = 'company-link';
            linkEl.textContent = companyUrl(company.link);
            div.appendChild(linkEl);
        }

        const actions = document.createElement('div');
        actions.className = 'actions';

        const openBtn = document.createElement('button');
        openBtn.className = 'btn-sm btn-primary';
        openBtn.textContent = 'Open';
        if (company.link) {
            openBtn.addEventListener('click', () => {
                window.open(companyUrl(company.link), '_blank', 'noopener,noreferrer');
            });
        } else {
            openBtn.disabled = true;
            openBtn.title = 'No company page set';
            openBtn.style.opacity = '0.5';
            openBtn.style.cursor = 'not-allowed';
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-sm btn-ignore';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeCompany(company.name));

        actions.appendChild(openBtn);
        actions.appendChild(removeBtn);
        div.appendChild(actions);

        container.appendChild(div);
    });
}

window.removeCompany = (name) => {
    companies = companies.filter(c => c.name !== name);
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

if (btnExport) {
    btnExport.addEventListener('click', () => {
        const backup = {
            app: 'Notifyy',
            version: '2.1',
            exportedAt: new Date().toISOString(),
            opportunities,
            companies
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');

        anchor.href = url;
        anchor.download = `notifyy-backup-${stamp}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    });
}

function normalizeOpportunityEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    if (typeof entry.company !== 'string') return null;
    if (!Number.isFinite(Number(entry.deadline))) return null;

    const cleanStatus = ['pending', 'applied', 'ignored'].includes(entry.status)
        ? entry.status
        : 'pending';

    return {
        id: typeof entry.id === 'string' && entry.id ? entry.id : crypto.randomUUID(),
        company: entry.company,
        role: typeof entry.role === 'string' ? entry.role : '',
        link: typeof entry.link === 'string' ? entry.link : '',
        deadline: Number(entry.deadline),
        status: cleanStatus,
        createdAt: Number(entry.createdAt) || Date.now(),
        lastNotifiedAt: Number(entry.lastNotifiedAt) || 0
    };
}

function importBackupFromText(jsonText) {
    const payload = JSON.parse(jsonText);

    const importedOppsRaw = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload.opportunities) ? payload.opportunities : []);

    const importedCompaniesRaw = Array.isArray(payload.companies)
        ? payload.companies
        : [];

    const normalizedOpps = importedOppsRaw.map(normalizeOpportunityEntry).filter(Boolean);
    const normalizedCompanies = importedCompaniesRaw.map(normalizeCompanyEntry).filter(Boolean);

    opportunities = normalizedOpps;
    companies = normalizedCompanies;
    saveData();
    saveCompanies();
    render();
    renderCompanies();
}

if (btnImport && inputImportFile) {
    btnImport.addEventListener('click', () => inputImportFile.click());

    inputImportFile.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            importBackupFromText(text);
            alert('Import complete. Opportunities and watchlist restored.');
        } catch (error) {
            alert('Import failed. Please choose a valid Notifyy backup JSON file.');
            console.error('Import error:', error);
        } finally {
            inputImportFile.value = '';
        }
    });
}

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
        icon: './icons/web-app-manifest-192x192.png',
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
    const roleText = opp.role && opp.role.trim() ? opp.role : 'ROLE NOT SET';
    div.innerHTML = `
        <div class="item-header">
            <span class="company">${opp.company}</span>
            <span class="role">${roleText}</span>
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
    const company = document.getElementById('company').value.trim();
    const role = document.getElementById('role').value.trim();
    const link = document.getElementById('link').value.trim();
    if (!company) return;

    const newOpp = {
        id: crypto.randomUUID(),
        company,
        role,
        link,
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
        const nameInput = document.getElementById('company-name');
        const linkInput = document.getElementById('company-link');
        const name = nameInput.value.trim();
        const link = linkInput.value.trim();
        if (!name) return;

        const existing = companies.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            if (link) existing.link = link;
        } else {
            companies.push({
                name,
                link,
                createdAt: Date.now()
            });
        }

        saveCompanies();
        renderCompanies();
        nameInput.value = '';
        linkInput.value = '';
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
