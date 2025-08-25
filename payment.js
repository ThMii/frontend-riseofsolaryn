// payment.js

document.addEventListener('DOMContentLoaded', () => {
    // ==== Kiểm tra đăng nhập ====
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Vui lòng đăng nhập để nạp tiền');
        window.location.href = 'index.html';
        return;
    }
    // ==== Header: user info ====
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const name = document.querySelector('.user-name');
    if (name) name.textContent = `Hi, ${userData.userName || userData.email || 'Người chơi'}`;

    // Dropdown menu
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const userMenu = document.querySelector('.user-menu');
    if (dropdownToggle && userMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });
        document.addEventListener('click', () => userMenu.classList.remove('active'));
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        });
    }

    // Profile
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'account.html';
        });
    }

    // ==== Payment steps ====
    let currentStep = 1;
    let selectedMethod = '';
    let selectedAmount = 0;
    const paymentCode = 'ROS' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('payment-code').textContent = paymentCode;

    // Chọn phương thức
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedMethod = card.dataset.method;
            nextStep();
        });
    });

    // Chọn mệnh giá
    document.querySelectorAll('.amount-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.amount-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedAmount = parseInt(this.dataset.amount);
            document.getElementById('payment-amount').textContent = selectedAmount.toLocaleString();
        });
    });

    // Nút điều hướng
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 2 && selectedAmount === 0) {
                alert('Vui lòng chọn mệnh giá');
                return;
            }
            nextStep();
        });
    });
    document.querySelectorAll('.btn-prev').forEach(btn => btn.addEventListener('click', prevStep));

    const completeBtn = document.querySelector('.btn-complete');
    if (completeBtn) {
        completeBtn.addEventListener('click', async () => {
            if (selectedAmount === 0) {
                alert('Vui lòng chọn mệnh giá');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        amount: selectedAmount,
                        paymentCode: paymentCode
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Tạo giao dịch thất bại');

                alert(`Giao dịch #${data.transactionId} đã được tạo. Vui lòng chuyển khoản theo hướng dẫn.`);
                window.location.href = 'game.html';
            } catch (error) {
                alert('Có lỗi xảy ra: ' + error.message);
            }
        });
    }

    // Helper
    function nextStep() {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
    function prevStep() {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
});
