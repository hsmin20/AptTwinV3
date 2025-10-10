// form과 token 정의
const form = document.getElementById("resetPwForm");
const token = new URLSearchParams(window.location.search).get("token");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById("new_password").value.trim();
    const confirmPassword = document.getElementById("confirm_password").value.trim();

    if (!newPassword || !confirmPassword) {
        alert("비밀번호를 입력해주세요.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append("token", token);
    formData.append("new_password", newPassword);
    formData.append("confirm_password", confirmPassword);

    try {
        const res = await fetch("./php/reset_pw_process.php", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();  // ✅ JSON으로 받기
        console.log("📩 서버 응답(JSON):", data);

        if (data.success && data.redirect) {
            window.location.href = data.redirect;  // ✅ find_ok.html로 이동
        } else {
            alert(data.message || "비밀번호 변경 실패");
        }

    } catch (err) {
        console.error("❌ Fetch Error:", err);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
});
