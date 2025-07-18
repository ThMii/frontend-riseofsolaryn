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

// API Configuration
const API_BASE_URL = 'https://rise-api-solarryn-cchvathwafa5e6gn.southeastasia-01.azurewebsites.net/api';

// Hiển thị loading
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Xử lý đăng nhập
async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đăng nhập thất bại');
        }

        const data = await response.json();
        
        // Lưu token và user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Đóng modal và cập nhật UI
        authModal.style.display = 'none';
        updateAuthStatus();
        
        // LUÔN chuyển hướng đến trang game.html sau khi đăng nhập
        window.location.href = 'game.html';
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Lỗi đăng nhập: ' + error.message);
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
        alert('Vui lòng nhập đầy đủ thông tin');
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đăng ký thất bại');
        }

        // Chuyển sang form OTP
        registerForm.style.display = 'none';
        otpForm.style.display = 'block';
    } catch (error) {
        console.error('Register error:', error);
        alert('Lỗi đăng ký: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Xử lý xác thực OTP
async function handleVerifyOtp() {
    const email = document.getElementById('register-email').value;
    const otp = document.getElementById('otp-code').value;
    
    if (!otp) {
        alert('Vui lòng nhập mã OTP');
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Xác thực thất bại');
        }

        alert('Xác thực thành công! Vui lòng đăng nhập');
        otpForm.style.display = 'none';
        loginForm.style.display = 'block';
    } catch (error) {
        console.error('OTP verification error:', error);
        alert('Lỗi xác thực: ' + error.message);
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
                <img src="${userData.avatarUrl || 'default-avatar.png'}" class="user-avatar" alt="User Avatar">
                <span class="user-name">${userData.username || userData.email || 'User'}</span>
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
    // Xóa dữ liệu local
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Cập nhật giao diện
    updateAuthStatus();
    
    // Thông báo
    alert('Đã đăng xuất thành công');
    
    // Reload trang
    window.location.reload();
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
    
    // Gắn sự kiện cho các form
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            otpForm.style.display = 'none';
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            otpForm.style.display = 'none';
        });
    }
    
    // Gắn sự kiện cho các nút
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', handleVerifyOtp);
    }
});