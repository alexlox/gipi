// Log In
document.getElementById("loginForm").addEventListener("submit", () => {
    document.getElementById("loginMessage").innerText = "";
    let body = {
        username: document.getElementById("inUsername").getAttribute("value"),
        password: document.getElementById("inPassword").getAttribute("value"),
    };

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body));

    xhr.onload = () => {
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
        document.getElementById("loginMessage").innerText = "Please check your internet connection.";
    }
});

// Sign Up
document.getElementById("signupForm").addEventListener("submit", () => {
    document.getElementById("signupMessage").innerText = "";
    let body = {
        username: document.getElementById("inUsername").getAttribute("value"),
        password: document.getElementById("inPassword").getAttribute("value"),
    };

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/signUp", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body));

    xhr.onload = () => {
        if (xhr.status === 200) {
            window.location.href = "/";
        } else if (xhr.status === 400) {
            let responseData = JSON.parse(xhr.responseText);
            document.getElementById("signupMessage").innerText = responseData.message || "";
        } else {
            document.getElementById("signupMessage").innerText = "Something went wrong.";
        }
    };

    xhr.onerror = () => {
        document.getElementById("signupMessage").innerText = "Please check your internet connection.";
    }
});
