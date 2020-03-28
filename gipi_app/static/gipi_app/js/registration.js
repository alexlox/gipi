window.onload = () => {
    let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    // Log In
    document.getElementById("loginForm") &&
    document.getElementById("loginForm").addEventListener("submit", (event) => {
        event.preventDefault();

        document.getElementById("loginMessage").innerText = "";
        let body = {
            username: document.getElementById("inUsername").value,
            password: document.getElementById("inPassword").value
        };

        document.getElementsByName("submit")[0].setAttribute("disabled", "");

        let xhr = new XMLHttpRequest();

        xhr.open("POST", "/login", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
        xhr.send(JSON.stringify(body));

        xhr.onload = () => {
            document.getElementsByName("submit")[0].removeAttribute("disabled");

            if (xhr.status === 200) {
                window.location.href = "/";
            } else if (xhr.status === 401 || xhr.status === 400) {
                let responseData = JSON.parse(xhr.responseText);
                document.getElementById("loginMessage").innerText = responseData.message || "";
            } else {
                document.getElementById("loginMessage").innerText = "Something went wrong.";
            }
        };

        xhr.onerror = () => {
            document.getElementsByName("submit")[0].removeAttribute("disabled");
            document.getElementById("loginMessage").innerText = "Please check your internet connection.";
        }
    });

    // Sign Up
    document.getElementById("signupForm") &&
    document.getElementById("signupForm").addEventListener("submit", (event) => {
        event.preventDefault();

        document.getElementById("signupMessage").innerText = "";
        let body = {
            username: document.getElementById("inUsername").value,
            password: document.getElementById("inPassword").value
        };

        document.getElementsByName("submit")[0].setAttribute("disabled", "");

        let xhr = new XMLHttpRequest();

        xhr.open("POST", "/signUp", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
        xhr.send(JSON.stringify(body));

        xhr.onload = () => {
            document.getElementsByName("submit")[0].removeAttribute("disabled");

            if (xhr.status === 200) {
                window.location.href = "/";
            } else if (xhr.status === 400) {
                let responseData = JSON.parse(xhr.responseText);
                document.getElementById("signupMessage").innerText = responseData.message || "";
            } else {
                console.log(xhr.status);
                document.getElementById("signupMessage").innerText = "Something went wrong.";
            }
        };

        xhr.onerror = () => {
            document.getElementsByName("submit")[0].removeAttribute("disabled");
            document.getElementById("signupMessage").innerText = "Please check your internet connection.";
        }
    });
};
