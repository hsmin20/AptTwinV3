// login.js
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault(); // 폼 기본 제출 막기

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("./php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    const data = await response.json();

    // ✅ 테스트용: 로그인 결과 콘솔 출력
    console.log("로그인 결과:", data);
    alert("로그인 성공/실패 결과는 콘솔 확인!"); 

    if (data.success) {
      localStorage.setItem("userid", data.userid);

      // 테스트용: 잠시 이동 막기
      // window.location.href = "../index.html"; // 나중에 확인 후 주석 해제
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류 발생");
  }
});
