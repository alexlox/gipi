window.onload = () => {
    let recordButton = document.getElementById("record");
    recordButton &&
    recordButton.addEventListener("click", () => {
        switch (recordButton.dataset.action) {
            case 'start':
                recordButton.innerText = "Stop Record";
                recordButton.dataset.action = "stop";
                break;
            case 'stop':
                recordButton.innerText = "Start Record";
                recordButton.dataset.action = "start";
                break;
            default:
        }
    });

    document.getElementById("logInBtn") &&
    document.getElementById("logInBtn").addEventListener("click", () => {
        window.location.href = "/login";
    });

    document.getElementById("signUpBtn") &&
    document.getElementById("signUpBtn").addEventListener("click", () => {
        window.location.href = "/signUp";
    });

    document.getElementById("logOutBtn") &&
    document.getElementById("logOutBtn").addEventListener("click", () => {
        window.location.href = "/logOut";
    });
};
