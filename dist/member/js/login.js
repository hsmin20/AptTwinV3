document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const resultElem = document.getElementById("loginResult");

  try {
    const response = await fetch("./php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    const data = await response.json();

    console.log("로그인 결과:", data); // ✅ 테스트용: 콘솔에 출력

    if (data.success) {
      localStorage.setItem("userid", data.userid);

      // 테스트용: 잠깐 멈춤
      alert("로그인 성공! 콘솔에서 세션 상태 확인하세요.");
      // window.location.href = "../index.html"; // ✅ 이동은 잠시 막음
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("서버 오류 발생");
  }
});
