document.getElementById("joinForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  try {
    const response = await fetch("http://localhost:8000/member/php/join_process.php", {
      method: "POST",
      body: formData
    });

    const result = await response.text();
    console.log(result);
    alert("회원가입 성공!");
    window.location.href = "../login.html";
  } catch (err) {
    alert("서버 오류 발생");
  }
});
