document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("./php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      credentials: "include" // 쿠키 포함
    });

    const data = await response.json();

    console.log("login.php 결과:", data);

    if (data.success) {
      // 테스트용: 이동 막고 JSON 확인
      alert("로그인 성공! 콘솔에서 세션 정보 확인 가능.");
      // localStorage에 userid 저장
      localStorage.setItem("userid", data.userid);
    } else {
      alert(data.message); // 로그인 실패
    }

  } catch (err) {
    alert("서버 오류 발생"); 
    console.error(err);
  }
});
