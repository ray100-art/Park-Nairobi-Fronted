// ── Show login or register tab ────────────────
function showTab(tab) {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab     = document.getElementById('loginTab');
    const registerTab  = document.getElementById('registerTab');

    if (tab === 'login') {
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
    hideAlert();
}

// ── Show alert ────────────────────────────────
function showAlert(message, type = 'danger') {
    const box = document.getElementById('alertBox');
    box.className = `alert alert-${type}`;
    box.textContent = message;
    box.classList.remove('d-none');
}

function hideAlert() {
    document.getElementById('alertBox').classList.add('d-none');
}

// ── Login ─────────────────────────────────────
async function login() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAlert('Please fill in all fields');
        return;
    }

    try {
        const data = await apiLogin(email, password);
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                fullName: data.user.fullName,
                role:     data.user.role,
                userId:   data.user.id,
                phone:    data.user.phone,
                email:    data.user.email
            }));
            window.location.href = 'dashboard.html';
        } else {
            showAlert(data.message || 'Login failed');
        }
    } catch (err) {
        showAlert('Cannot connect to server. Is the app running?');
    }
}

// ── Register ──────────────────────────────────
async function register() {
    const fullName = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const phone    = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!fullName || !email || !phone || !password) {
        showAlert('Please fill in all fields');
        return;
    }

    try {
        const data = await apiRegister(fullName, email, phone, password);
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                fullName: data.user.fullName,
                role:     data.user.role,
                userId:   data.user.id,
                phone:    data.user.phone,
                email:    data.user.email
            }));
            window.location.href = 'dashboard.html';
        } else {
            showAlert(data.message || 'Registration failed');
        }
    } catch (err) {
        showAlert('Cannot connect to server. Is the app running?');
    }
}

// ── Redirect if already logged in ────────────
if (getToken()) {
    window.location.href = 'dashboard.html';
}