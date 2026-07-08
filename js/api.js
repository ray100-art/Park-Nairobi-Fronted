// ── Config (set window.__API_BASE__ in js/config.js or inline before this script) ──
const API_BASE = window.__API_BASE__ || 'http://localhost:8080';

// ── Auth helpers ───────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function getUser()  { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function saveUserFromResponse(data) {
    const user = data.user || {};
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
        fullName: user.fullName,
        email:    user.email,
        phone:    user.phone,
        role:     user.role,
        userId:   user.id
    }));
    return user;
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Fetch wrapper: auto-logout on 401 (expired / invalid token)
async function apiFetch(url, options) {
    const res = await fetch(url, options);
    if (res.status === 401) { logout(); return res; }
    return res;
}

// ── Auth ───────────────────────────────────────────────
async function apiRegister(fullName, email, phone, password) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password })
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

// ── Slots ────────────────────────────────────────────
async function apiGetSlots() {
    const res = await apiFetch(`${API_BASE}/api/slots`, { headers: authHeaders() });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiGetSummary() {
    const res = await fetch(`${API_BASE}/api/slots/summary`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

// ── Bookings ─────────────────────────────────────────
async function apiCreateBooking(slotId, vehiclePlate) {
    const res = await apiFetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slotId, vehiclePlate })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

async function apiGetMyBookings() {
    const res = await apiFetch(`${API_BASE}/api/bookings/my`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiCancelBooking(bookingId) {
    const res = await apiFetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

// ── M-Pesa ───────────────────────────────────────────
async function apiMpesaPay(bookingId, phone) {
    const res = await apiFetch(`${API_BASE}/api/mpesa/pay`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bookingId, phone })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

async function apiMpesaStatus(checkoutId) {
    const res = await apiFetch(`${API_BASE}/api/mpesa/status/${checkoutId}`, {
        headers: authHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

// ── Admin ────────────────────────────────────────────
async function apiGetAllUsers() {
    const res = await apiFetch(`${API_BASE}/api/admin/users`, { headers: authHeaders() });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiGetAllBookings() {
    const res = await apiFetch(`${API_BASE}/api/bookings/all`, { headers: authHeaders() });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiFreeSlot(slotId) {
    const res = await apiFetch(`${API_BASE}/api/slots/${slotId}/free`, {
        method: 'PUT',
        headers: authHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

// ── Sensor ───────────────────────────────────────────
async function apiSensorEntry(slotId) {
    const res = await apiFetch(`${API_BASE}/api/sensor/entry`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slotId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

async function apiSensorExit(slotId) {
    const res = await apiFetch(`${API_BASE}/api/sensor/exit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slotId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}

async function apiSensorStatus(slotId) {
    const res = await apiFetch(`${API_BASE}/api/sensor/status/${slotId}`, {
        headers: authHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
}
