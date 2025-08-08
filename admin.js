// Biến toàn cục
// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập và quyền admin
    checkAdminAuth();
    
    // Load dữ liệu ban đầu
    loadTransactions();
    
    // Gắn sự kiện
    document.getElementById('refresh-btn').addEventListener('click', loadTransactions);
    document.getElementById('status-filter').addEventListener('change', loadTransactions);
    document.querySelector('.logout-button').addEventListener('click', logout);
});

// Kiểm tra quyền admin
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
    
    currentUser = userData;
    document.querySelector('.user-name').textContent = userData.userName || userData.email;
}

// Load danh sách giao dịch
async function loadTransactions() {
    showLoading(true);
    
    try {
        const status = document.getElementById('status-filter').value;
        const token = localStorage.getItem('authToken');
        
        let url = `${API_BASE_URL}/transactions`;
        if (status !== 'ALL') {
            url += `?status=${status}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi tải dữ liệu giao dịch');
        }
        
        const transactions = await response.json();
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error:', error);
        showError('Không thể tải danh sách giao dịch: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Hiển thị danh sách giao dịch
function renderTransactions(transactions) {
    const tbody = document.getElementById('transactions-list');
    
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">Không có giao dịch nào</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const tr = document.createElement('tr');
        
        // Format ngày tháng
        const createdAt = new Date(transaction.createdAt);
        const formattedDate = createdAt.toLocaleDateString('vi-VN') + ' ' + createdAt.toLocaleTimeString('vi-VN');
        
        tr.innerHTML = `
            <td>${transaction.transactionId}</td>
            <td>${transaction.user?.email || 'N/A'}</td>
            <td>${transaction.amount?.toLocaleString('vi-VN') || '0'} VND</td>
            <td>${transaction.paymentMethod || 'BANK_TRANSFER'}</td>
            <td>
                <span class="transaction-status status-${transaction.status.toLowerCase()}">
                    ${getStatusText(transaction.status)}
                </span>
            </td>
            <td>${formattedDate}</td>
            <td>
                ${transaction.status === 'PENDING' ? `
                    <button class="btn-action btn-approve" data-id="${transaction.transactionId}">Duyệt</button>
                    <button class="btn-action btn-reject" data-id="${transaction.transactionId}">Từ chối</button>
                ` : '-'}
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Gắn sự kiện cho các nút
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', () => handleTransactionAction(btn.dataset.id, 'confirm'));
    });
    
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', () => handleTransactionAction(btn.dataset.id, 'reject'));
    });
}

// Xử lý duyệt/từ chối giao dịch
async function handleTransactionAction(transactionId, action) {
    if (!confirm(`Xác nhận ${action === 'confirm' ? 'duyệt' : 'từ chối'} giao dịch này?`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            `${API_BASE_URL}/transactions/${transactionId}/${action === 'confirm' ? 'confirm' : 'reject'}`, 
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Lỗi khi ${action === 'confirm' ? 'duyệt' : 'từ chối'} giao dịch`);
        }
        
        const result = await response.json();
        alert(result.message || 'Thao tác thành công');
        loadTransactions(); // Refresh danh sách
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Helper functions
function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Đang chờ',
        'COMPLETED': 'Hoàn thành',
        'FAILED': 'Thất bại'
    };
    return statusMap[status] || status;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showError(message) {
    alert(message);
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}