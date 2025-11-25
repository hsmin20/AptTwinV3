document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("./php/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${username}&password=${password}`,
    credentials: "include"
  });

  let data;
  try {
    data = await res.json();
  } catch {
    alert("서버 응답 오류");
    return;
  }

  if (data.success) {
    window.location.href = "../index.html";
  } else {
    alert(data.message || "로그인 실패");
  }
});
