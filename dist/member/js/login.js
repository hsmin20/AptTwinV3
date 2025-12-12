// login.js
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) return alert("아이디/비밀번호를 입력하세요.");

    try {
        const res = await fetch("./php/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            // 🌟 바로 메인으로
            window.location.href = "../index.html";
        } else {
            alert("로그인 실패");
        }

    } catch (error) {
        alert("서버 문제 있음");
    }
});
