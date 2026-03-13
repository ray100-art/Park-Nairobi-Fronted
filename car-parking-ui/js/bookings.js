// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
});

// ── Load bookings ─────────────────────────────
async function loadBookings() {
    try {
        const token = getToken();

        // If no token, show demo bookings so page is not empty
        if (!token) {
            showDemoBookings();
            return;
        }

        const bookings = await apiGetMyBookings();
        document.getElementById('loadingSpinner').classList.add('d-none');

        if (!Array.isArray(bookings) || bookings.length === 0) {
            document.getElementById('emptyState').classList.remove('d-none');
            return;
        }

        renderBookings(bookings);
    } catch (err) {
        document.getElementById('loadingSpinner').classList.add('d-none');
        showDemoBookings();
    }
}

// ── Demo bookings (shown when not logged in) ──
function showDemoBookings() {
    document.getElementById('loadingSpinner').classList.add('d-none');
    const demoBookings = [
        {
            id: 1,
            slotId: 'LOT_A-01',
            vehiclePlate: 'KCA 123A',
            status: 'PENDING',
            reservedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
            parkingAreaName: 'Nairobi CBD Parking',
            floor: 0,
            totalAmount: 0
        },
        {
            id: 2,
            slotId: 'LOT_B-02',
            vehiclePlate: 'KBZ 456B',
            status: 'ACTIVE',
            reservedAt: new Date(Date.now() - 3600000).toISOString(),
            expiresAt: null,
            checkInTime: new Date(Date.now() - 3600000).toISOString(),
            parkingAreaName: 'Westlands Parking',
            floor: 1,
            totalAmount: 150
        },
        {
            id: 3,
            slotId: 'LOT_C-01',
            vehiclePlate: 'KDA 789C',
            status: 'CANCELLED',
            reservedAt: new Date(Date.now() - 86400000).toISOString(),
            expiresAt: null,
            parkingAreaName: 'Upper Hill Parking',
            floor: 0,
            totalAmount: 0
        }
    ];
    renderBookings(demoBookings);
}

// ── Render bookings ───────────────────────────
function renderBookings(bookings) {
    document.getElementById('loadingSpinner').classList.add('d-none');
    document.getElementById('emptyState').classList.add('d-none');

    // Stats row
    const total     = bookings.length;
    const active    = bookings.filter(b => b.status === 'ACTIVE').length;
    const pending   = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;

    document.getElementById('statsRow').innerHTML = `
        <div class="col-6 col-md-3">
            <div class="stat-card text-center p-3 rounded" style="background:#1e1e2e;border:1px solid #333">
                <div class="fs-3 fw-bold text-white">${total}</div>
                <div class="text-secondary small">Total</div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-card text-center p-3 rounded" style="background:#1e1e2e;border:1px solid #198754">
                <div class="fs-3 fw-bold text-success">${active}</div>
                <div class="text-secondary small">Active</div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-card text-center p-3 rounded" style="background:#1e1e2e;border:1px solid #ffc107">
                <div class="fs-3 fw-bold text-warning">${pending}</div>
                <div class="text-secondary small">Pending</div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-card text-center p-3 rounded" style="background:#1e1e2e;border:1px solid #dc3545">
                <div class="fs-3 fw-bold text-danger">${cancelled}</div>
                <div class="text-secondary small">Cancelled</div>
            </div>
        </div>
    `;

    // Filter buttons active state
    filterBookings('ALL', bookings);
}

// ── Filter bookings ───────────────────────────
let currentBookings = [];

function filterBookings(status, bookings) {
    if (bookings) currentBookings = bookings;

    // Update filter button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-outline-secondary');
    });
    const activeBtn = document.getElementById('filter-' + status);
    if (activeBtn) {
        activeBtn.classList.add('btn-warning');
        activeBtn.classList.remove('btn-outline-secondary');
    }

    const filtered = status === 'ALL'
        ? currentBookings
        : currentBookings.filter(b => b.status === status);

    const list = document.getElementById('bookingsList');

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="bi bi-calendar-x text-secondary" style="font-size:2.5rem"></i>
                <p class="text-secondary mt-2">No ${status !== 'ALL' ? status.toLowerCase() : ''} bookings</p>
            </div>`;
        return;
    }

    list.innerHTML = filtered.map(b => {
        const statusColor =
            b.status === 'PENDING'   ? 'warning'   :
            b.status === 'ACTIVE'    ? 'success'   :
            b.status === 'CANCELLED' ? 'danger'    : 'secondary';

        const statusIcon =
            b.status === 'PENDING'   ? 'hourglass-split' :
            b.status === 'ACTIVE'    ? 'check-circle'    :
            b.status === 'CANCELLED' ? 'x-circle'        : 'clock';

        return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="booking-card h-100">

                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <div class="fw-bold text-warning fs-5">
                            <i class="bi bi-p-square me-1"></i>${b.slotId}
                        </div>
                        <div class="text-secondary small">${b.parkingAreaName || 'Parking Area'}</div>
                    </div>
                    <span class="badge bg-${statusColor} px-3 py-2">
                        <i class="bi bi-${statusIcon} me-1"></i>${b.status}
                    </span>
                </div>

                <!-- Details -->
                <div class="mb-3">
                    <div class="d-flex align-items-center mb-2">
                        <div class="detail-icon me-2">
                            <i class="bi bi-car-front text-warning"></i>
                        </div>
                        <div>
                            <div class="text-secondary" style="font-size:0.72rem">Vehicle Plate</div>
                            <div class="text-white fw-bold small">${b.vehiclePlate}</div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center mb-2">
                        <div class="detail-icon me-2">
                            <i class="bi bi-layers text-warning"></i>
                        </div>
                        <div>
                            <div class="text-secondary" style="font-size:0.72rem">Floor</div>
                            <div class="text-white small">Floor ${b.floor ?? 0}</div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center mb-2">
                        <div class="detail-icon me-2">
                            <i class="bi bi-clock text-warning"></i>
                        </div>
                        <div>
                            <div class="text-secondary" style="font-size:0.72rem">Reserved At</div>
                            <div class="text-white small">${new Date(b.reservedAt).toLocaleString()}</div>
                        </div>
                    </div>

                    ${b.expiresAt ? `
                    <div class="d-flex align-items-center mb-2">
                        <div class="detail-icon me-2">
                            <i class="bi bi-hourglass text-warning"></i>
                        </div>
                        <div>
                            <div class="text-secondary" style="font-size:0.72rem">Expires At</div>
                            <div class="text-white small">${new Date(b.expiresAt).toLocaleString()}</div>
                        </div>
                    </div>` : ''}

                    ${b.checkInTime ? `
                    <div class="d-flex align-items-center mb-2">
                        <div class="detail-icon me-2">
                            <i class="bi bi-box-arrow-in-right text-success"></i>
                        </div>
                        <div>
                            <div class="text-secondary" style="font-size:0.72rem">Checked In</div>
                            <div class="text-white small">${new Date(b.checkInTime).toLocaleString()}</div>
                        </div>
                    </div>` : ''}

                    ${b.totalAmount > 0 ? `
                    <div class="d-flex align-items-center">
                        <div class="detail-icon me-2">
                            <i class="bi bi-cash text-success"></i>
                        </div>
                        <div>
                            <div class="text-secondary" style="font-size:0.72rem">Amount</div>
                            <div class="text-success fw-bold small">KES ${b.totalAmount}</div>
                        </div>
                    </div>` : ''}
                </div>

                <!-- Actions -->
                ${b.status === 'PENDING' ? `
                <div class="d-grid gap-2 mt-auto">
                    <button class="btn btn-outline-danger btn-sm"
                            onclick="cancelBooking(${b.id})">
                        <i class="bi bi-x-circle me-1"></i>Cancel Booking
                    </button>
                </div>` : ''}

                ${b.status === 'ACTIVE' ? `
                <div class="d-grid gap-2 mt-auto">
                    <button class="btn btn-outline-success btn-sm" disabled>
                        <i class="bi bi-check-circle me-1"></i>Currently Parked
                    </button>
                </div>` : ''}

            </div>
        </div>`;
    }).join('');
}

// ── Cancel booking ────────────────────────────
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const data = await apiCancelBooking(bookingId);
        if (data.success) {
            loadBookings();
        } else {
            alert(data.message || 'Failed to cancel');
        }
    } catch (err) {
        loadBookings(); // refresh anyway
    }
}