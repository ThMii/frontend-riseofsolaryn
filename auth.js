// DOM Elements
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const otpForm = document.getElementById('otp-form');
const closeModal = document.querySelector('.close-modal');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

// API Configuration
const API_BASE_URL = 'http://localhost:5226/api';

// Hiển thị loading
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Kiểm tra kết nối backend
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/test`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.error("Backend connection error:", error);
        return false;
    }
}

// Xử lý đăng nhập Google
async function handleGoogleSignIn(response) {
    showLoading(true);
    
    try {
        // Kiểm tra kết nối backend
        const isBackendReady = await checkBackendConnection();
        if (!isBackendReady) {
            throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
        }

        const res = await fetch(`${API_BASE_URL}/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                idToken: response.credential 
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi server: ${res.status}`);
        }

        const data = await res.json();
        
        if (!data.token) {
            throw new Error('Server không trả về token');
        }

        // Lưu thông tin người dùng
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify({
            userId: data.userId,
            email: data.email,
            userName: data.userName,
            avatarUrl: data.avatarUrl,
            hasCharacter: data.hasCharacter
        }));

        // Cập nhật giao diện
        updateAuthStatus();
        
        // Chuyển hướng nếu có character
        if (data.hasCharacter) {
            window.location.href = 'game.html';
        } else {
            window.location.href = 'character-creation.html';
        }
        
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        
        let errorMessage = 'Lỗi đăng nhập';
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.';
        } else {
            errorMessage += ': ' + error.message;
        }
        
        alert(errorMessage);
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
    const googleSignInDiv = document.querySelector('.g_id_signin');

    if (token) {
        // Đã đăng nhập
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        if (googleSignInDiv) googleSignInDiv.style.display = 'none';
        
        // Hiển thị thông tin user
        if (userInfoElement) {
            userInfoElement.innerHTML = `
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
        if (googleSignInDiv) googleSignInDiv.style.display = 'block';
    }
}

// Xử lý đăng xuất
function handleLogout() {
    // Xóa dữ liệu local
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Đăng xuất Google
    if (typeof google !== 'undefined') {
        google.accounts.id.disableAutoSelect();
    }
    
    // Cập nhật giao diện
    updateAuthStatus();
    
    // Thông báo
    alert('Đã đăng xuất thành công');
    
    // Reload trang
    window.location.reload();
}

// Khởi tạo Google Sign-In
function initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: '209103974377-7nveqvs3viq5bjaa8j9vbg4uarqpgir2.apps.googleusercontent.com',
            callback: handleGoogleSignIn,
            ux_mode: 'popup',
            auto_select: false
        });
        
        // Hiển thị nút Google
        const googleSignInDiv = document.querySelector('.g_id_signin');
        if (googleSignInDiv) {
            google.accounts.id.renderButton(googleSignInDiv, {
                type: 'standard',
                theme: 'dark',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left'
            });
            
            // Hiển thị nút khi chưa đăng nhập
            googleSignInDiv.style.display = localStorage.getItem('authToken') ? 'none' : 'block';
        }
    }
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Google Sign-In
    initializeGoogleSignIn();
    
    // Kiểm tra trạng thái đăng nhập
    updateAuthStatus();
    
    // Gắn sự kiện đăng xuất
    document.querySelector('.logout-button')?.addEventListener('click', handleLogout);
    
    // Gắn sự kiện cho nút đăng nhập thủ công
    document.querySelector('.login-button')?.addEventListener('click', (e) => {
        e.preventDefault();
        // Hiển thị popup Google
        if (typeof google !== 'undefined') {
            google.accounts.id.prompt();
        } else {
            alert('Hệ thống đăng nhập đang tải, vui lòng thử lại sau');
        }
    });
    
    // Gắn sự kiện cho các form khác
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
});

// Xử lý khi window được focus lại
window.addEventListener('focus', () => {
    if (!localStorage.getItem('authToken')) {
        const googleSignInDiv = document.querySelector('.g_id_signin');
        if (googleSignInDiv) googleSignInDiv.style.display = 'block';
    }
});