document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadUsers();

    // Tìm kiếm
    document.getElementById('search-btn').addEventListener('click', loadUsers);

    // Làm mới
    document.getElementById('refresh-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        loadUsers();
    });

    // Avatar + tên admin
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    document.querySelector('.user-avatar').src = userData.avatarUrl || 'Hình/avt.jpg';
    document.querySelector('.user-name').textContent = userData.userName || 'Admin';

    // Dropdown menu
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const userMenu = document.querySelector('.user-menu');
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });
    document.addEventListener('click', () => userMenu.classList.remove('active'));

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Profile
    document.getElementById('profile-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Trang thông tin cá nhân sẽ mở ở đây.');
    });

    // Đóng modal
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('user-modal').style.display = 'none';
    });
});

// Kiểm tra quyền admin
async function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!token || !userData || userData.role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập');
        window.location.href = 'index.html';
    }
}

// Load danh sách user
async function loadUsers() {
    showLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const search = document.getElementById('search-input').value.trim();

        let url = `${API_BASE_URL}/admin/users/all`;
        if (search) {
            url = `${API_BASE_URL}/admin/users?search=${encodeURIComponent(search)}`;
        }

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const users = data.users || data;

        renderUsers(users);
    } catch (err) {
        alert('Không thể tải danh sách người dùng');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Render danh sách
function renderUsers(users) {
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = '';

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Không có người dùng nào</td></tr>`;
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.userName}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.createdAt).toLocaleString('vi-VN')}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</td>
            <td><button class="btn-view" data-id="${user.userId}">Xem</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => showUserDetail(btn.dataset.id, users));
    });
}

// Hiển thị modal chi tiết user
function showUserDetail(userId, users) {
    const user = users.find(u => u.userId == userId);
    if (!user) return;

    document.getElementById('modal-userid').textContent = user.userId;
    document.getElementById('modal-email').textContent = user.email;
    document.getElementById('modal-username').textContent = user.userName;
    document.getElementById('modal-role').textContent = user.role;
    document.getElementById('modal-created').textContent = new Date(user.createdAt).toLocaleString('vi-VN');
    document.getElementById('modal-diamonds').textContent = user.diamonds || 0;
    document.getElementById('modal-character').textContent = user.characters?.[0]?.className || 'Chưa có';

    document.getElementById('user-modal').style.display = 'block';
}

// Loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
