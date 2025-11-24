<script>
document.addEventListener("DOMContentLoaded", async () => {
    const loginStatus = document.getElementById("loginStatus");

    try {
        const res = await fetch("./member/php/check_login.php", {
            credentials: "include",  // 쿠키 포함
            cache: "no-store"
        });
        const data = await res.json();

        console.log("check_login 결과:", data); // ✅ 여기서 JSON 확인
        loginStatus.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`; // 화면에도 표시

        if (data.logged_in) {
            loginStatus.innerHTML = `<a href="#" class="login_btn" id="logoutBtn">${data.userid}님 로그아웃</a>`;
            document.getElementById("logoutBtn").addEventListener("click", async () => {
                await fetch("./member/php/logout.php", { method: "POST", credentials: "include" });
                window.location.reload();
            });
        } else {
            loginStatus.innerHTML = `<a href="./member/login.html" class="login_btn" id="loginBtn">로그인</a>`;
        }

    } catch (err) {
        console.error("check_login 호출 오류:", err);
        loginStatus.innerHTML = "로그인 상태 확인 실패";
    }
});
</script>
