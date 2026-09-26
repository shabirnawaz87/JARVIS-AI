const micButton = document.getElementById("micButton");
const sendButton = document.getElementById("sendButton");
const commandInput = document.getElementById("commandInput");
const chatMessages = document.getElementById("chatMessages");
const listeningStatus = document.getElementById("listeningStatus");
const quickButtons = document.querySelectorAll(".quick-btn");

let recognition = null;
let isListening = false;

// -----------------------------
// VOICE RECOGNITION
// -----------------------------

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function () {
        isListening = true;

        micButton.classList.add("listening");
        listeningStatus.textContent = "LISTENING...";
    };

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        commandInput.value = transcript;

        addUserMessage(transcript);

        processCommand(transcript);
    };

    recognition.onerror = function () {

        listeningStatus.textContent =
            "VOICE ERROR";

        stopListening();
    };

    recognition.onend = function () {
        stopListening();
    };

} else {

    listeningStatus.textContent =
        "VOICE NOT SUPPORTED";
}


// -----------------------------
// MICROPHONE
// -----------------------------

micButton.addEventListener("click", function () {

    if (!recognition) {

        addJarvisMessage(
            "Voice recognition is not supported by this browser. Please try Chrome."
        );

        return;
    }

    if (isListening) {

        recognition.stop();

    } else {

        recognition.start();
    }
});

function stopListening() {

    isListening = false;

    micButton.classList.remove("listening");

    listeningStatus.textContent =
        "SYSTEM READY";
}


// -----------------------------
// SEND BUTTON
// -----------------------------

sendButton.addEventListener("click", function () {

    sendCommand();
});


// ENTER KEY

commandInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        sendCommand();
    }
});


// -----------------------------
// SEND COMMAND
// -----------------------------

function sendCommand() {

    const command =
        commandInput.value.trim();

    if (!command) return;

    addUserMessage(command);

    commandInput.value = "";

    processCommand(command);
}


// -----------------------------
// PROCESS COMMAND
// -----------------------------

function processCommand(command) {

    const text =
        command.toLowerCase().trim();

    let response = "";

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        response =
            "Hello. JARVIS systems are online and ready.";

    }

    else if (
        text.includes("time") ||
        text.includes("what time")
    ) {

        response =
            "The current time is " +
            new Date().toLocaleTimeString();

    }

    else if (
        text.includes("date") ||
        text.includes("today")
    ) {

        response =
            "Today is " +
            new Date().toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

    }

    else if (
        text.includes("system") ||
        text.includes("computer")
    ) {

        response =
            "System interface is operational. " +
            "Browser: " +
            navigator.userAgent;

    }

    else if (
        text.includes("joke")
    ) {

        response =
            "Why did the computer go to the doctor? " +
            "Because it had a virus.";

    }

    else if (
        text.includes("what can you do") ||
        text.includes("help")
    ) {

        response =
            "I can currently respond to commands, " +
            "tell you the time and date, use voice recognition, " +
            "speak responses, and provide quick actions. " +
            "More AI capabilities will be connected next.";

    }

    else if (
        text.includes("search")
    ) {

        response =
            "I can open a web search for you.";

        setTimeout(function () {

            const query =
                command
                    .replace(/search/gi, "")
                    .trim();

            if (query) {

                window.open(
                    "https://www.google.com/search?q=" +
                    encodeURIComponent(query),
                    "_blank"
                );
            }

        }, 800);

    }

    else if (
        text.includes("open youtube")
    ) {

        response =
            "Opening YouTube.";

        window.open(
            "https://youtube.com",
            "_blank"
        );

    }

    else if (
        text.includes("open google")
    ) {

        response =
            "Opening Google.";

        window.open(
            "https://google.com",
            "_blank"
        );

    }

    else {

        response =
            "I received your command: " +
            command +
            ". My full AI brain will be connected in the next phase.";

    }

    setTimeout(function () {

        addJarvisMessage(response);

        speak(response);

    }, 400);
}


// -----------------------------
// ADD USER MESSAGE
// -----------------------------

function addUserMessage(text) {

    const message =
        document.createElement("div");

    message.className =
        "message user-message";

    message.innerHTML = `
        <div class="message-avatar">U</div>

        <div class="message-content">
            <strong>YOU</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    chatMessages.appendChild(message);

    scrollChat();
}


// -----------------------------
// ADD JARVIS MESSAGE
// -----------------------------

function addJarvisMessage(text) {

    const message =
        document.createElement("div");

    message.className =
        "message jarvis-message";

    message.innerHTML = `
        <div class="message-avatar">J</div>

        <div class="message-content">
            <strong>JARVIS</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    chatMessages.appendChild(message);

    scrollChat();
}


// -----------------------------
// TEXT TO SPEECH
// -----------------------------

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 0.85;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}


// -----------------------------
// QUICK ACTIONS
// -----------------------------

quickButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const command =
            button.dataset.command;

        commandInput.value = command;

        sendCommand();
    });
});


// -----------------------------
// CHAT SCROLL
// -----------------------------

function scrollChat() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// -----------------------------
// SECURITY / HTML ESCAPE
// -----------------------------

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// -----------------------------
// INITIAL STATUS
// -----------------------------

setTimeout(function () {

    speak(
        "JARVIS systems online. How may I assist you?"
    );

}, 1200);
