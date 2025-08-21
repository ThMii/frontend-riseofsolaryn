document.addEventListener('DOMContentLoaded', () => {
    // Lấy dữ liệu user từ localStorage
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

        // Click ngoài để đóng menu
        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });
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

    // Bắt đầu chơi
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            alert("Game sẽ được mở tại đây!");
            // Nếu có Unity WebGL thì redirect sang folder build
            // window.location.href = "unity-build/index.html";
        });
    }
});
