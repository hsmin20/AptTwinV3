document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "이메일 정보 없음";
    document.getElementById("userEmail").innerText = decodeURIComponent(email);
});