document.addEventListener("DOMContentLoaded", async () => {
  const projectContainer = document.getElementById("projectContainer");

  try {
    // 로그인 체크
      const loginRes = await fetch("./member/php/check_login.php", {
        credentials: "include",
        cache: "no-store"
      });
      const loginData = await loginRes.json();

    if (!loginData.logged_in) {
      projectContainer.innerHTML = `<p class="no-login">로그인이 필요합니다.</p>`;
      return;
    }

    const userid = loginData.userid;

    // 프로젝트 목록 불러오기
    const res = await fetch(`./house_project.php?userid=${userid}`);
    const projects = await res.json();

    let cardsHTML = "";

    if (projects.length) {
      cardsHTML = projects
        .map(
          (p) => `
        <div class="project-card" data-houseid="${p.house_id}">
          ${p.image ? `<img class="project-image" src="${p.image}" alt="평면도" />` : ""}
          <h2 class="project-name">${p.house_name || "(이름 없음)"}</h2>
          <p class="project-date">Updated: ${p.updated_at}</p>
          <button class="interior-btn" data-houseid="${p.house_id}">
            ✏️ Interior 수정하기
          </button>
        </div>
      `
        )
        .join("");
    }

    // 새 프로젝트 카드
    cardsHTML += `
      <div class="project-card new-project-card" id="newProjectCard">
        <div class="plus-sign">+</div>
        <p class="new-text">새 집 만들기 </p>
      </div>
    `;

    projectContainer.innerHTML = cardsHTML;

    // 전체 카드 클릭 → player.html 이동
    document.querySelectorAll(".project-card").forEach((card) => {
      const houseId = card.getAttribute("data-houseid");
      if (!houseId) return; // 새 프로젝트 카드 제외

      card.addEventListener("click", () => {
        window.location.href = `player.html?house_id=${houseId}`;
      });
    });

    // Interior 버튼 클릭 → interior.html 이동
    document.querySelectorAll(".interior-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // 카드 클릭 이벤트 방지
        const houseId = btn.getAttribute("data-houseid");
        window.location.href = `interior.html?house_id=${houseId}`;
      });
    });

    // 새 프로젝트 추가 카드
    document.getElementById("newProjectCard").addEventListener("click", () => {
      window.location.href = "./new_project.html";
    });

  } catch (err) {
    console.error(err);
    projectContainer.innerHTML = `<p class="error">데이터를 불러오지 못했습니다.</p>`;
  }
});
