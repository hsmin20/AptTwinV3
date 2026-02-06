document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("./member/php/check_login.php", {
            method: "GET",
            credentials: "include" // 세션 쿠키 유지
        });

        const data = await response.json();

        if (!data.logged_in) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = "./member/login.html"; // 로그인 페이지로 이동
        }
    } catch (err) {
        console.error("로그인 검증 오류:", err);
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        window.location.href = "./member/login.html";
    }
});
