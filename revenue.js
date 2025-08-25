// revenue.js

document.addEventListener('DOMContentLoaded', () => {
    loadRevenue();
  });
  
  // Hàm load doanh thu từ danh sách giao dịch
  async function loadRevenue() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("Bạn cần đăng nhập trước");
            return;
        }
  
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
  
        const transactions = await response.json();
  
        if (!response.ok) {
            throw new Error(transactions.message || 'Không thể tải dữ liệu doanh thu');
        }
  
        // 👉 Tính doanh thu từ các giao dịch hoàn thành
        const totalRevenue = transactions
            .filter(t => t.status === 'COMPLETED' || t.status === 'Hoàn thành')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
  
        // Hiển thị tổng doanh thu
        document.getElementById('total-revenue').textContent =
            `Tổng doanh thu: ${totalRevenue.toLocaleString()}`;
  
        // Vẽ biểu đồ doanh thu
        drawRevenueChart(transactions);
  
    } catch (error) {
        console.error(error);
        alert('Lỗi khi tải dữ liệu doanh thu');
    }
  }
  
  // Hàm vẽ biểu đồ
  function drawRevenueChart(transactions) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
  
    // Gom doanh thu theo ngày
    const revenueByDate = {};
    transactions
        .filter(t => t.status === 'COMPLETED' || t.status === 'Hoàn thành')
        .forEach(t => {
            const date = new Date(t.createdAt).toLocaleDateString();
            if (!revenueByDate[date]) revenueByDate[date] = 0;
            revenueByDate[date] += t.amount || 0;
        });
  
    // Lấy labels và data, rồi đảo ngược để hiển thị từ trái qua phải
    const labels = Object.keys(revenueByDate).reverse();
    const data = Object.values(revenueByDate).reverse();
  
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: data,
                backgroundColor: 'orange'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
  }
  