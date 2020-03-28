window.onload = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not available on your device or browser.");
        return;
    }
    // Ask for user permission
    navigator.geolocation.getCurrentPosition(() => {}, function () {
        alert("Make sure the geolocation is enabled.");
    });

    let recordButton = document.getElementById("record");

    // User is logged in
    if (recordButton) {
        let intervalID;

        recordButton.addEventListener("click", () => {
            switch (recordButton.dataset.action) {
                case 'start':
                    recordButton.innerText = "Stop Record";
                    recordButton.dataset.action = "stop";

                    intervalID = setInterval(recordCoordinates, 5000);
                    break;
                case 'stop':
                    recordButton.innerText = "Start Record";
                    recordButton.dataset.action = "start";

                    if (intervalID !== undefined) {
                        clearInterval(intervalID);
                    }
                    break;
                default:
            }
        });

        document.getElementById("logOutBtn").addEventListener("click", () => {
            window.location.href = "/logOut";
        });
    } else {
        document.getElementById("logInBtn").addEventListener("click", () => {
            window.location.href = "/login";
        });

        document.getElementById("signUpBtn").addEventListener("click", () => {
            window.location.href = "/signUp";
        });
    }
};

function recordCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {
        let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
        let xhr = new XMLHttpRequest();
        let body = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
        };

        xhr.open("POST", "/coordinates", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
        xhr.send(JSON.stringify(body));
    });
}
