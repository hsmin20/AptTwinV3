// login.js
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const resultElem = document.getElementById("loginResult");

  try {
    // 1. 로그인 요청
    const response = await fetch("./php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      credentials: "include" // ✅ 쿠키 포함
    });

    const data = await response.json();

    if (data.success) {
      // 2. 로그인 성공 후 세션 확인용 check_login 호출
      const checkRes = await fetch("./php/check_login.php", { credentials: "include" });
      const checkData = await checkRes.json();

      // ✅ alert로 확인
      alert("check_login.php 결과:\n" + JSON.stringify(checkData, null, 2));

      // 원하면 이 아래에서 메인페이지 이동 가능
      // window.location.href = "../index.html";
    } else {
      alert(data.message); // 로그인 실패
    }
  } catch (err) {
    alert("서버 오류 발생: " + err.message);
  }
});
