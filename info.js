document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadUsers();

    document.getElementById('search-btn').addEventListener('click', loadUsers);
    document.getElementById('refresh-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        loadUsers();
    });
    document.querySelector('.logout-button').addEventListener('click', logout);
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
