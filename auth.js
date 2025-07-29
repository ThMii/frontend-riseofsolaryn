const API_BASE_URL = 'https://riseofsolaryn-api.onrender.com/api';  

// DOM Elements
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const otpForm = document.getElementById('otp-form');
const closeModal = document.querySelector('.close-modal');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');

// Hiển thị loading
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Hiển thị thông báo lỗi
function showError(message) {
    alert(message); // Có thể thay bằng hiển thị đẹp hơn
}

// Xử lý đăng nhập
async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showError('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }

        // Lưu token và user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Đóng modal
        authModal.style.display = 'none';
        
        // Chuyển hướng theo role
        if (data.user.role === 'ADMIN') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'game.html';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Xử lý đăng ký
async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (!username || !email || !password) {
        showError('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại');
        }

        // Chuyển sang form OTP và lưu tạm email
        localStorage.setItem('tempEmail', email);
        registerForm.style.display = 'none';
        otpForm.style.display = 'block';
        
    } catch (error) {
        console.error('Register error:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Xử lý xác thực OTP
async function handleVerifyOtp() {
    const otp = document.getElementById('otp-code').value;
    const email = localStorage.getItem('tempEmail');
    
    if (!otp) {
        showError('Vui lòng nhập mã OTP');
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                otp: otp
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Xác thực thất bại');
        }

        // Xóa email tạm
        localStorage.removeItem('tempEmail');
        
        // Thông báo và chuyển về form login
        alert('Xác thực thành công! Vui lòng đăng nhập');
        otpForm.style.display = 'none';
        loginForm.style.display = 'block';
        
    } catch (error) {
        console.error('OTP verification error:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Cập nhật trạng thái đăng nhập
function updateAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    const loginButton = document.querySelector('.login-button');
    const logoutButton = document.querySelector('.logout-button');
    const userInfoElement = document.querySelector('.user-info');

    if (token) {
        // Đã đăng nhập
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        
        // Hiển thị thông tin user
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                ${userData.role === 'ADMIN' ? '<span class="admin-badge">ADMIN</span>' : ''}
                <img src="${userData.avatarUrl || 'default-avatar.png'}" class="user-avatar" alt="User Avatar">
                <span class="user-name">${userData.userName || userData.email || 'User'}</span>
            `;
            userInfoElement.style.display = 'flex';
        }
    } else {
        // Chưa đăng nhập
        if (loginButton) loginButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        if (userInfoElement) userInfoElement.style.display = 'none';
    }
}

// Xử lý đăng xuất
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    updateAuthStatus();
    window.location.href = 'index.html';
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra trạng thái đăng nhập
    updateAuthStatus();
    
    // Gắn sự kiện đăng xuất
    document.querySelector('.logout-button')?.addEventListener('click', handleLogout);
    
    // Gắn sự kiện cho nút đăng nhập
    document.querySelector('.login-button')?.addEventListener('click', () => {
        authModal.style.display = 'flex';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        otpForm.style.display = 'none';
    });
    
    // Gắn sự kiện đóng modal
    closeModal?.addEventListener('click', () => {
        authModal.style.display = 'none';
    });
    
    // Chuyển đổi giữa các form
    showRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    
    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
    
    // Gắn sự kiện cho các nút
    loginBtn?.addEventListener('click', handleLogin);
    registerBtn?.addEventListener('click', handleRegister);
    verifyOtpBtn?.addEventListener('click', handleVerifyOtp);
});