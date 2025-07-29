document.addEventListener('DOMContentLoaded', async () => {
    // Kiểm tra quyền admin
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = 'index.html';
        return;
    }

    // Load danh sách giao dịch
    await loadTransactions();

    // Làm mới danh sách
    document.getElementById('refresh-btn').addEventListener('click', loadTransactions);
    document.getElementById('transaction-status').addEventListener('change', loadTransactions);

    // Xử lý logout
    document.querySelector('.logout-button').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    });
});

async function loadTransactions() {
    const status = document.getElementById('transaction-status').value;
    const token = localStorage.getItem('authToken');
    
    try {
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

        const data = await response.json();
        console.log("Transactions Data:", data); // Debug API response

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi tải giao dịch');
        }

        // Đảm bảo data là array
        const transactions = Array.isArray(data) ? data : data.transactions || [];
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi: ' + error.message);
    }
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactions-list');
    tbody.innerHTML = '';

    transactions.forEach(transaction => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${transaction.transactionId}</td>
            <td>${transaction.user.email}</td>
            <td>${transaction.amount.toLocaleString()} VND</td>
            <td>${transaction.paymentCode || 'N/A'}</td>
            <td>
                <span class="transaction-status status-${transaction.status.toLowerCase()}">
                    ${getStatusText(transaction.status)}
                </span>
            </td>
            <td>${new Date(transaction.createdAt).toLocaleString()}</td>
            <td>
                ${transaction.status === 'PENDING' ? `
                    <button class="btn-action btn-approve" data-id="${transaction.transactionId}">Duyệt</button>
                    <button class="btn-action btn-reject" data-id="${transaction.transactionId}">Từ chối</button>
                ` : 'N/A'}
            </td>
        `;
        
        tbody.appendChild(tr);
    });

    // Gắn sự kiện cho các nút duyệt/từ chối
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', () => approveTransaction(btn.dataset.id));
    });
    
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', () => rejectTransaction(btn.dataset.id));
    });
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Đang chờ',
        'COMPLETED': 'Hoàn thành',
        'FAILED': 'Thất bại'
    };
    return statusMap[status] || status;
}

async function approveTransaction(transactionId) {
    if (!confirm('Xác nhận duyệt giao dịch này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/confirm`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Duyệt giao dịch thất bại');
        }

        alert('Đã duyệt giao dịch thành công!');
        await loadTransactions();
    } catch (error) {
        console.error('Error approving transaction:', error);
        alert('Lỗi khi duyệt giao dịch: ' + error.message);
    }
}

async function rejectTransaction(transactionId) {
    if (!confirm('Xác nhận từ chối giao dịch này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Từ chối giao dịch thất bại');
        }

        alert('Đã từ chối giao dịch!');
        await loadTransactions();
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        alert('Lỗi khi từ chối giao dịch: ' + error.message);
    }
}