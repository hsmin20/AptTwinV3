// login.js
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("아이디와 비밀번호를 입력하세요.");
        return;
    }

    try {
        const res = await fetch("./php/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            credentials: "include"  // ★ 쿠키 포함
        });

        const data = await res.json();

        if (data.success) {
            // 세션 확인
            const check = await fetch("./php/check_login.php", {
                credentials: "include"  // ★ 여기도 필수
            });

            const checkData = await check.json();
            alert("로그인 성공!\n" + JSON.stringify(checkData, null, 2));

            // 로그인 성공 후 메인 페이지 이동
            window.location.href = "../index.html";

        } else {
            alert(data.message);
        }

    } catch (err) {
        alert("서버 오류: " + err.message);
    }
});
