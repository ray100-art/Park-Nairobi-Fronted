// ── State ─────────────────────────────────────
let map;
let markers       = [];
let allSlots      = [];
let selectedSlot  = null;
let userLat       = -1.2864;
let userLon       = 36.8172;

// ── Init on page load ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }
    if (user) {
        document.getElementById('welcomeUser').textContent =
            'Hi, ' + user.fullName;
    }
    initMap();
    getLocation();
});

// ── Init Leaflet map ──────────────────────────
function initMap() {
    map = L.map('map').setView([userLat, userLon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// ── Get driver GPS location ───────────────────
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                userLat = pos.coords.latitude;
                userLon = pos.coords.longitude;
                map.setView([userLat, userLon], 14);
                addDriverMarker();
                searchSlots();
            },
            () => {
                // Use Nairobi CBD as default
                addDriverMarker();
                searchSlots();
            }
        );
    } else {
        searchSlots();
    }
}

// ── Add driver location marker ────────────────
function addDriverMarker() {
    const icon = L.divIcon({
        html: '<div style="background:#ffc107;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>',
        iconSize: [16, 16],
        className: ''
    });
    L.marker([userLat, userLon], { icon })
     .addTo(map)
     .bindPopup('<b style="color:#ffc107">📍 Your Location</b>')
     .openPopup();
}

// ── Search nearest slots ──────────────────────
async function searchSlots() {
    const radius = document.getElementById('radiusInput').value || 5;
    document.getElementById('slotList').innerHTML = `
        <div class="text-center text-secondary py-3">
            <div class="spinner-border spinner-border-sm text-warning"></div>
            <span class="ms-2 small">Searching...</span>
        </div>`;

    try {
        allSlots = await apiGetSlots();
        const summary = await apiGetSummary();
        renderSummary(summary);
        renderSlots(allSlots);
        renderMapMarkers(allSlots);
    } catch (err) {
        document.getElementById('slotList').innerHTML =
            '<p class="text-danger small p-2">Failed to load slots</p>';
    }
}

// ── Render summary badges ─────────────────────
function renderSummary(summary) {
    const box = document.getElementById('slotSummary');
    box.innerHTML = `
        <div class="col-4 text-center">
            <div class="bg-success rounded p-2">
                <div class="fw-bold">${summary.FREE || 0}</div>
                <div class="small" style="font-size:0.7rem">FREE</div>
            </div>
        </div>
        <div class="col-4 text-center">
            <div class="bg-danger rounded p-2">
                <div class="fw-bold">${summary.OCCUPIED || 0}</div>
                <div class="small" style="font-size:0.7rem">OCCUPIED</div>
            </div>
        </div>
        <div class="col-4 text-center">
            <div class="bg-warning rounded p-2 text-dark">
                <div class="fw-bold">${summary.RESERVED || 0}</div>
                <div class="small" style="font-size:0.7rem">RESERVED</div>
            </div>
        </div>`;
}

// ── Render slot list ──────────────────────────
function renderSlots(slots) {
    const list = document.getElementById('slotList');
    if (!slots.length) {
        list.innerHTML = '<p class="text-secondary small text-center">No slots found</p>';
        return;
    }

    list.innerHTML = slots.map(slot => `
        <div class="slot-card ${slot.status !== 'FREE' ? 'occupied' : ''}"
             onclick="${slot.status === 'FREE' ? `openBookModal('${slot.slotId}')` : ''}">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold text-white small">${slot.slotId}</div>
                    <div class="text-secondary" style="font-size:0.75rem">${slot.parkingAreaName}</div>
                    <div class="text-secondary" style="font-size:0.72rem">
                        <i class="bi bi-layers me-1"></i>Floor ${slot.floor}
                    </div>
                </div>
                <span class="badge badge-${slot.status.toLowerCase()} text-white" style="font-size:0.7rem">
                    ${slot.status}
                </span>
            </div>
            ${slot.status === 'FREE' ? `
            <button class="btn btn-warning btn-sm w-100 mt-2 py-1"
                    style="font-size:0.75rem"
                    onclick="event.stopPropagation(); openBookModal('${slot.slotId}')">
                <i class="bi bi-p-square me-1"></i>Book
            </button>` : ''}
        </div>
    `).join('');
}

// ── Render map markers ────────────────────────
function renderMapMarkers(slots) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    slots.forEach(slot => {
        const color = slot.status === 'FREE'     ? '#198754' :
                      slot.status === 'OCCUPIED'  ? '#dc3545' : '#fd7e14';

        const icon = L.divIcon({
            html: `<div style="background:${color};color:white;padding:3px 7px;border-radius:6px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${slot.slotId}</div>`,
            className: '',
            iconAnchor: [20, 10]
        });

        const marker = L.marker([slot.latitude, slot.longitude], { icon })
            .addTo(map)
            .bindPopup(`
                <div style="min-width:150px">
                    <b style="color:#ffc107">${slot.slotId}</b><br>
                    <span style="color:#aaa;font-size:12px">${slot.parkingAreaName}</span><br>
                    <span style="color:#aaa;font-size:12px">Floor ${slot.floor}</span><br>
                    <span style="color:${color};font-weight:bold">${slot.status}</span>
                    ${slot.status === 'FREE' ? `<br><button onclick="openBookModal('${slot.slotId}')"
                        style="margin-top:8px;background:#ffc107;border:none;padding:4px 12px;border-radius:4px;font-weight:bold;cursor:pointer;width:100%">
                        Book Now</button>` : ''}
                </div>
            `);
        markers.push(marker);
    });
}

// ── Open booking modal ────────────────────────
function openBookModal(slotId) {
    selectedSlot = slotId;
    document.getElementById('modalSlotId').textContent = slotId;
    document.getElementById('vehiclePlate').value = '';
    document.getElementById('bookAlert').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('bookModal')).show();
}

// ── Confirm booking ───────────────────────────
async function confirmBooking() {
    const plate = document.getElementById('vehiclePlate').value.trim();
    const alert = document.getElementById('bookAlert');

    if (!plate) {
        alert.className = 'alert alert-danger';
        alert.textContent = 'Please enter your vehicle plate number';
        alert.classList.remove('d-none');
        return;
    }

    try {
        const data = await apiCreateBooking(selectedSlot, plate);
        if (data.success) {
            bootstrap.Modal.getInstance(
                document.getElementById('bookModal')).hide();
            showToast('Slot booked successfully! Expires in 15 minutes.', 'success');
            searchSlots();
        } else {
            alert.className = 'alert alert-danger';
            alert.textContent = data.message || 'Booking failed';
            alert.classList.remove('d-none');
        }
    } catch (err) {
        alert.className = 'alert alert-danger';
        alert.textContent = 'Failed to book. Please try again.';
        alert.classList.remove('d-none');
    }
}

// ── Toast notification ────────────────────────
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}