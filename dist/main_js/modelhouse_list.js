document.addEventListener("DOMContentLoaded", async () => {
    const projectContainer = document.querySelector("#item-table tbody");

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
        const res = await fetch(`./modelhouse_list.php`);
        const projects = await res.json();

        projectContainer.innerHTML = "";

        if (projects.length) {
            
            projects.forEach(p => {
                const tr = document.createElement("tr");
                let size_m2 = (p.size_m2).toFixed(1);
                tr.innerHTML = `
                    <td><a href="editor.html?model_id=${p.model_id}">${p.model_id}</a></td>
                    <td>
                        <div class="thumbnail-container">
                            <img class="thumbnail" src="${p.image}" alt="thumbnail" />
                            <span class="large-image-preview">
                            <img src="${p.image}" alt="original" class="original-image">
                            </span>
                        </div>
                    </td>
                    <td>${p.complex_name}</td>
                    <td>${p.address}</td>
                    <td>${size_m2}</td>
                    <td>${p.type}</td>
                    <td>${p.company_name}</td>
                    <td>${p.comment}</td>
                    <td>${p.updated_at}</td>
                    <td>
                        <button class="edit-btn" model_id="${p.model_id}">수정</button>
                        <button class="delete-btn" model_id="${p.model_id}">삭제</button>
                    </td>
                    `;

                projectContainer.appendChild(tr);
            });
        }

        document.getElementById("newModelHouse").addEventListener("click", () => {
            window.location.href = "./floorplanner.html";
        });

        // Edit 버튼 클릭
        document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                    const model_id = btn.getAttribute("model_id");
                    window.location.href = `./modelhouse_edit.html?model_id=${model_id}`;
            });
        });

        // Delete 버튼 클릭
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("정말로 삭제하시겠습니까?") == true) {
                    const model_id = btn.getAttribute("model_id");
                    const response = fetch(`./modelhouse_delete.php?model_id=${model_id}`);

                    if (!response.ok) {
                        alert(`HTTP error! status: ${response.error}`);
                        throw new Error(`HTTP error! status: ${response.error}`);
                    }

                    window.location.reload();
                }
            });
        });

    } catch (err) {
        alert(err);
        console.error(err);
        projectContainer.innerHTML = `<p class="error">데이터를 불러오지 못했습니다.</p>`;
    }
});
