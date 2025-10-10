document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("findIdForm");

    form.addEventListener("submit", async function(e) {
        e.preventDefault(); // 여기가 핵심, 기본 submit 막기

        const name = form.querySelector("input[name='name']").value.trim();
        const email = form.querySelector("input[name='email']").value.trim();

        if (!name || !email) {
            alert("이름과 이메일을 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);

        try {
            const res = await fetch("http://localhost:8000/member/php/find_id_process.php", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            alert(data.message); // 경고창 띄우기
        } catch (err) {
            console.error(err);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    });
});
