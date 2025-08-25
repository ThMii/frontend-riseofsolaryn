document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const classKey = params.get("class");
  
    if (classKey) {
      loadClassDetail(classKey);
    }
  });
  
  const classData = {
    knight: {
      name: "Hiệp Sĩ",
      role: "Cận chiến - Phòng thủ",
      description: "Hiệp sĩ là bức tường vững chắc, chuyên về phòng thủ và sát thương cận chiến.",
      bg: "Hình/Logo1 (4).jpg",
      abilities: [
        { name: "Xoay kiếm", desc: "Xoay kiếm vòng tròn gây sát thương." },
        { name: "Khiên chắn", desc: "Tạo lá chắn chặn sát thương từ kẻ địch." },
        { name: "Hiệp sĩ dũng mãnh", desc: "Tăng damage 10 giây và khi kill quái thì được tăng thêm 5 giây." }
      ]
    },
    archer: {
      name: "Cung Thủ",
      role: "Tấn công từ xa - Sát thương",
      description: "Cung thủ có tốc độ cao, gây sát thương lớn từ khoảng cách an toàn.",
      bg: "Hình/Logo1 (3).jpg",
      abilities: [
        { name: "Tán xạ tiễn", desc: "Bắn ra 3 mũi tên theo hình nón." },
        { name: "Tăng tốc", desc: "Xạ Thủ tăng tốc độ bắn và tốc độ chạy trong 5 giây." },
        { name: "Mưa tên", desc: "Triệu hồi 1 vùng gây sát thương liên tục trong phạm vi ảnh hưởng." }
      ]
    },
    mage: {
      name: "Pháp Sư",
      role: "Phép thuật - Chiêu hồn sư",
      description: "Pháp sư tinh thông phép thuật, chiều hồi các ma xương tiêu diệt kẻ địch.",
      bg: "Hình/Logo1 (2).jpg",
      abilities: [
        { name: "Triệu hồi", desc: "Triệu hồi 3 đệ (tối đa 9 đệ cùng tồn tại)." },
        { name: "Hồi phục", desc: "Hồi máu cho đệ." },
        { name: "Đoạt hồn", desc: "Gọi hồn quái vật đã bị tiêu diệt vào các đệ đang có ( Skill 1) ( Lấy 50% chỉ số của quái vật cần triệu hồi cộng dồn vào chỉ số của đệ)." }
      ]
    }
  };
  
  function loadClassDetail(classKey) {
    const data = classData[classKey];
    if (!data) return;
  
    document.getElementById("class-name").textContent = data.name;
    document.getElementById("class-role").textContent = data.role;
    document.getElementById("class-description").textContent = data.description;
    document.getElementById("class-bg").style.backgroundImage = `url('${data.bg}')`;
  
    const abilitiesList = document.getElementById("abilities-list");
    abilitiesList.innerHTML = "";
  
    data.abilities.forEach((ab, index) => {
      const div = document.createElement("div");
      div.className = "ability" + (index % 2 === 1 ? " reverse" : "");
      div.innerHTML = `
        <div class="ability-icon">${index + 1}</div>
        <div class="ability-content">
          <h3 class="ability-name">${ab.name}</h3>
          <p class="ability-description">${ab.desc}</p>
        </div>
      `;
      abilitiesList.appendChild(div);
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedClass = urlParams.get("class"); // knight, archer, mage

    const videoElement = document.getElementById("class-video");
    const videoSource = document.getElementById("video-source");

    // Map class -> video file
    const classVideos = {
        knight: "Hình/0822.mp4",
        archer: "Hình/Archer.mp4",
        mage: "Hình/mage.mp4"
    };

    if (selectedClass && classVideos[selectedClass]) {
        videoSource.src = classVideos[selectedClass];
        videoElement.load(); // refresh lại video khi đổi source
    } else {
        // fallback video mặc định
        videoSource.src = "Hình/default.mp4";
        videoElement.load();
    }
});
  