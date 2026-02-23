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
                    <td>${p.complex_name}</td>
                    <td>
                        <div class="thumbnail-container">
                            <img class="thumbnail" src="${p.image}" alt="thumbnail" />
                            <span class="large-image-preview">
                            <img src="${p.image}" alt="original" class="original-image">
                            </span>
                        </div>
                    </td>
                    <td>${p.address}</td>
                    <td>${size_m2}</td>
                    <td>${p.type}</td>
                    <td>${p.company_name}</td>
                    <td>${p.comment}</td>
                    <td>${p.updated_at}</td>
                    <td>
                        <button class="editinfo-btn" id="editinfo" model_id="${p.model_id}">정보</button>
                        <button class="editplan-btn" id="editfloorplan" model_id="${p.model_id}">플랜</button>
                        <button class="editmodel-btn" id="editmode" model_id="${p.model_id}">모델</button>
                        <button class="delete-btn" model_id="${p.model_id}">삭제</button>
                    </td>
                    `;

                projectContainer.appendChild(tr);
            });
        }

        document.getElementById("newModelHouse").addEventListener("click", () => {
            let _html = `
                <dialog id="NewModelHouseDialog">
                    <form id="NewModelHouseinfoForm">
                        <p>이름 :
                        <input type="text" id="complexname" name="complexname" value="" size="50"></p>
                        <p>주소 :
                        <input type="text" id="address" name="address" value="" size="50"></p>
                        <p>면적(m<sup>2</sup>) :
                        <input type="text" id="size_m2" name="size_m2" value="" size="50"></p>
                        <p>타입 :
                        <input type="text" id="type" name="type" value="" size="50"></p>
                        <p>건설사 :
                        <input type="text" id="companyname" name="companyname" value="" size="50"></p>
                        <p>비고 :
                        <input type="text" id="comment" name="comment" value="" size="50"></p>
                        <div class="clearfix"></div>
                        <div style="padding:6px;">
                        <p>
                        <button value="cancel" formmethod="dialog">Cancel</button>
                        <button id="confirmBtn" value="default">Apply</button>
                        </p>
                        </div>
                    </form>
                </dialog>
            `

            const dom = new DOMParser().parseFromString(_html, 'text/html');
            const dialog = dom.querySelector("dialog");
            document.body.appendChild(dialog)

            const newModelHouseDialog = document.getElementById("NewModelHouseDialog");

            const confirmBtn = newModelHouseDialog.querySelector("#confirmBtn");

            // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
            newModelHouseDialog.addEventListener("close", (e) => {
                document.body.removeChild(dialog)
            });

            // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
            confirmBtn.addEventListener("click", async (event) => {
                event.preventDefault(); // We don't want to submit this fake form

                const aptName = document.getElementById("complexname").value;
                const addr = document.getElementById("address").value;
                const sizem2 = document.getElementById("size_m2").value;
                const atype = document.getElementById("type").value;
                const companyname = document.getElementById("companyname").value;
                const acomment = document.getElementById("comment").value;

                if(aptName == '' || sizem2 == '') {
                    alert('이름과 면적은 공란일 수 없습니다');
                    return;
                }

                const response = await fetch(`./upload_modelhouse.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ complex_name: aptName, address: addr, size_m2: sizem2, type: atype, company_name: companyname, comment: acomment })
                });

                if (!response.ok) {
                    alert(`HTTP error! status: ${response.error}`);
                    throw new Error(`HTTP error! status: ${response.error}`);
                }

                window.location.reload();

                document.body.removeChild(dialog)
            });

            newModelHouseDialog.showModal();
        });

        // Edit 버튼 클릭
        document.querySelectorAll(".editinfo-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const model_id = btn.getAttribute("model_id");
                window.location.href = `./modelhouse_edit.html?model_id=${model_id}`;
            });
        });

        document.querySelectorAll(".editplan-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const model_id = btn.getAttribute("model_id");
                window.location.href = `./floorplanner.html?fromdb=true&model_id=${model_id}`;
            });
        });

        document.querySelectorAll(".editmodel-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const model_id = btn.getAttribute("model_id");
                window.location.href = `./editor.html?model_id=${model_id}`;
            });
        });

        // Delete 버튼 클릭
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm("정말로 삭제하시겠습니까?") == true) {
                    const model_id = btn.getAttribute("model_id");
                    const response = await fetch(`./modelhouse_delete.php?model_id=${model_id}`);

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
