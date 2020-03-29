let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value,
    AudioContext = window.AudioContext || window.webkitAudioContext,
    audioContext = new AudioContext,
    gumStream,
    rec;

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
                    recordButton.innerText = "Stop the journey!";
                    recordButton.dataset.action = "stop";

                    intervalID = setInterval(recordCoordinates, 5000 * 60);
                    break;
                case 'stop':
                    recordButton.innerText = "Start the journey!";
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

        document.getElementById("startVoiceRecordButton").addEventListener("click", (event) => {
            event.preventDefault();

            document.getElementById("answer").innerText = "";
            document.getElementById("startVoiceRecordButton").style.display = "none";
            document.getElementById("stopVoiceRecordButton").style.display = "block";

            startVoiceRecording();
        });

        document.getElementById("stopVoiceRecordButton").addEventListener("click", (event) => {
            event.preventDefault();

            document.getElementById("startVoiceRecordButton").style.display = "block";
            document.getElementById("stopVoiceRecordButton").style.display = "none";

            stopVoiceRecording();
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

function recordCoordinates () {
    let timestamp = new Date(); // Register timestamp before the geolocation returns the coordinates

    navigator.geolocation.getCurrentPosition(position => {
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

function loadMockCoordinates () {
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

function startVoiceRecording () {
    let constraints = {
        audio: true,
        video: false
    };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        /* assign to gumStream for later use */
        gumStream = stream;
        let input = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(input, {
            numChannels: 2
        });
        //start the recording process
        rec.record();
        console.log("Recording started");
    }).catch(() => {
        document.getElementById("startVoiceRecordButton").style.display = "block";
        document.getElementById("stopVoiceRecordButton").style.display = "none";
        alert("Recording failed.");
    });
}

function stopVoiceRecording () {
    rec.stop();
    gumStream.getAudioTracks()[0].stop();
    rec.exportWAV(sendWavToServer);
}

function sendWavToServer (blob) {
    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/question", true);
    xhr.setRequestHeader("X-CSRFToken", csrfToken);

    xhr.onload = () => {
        let message = JSON.parse(xhr.responseText).message;

        if (xhr.status !== 200) {
            document.getElementById("answer").innerText = message || "Something went wrong on the server.";
            return;
        }

        document.getElementById("answer").innerText = message;
    };
    xhr.onerror = () => {
        document.getElementById("answer").innerText = "Connection problem.";
    };

    xhr.send(blob);
}
