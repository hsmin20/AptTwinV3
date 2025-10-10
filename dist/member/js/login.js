document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const resultElem = document.getElementById("loginResult");

  try {
    const response = await fetch("http://localhost:8000/member/php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    const data = await response.json();

  if (data.success) {
    localStorage.setItem("userid", data.userid);
    window.location.href = "../index.html"; // 로그인 후 메인 페이지
  } else {
    alert(data.message); // 로그인 실패 시 경고창
  }
  } catch (err) {
    alert("서버 오류 발생"); // 서버 에러도 경고창
  }
});
