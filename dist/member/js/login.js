document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch("./php/login.php", {
        method: "POST",
        body: formData,
        credentials: "include" // *** 여기 필수 ***
    });

    const data = await res.json();
    alert("로그인 결과:\n" + JSON.stringify(data, null, 2));

    if (data.success) {
        window.location.href = "../index.html";
    }
});
