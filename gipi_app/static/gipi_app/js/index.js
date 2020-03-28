window.onload = () => {
    // loadMockCoordinates();

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

                    intervalID = setInterval(recordCoordinates, 5000 * 60);
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
    let timestamp = new Date(); // Register timestamp before the geolocation returns the coordinates

    navigator.geolocation.getCurrentPosition(position => {
        let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
        let xhr = new XMLHttpRequest();
        let body = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: timestamp.toISOString()
        };

        console.dir(body);

        xhr.open("POST", "/coordinates", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
        xhr.send(JSON.stringify(body));

        xhr.onload = () => {
            if (xhr.status !== 200) {
                console.error(xhr.responseText);
            }
        };

        xhr.onerror = () => {
            console.error("Connection problem.");
        };
    });
}

function loadMockCoordinates() {
    let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "/static/gipi_app/js/mock_coordinates.json", true);
    xhr.setRequestHeader("X-CSRFToken", csrfToken);
    xhr.send();

    xhr.onload = () => {
        if (xhr.status !== 200) {
            alert("Mock coordinates did not load.");
            return;
        }

        let mockCoordinates = JSON.parse(xhr.responseText);
        uploadMockHistory(mockCoordinates)
    };

    xhr.onerror = () => {
        alert("Mock coordinates did not load (connection problem).");
    }
}

function uploadMockHistory (mockCoordinates) {
    console.log("Start upload mock coordinates");
    let startTime = new Date(2020, 3, 24, 7, 15, 0),
        actualTime;

    for (let i = 0; i < mockCoordinates.length; i++) {
        // plus 5 minutes for every coordinate
        // timezone needs to be taken into consideration because here toISOString() will return in UTC
        actualTime = new Date(startTime.getTime() + 1000 * 60 * 5 * i - startTime.getTimezoneOffset() * 60000);

        let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
        let xhr = new XMLHttpRequest();
        let body = {
            latitude: mockCoordinates[i].coords.latitude,
            longitude: mockCoordinates[i].coords.longitude,
            timestamp: actualTime.toISOString()
        };

        xhr.open("POST", "/coordinates", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
        xhr.send(JSON.stringify(body));

        xhr.onload = () => {
            if (xhr.status !== 200) {
                console.error(xhr.responseText);
            } else {
                console.log("Finished " + i);
            }
        };

        xhr.onerror = () => {
            console.error("Connection problem.");
        };
    }
}
