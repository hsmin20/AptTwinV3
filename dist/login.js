document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8000/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    const text = await response.text();
    const resultElem = document.getElementById("loginResult");

    if (text.includes("로그인 성공")) {
      // localStorage에 userid 저장
      localStorage.setItem("userid", username);
      // index.html로 이동
      window.location.href = "index.html";
    } else {
      resultElem.innerText = text;
    }

  } catch (err) {
    document.getElementById("loginResult").innerText = "서버 오류 발생";
  }
});