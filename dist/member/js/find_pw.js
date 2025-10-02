document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("findPwForm");

    form.addEventListener("submit", async function(e) {
        e.preventDefault();

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
            const res = await fetch("http://localhost:8000/member/php/find_pw_process.php", {
                method: "POST",
                body: formData
            });

            // 1. 그냥 텍스트로 받아본다
            const text = await res.text();
            console.log("📌 Raw Response Text:", text);

            // 2. JSON 파싱 시도
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error("❌ JSON Parse Error:", parseError);
                alert("⚠ 서버가 JSON 대신 다른 응답을 보냈습니다.\n콘솔 로그를 확인하세요.");
                return;
            }

            // 3. 정상일 경우 메시지 출력
            alert(data.message);

        } catch (err) {
            console.error("❌ Fetch Error:", err);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    });
});
