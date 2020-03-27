document.getElementById("loginForm").addEventListener("submit", () => {
    document.getElementById("message").innerText = ""
    let body = {
        username: document.getElementById("inUsername").getAttribute("value"),
        password: document.getElementById("inPassword").getAttribute("value"),
    };

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body))

    xhr.onload = () => {
        if (xhr.status === 200) {
            window.location.href = "/";
            return;
        } else if (xhr.status === 401) {
            let responseData = JSON.parse(xhr.responseText);
            document.getElementById("message").innerText = responseData.message || "";
        } else {
            document.getElementById("message").innerText = "Something went wrong.";
        }


    };
});