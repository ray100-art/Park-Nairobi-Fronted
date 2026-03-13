// ── Config ─────────────────────────────────────
const API_BASE = 'http://localhost:8080';

// ── Auth helpers ───────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function getUser()  { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

// ── Auth ───────────────────────────────────────
async function apiRegister(fullName, email, phone, password) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, role: 'DRIVER' })
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'HTTP ' + res.status); }
    return res.json();
}

async function apiLogin(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'HTTP ' + res.status); }
    return res.json();
}

// ── Slots ──────────────────────────────────────
async function apiGetSlots() {
    const res = await fetch(`${API_BASE}/api/slots`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiGetSummary() {
    const res = await fetch(`${API_BASE}/api/slots/summary`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

// ── Bookings ───────────────────────────────────
async function apiCreateBooking(slotId, vehiclePlate) {
    const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slotId, vehiclePlate })
    });
    return res.json();
}

async function apiGetMyBookings() {
    const res = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiCancelBooking(bookingId) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return res.json();
}

// ── Admin ──────────────────────────────────────
async function apiGetAllUsers() {
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders() });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiGetAllBookings() {
    const res = await fetch(`${API_BASE}/api/bookings/all`, { headers: authHeaders() });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiFreeSlot(slotId) {
    const res = await fetch(`${API_BASE}/api/slots/${slotId}/free`, {
        method: 'PUT',
        headers: authHeaders()
    });
    return res.json();
}

// ── Sensor ─────────────────────────────────────
async function apiSensorEntry(slotId) {
    const res = await fetch(`${API_BASE}/api/sensor/entry`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slotId })
    });
    return res.json();
}

async function apiSensorExit(slotId) {
    const res = await fetch(`${API_BASE}/api/sensor/exit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slotId })
    });
    return res.json();
}

async function apiSensorStatus(slotId) {
    const res = await fetch(`${API_BASE}/api/sensor/status/${slotId}`, {
        headers: authHeaders()
    });
    return res.json();
}