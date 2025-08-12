document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập và quyền admin
    checkAdminAuth();

    // Load danh sách ban đầu
    loadUsers();

    // Sự kiện tìm kiếm
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', loadUsers);
    }

    // Sự kiện refresh
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            loadUsers();
        });
    }

    // Avatar + tên admin
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const avatar = document.querySelector('.user-avatar');
    const name = document.querySelector('.user-name');

    if (avatar) avatar.src = userData.avatarUrl || 'Hình/avt.jpg';
    if (name) name.textContent = userData.userName || 'Admin';

    // Dropdown menu
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const userMenu = document.querySelector('.user-menu');

    if (dropdownToggle && userMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        // Click bên ngoài để đóng menu
        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });
    }

    // Logout trong dropdown
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Thông tin cá nhân
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Trang thông tin cá nhân sẽ mở ở đây.');
            // Hoặc: window.location.href = 'profile.html';
        });
    }
});

async function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!token || !userData) {
        alert('Vui lòng đăng nhập');
        window.location.href = 'index.html';
        return;
    }

    if (userData.role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = 'index.html';
        return;
    }

    document.querySelector('.user-name').textContent = userData.userName || userData.email;
}

async function loadUsers() {
    showLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const search = document.getElementById('search-input').value.trim();

        let url = `${API_BASE_URL}/admin/users/all`;
        if (search) {
            url = `${API_BASE_URL}/admin/users?search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Không thể tải dữ liệu người dùng');

        const data = await response.json();
        const users = data.users || data.Users || [];

        renderUsers(users);
    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        showLoading(false);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = '';

    if (users.length === 0) {
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
            <td><button class="btn-delete" data-id="${user.userId}">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

async function deleteUser(userId) {
    if (!confirm(`Bạn có chắc muốn xóa người dùng ID ${userId}?`)) return;

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Xóa người dùng thất bại');

        alert('Xóa thành công');
        loadUsers();
    } catch (err) {
        alert(err.message);
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
