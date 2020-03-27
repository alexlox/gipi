document.getElementById("startRecord") && document.getElementById("startRecord").addEventListener("click", () => {
    alert("Started recording...");
});

document.getElementById("logInBtn").addEventListener("click", () => {
    window.location.href = "/login";
});
document.getElementById("signUpBtn").addEventListener("click", () => {
    window.location.href = "/signUp";
});
