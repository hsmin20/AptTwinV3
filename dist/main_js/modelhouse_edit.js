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

        const urlParams = new URLSearchParams(window.location.search);
        const model_id = urlParams.get('model_id');

        // Model 불러오기
        const res = await fetch(`./modelhouse_edit.php?model_id=` + model_id);
        const projects = await res.json();

        projects.forEach(p => {
            document.getElementById("model_id").value = `${model_id}`;
            document.getElementById("thumbnail").src = `${p.image}`;
            document.getElementById("image").src = `${p.image}`;
            document.getElementById("name").value = `${p.complex_name}`;
            document.getElementById("address").value = `${p.address}`;
            document.getElementById("area").value = `${p.size_m2}`;
            document.getElementById("type").value = `${p.type}`;
            document.getElementById("companyName").value = `${p.company_name}`;
            document.getElementById("comment").value = `${p.comment}`;
        });

        document.getElementById("editOK").addEventListener("click", () => {
            const pname = document.getElementById("name").value;
            const paddress = document.getElementById("address").value;
            const parea = document.getElementById("area").value;
            const ptype = document.getElementById("type").value;
            const pcompanyName = document.getElementById("companyName").value;
            const pcomment = document.getElementById("comment").value;

            const params = {
                model_id: model_id,
                complexName: pname,
                address: paddress,
                size_m2: parea,
                type: ptype,
                companyName: pcompanyName,
                comment: pcomment,
            };
            const queryString = new URLSearchParams(params).toString();
            const baseurl = './update_modelinfo.php?';

            const url = `${baseurl}${queryString}`;

            fetch(url);

            window.location = './modelhouse_list.html'; //document.referrer;
        });

        document.getElementById("editCancel").addEventListener("click", () => {
            window.location = './modelhouse_list.html';
        });

    } catch (err) {
        alert(err);
        console.error(err);
        projectContainer.innerHTML = `<p class="error">데이터를 불러오지 못했습니다.</p>`;
    }
});
