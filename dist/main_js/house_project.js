document.addEventListener("DOMContentLoaded", async () => {
  const projectContainer = document.getElementById("projectContainer");

  try {
    // 로그인 체크
    const loginRes = await fetch("./member/php/check_login.php");
    const loginData = await loginRes.json();

    if (!loginData.logged_in) {
      projectContainer.innerHTML = `<p class="no-login">로그인이 필요합니다.</p>`;
      return;
    }

    const userid = loginData.userid;

    // 프로젝트 목록 불러오기
    const res = await fetch(`./house_project.php?userid=${userid}`);
    const projects = await res.json();

    // 카드 HTML 누적
    let cardsHTML = "";

    if (projects.length) {
      cardsHTML = projects
        .map(
          (p) => `
        <div class="project-card">
          ${p.image ? `<img class="project-image" src="${p.image}" alt="평면도" />` : ""}
          <h2 class="project-name">${p.house_name || "(이름 없음)"}</h2>
          <p class="project-date">Updated: ${p.updated_at}</p>
        </div>
      `
        )
        .join("");
    }

    // 마지막에 "새 프로젝트 추가" 카드 추가
    cardsHTML += `
      <div class="project-card new-project-card" id="newProjectCard">
        <div class="plus-sign">+</div>
        <p class="new-text">새 프로젝트</p>
      </div>
    `;

    projectContainer.innerHTML = cardsHTML;

    // 클릭 시 새 프로젝트 페이지로 이동
    const newCard = document.getElementById("newProjectCard");
    newCard.addEventListener("click", () => {
      window.location.href = "./new_project.html";
    });
  } catch (err) {
    console.error(err);
    projectContainer.innerHTML = `<p class="error">데이터를 불러오지 못했습니다.</p>`;
  }
});
