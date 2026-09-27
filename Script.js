const micButton = document.getElementById("micButton");
const sendButton = document.getElementById("sendButton");
const commandInput = document.getElementById("commandInput");
const chatMessages = document.getElementById("chatMessages");
const listeningStatus = document.getElementById("listeningStatus");
const quickButtons = document.querySelectorAll(".quick-btn");

let recognition = null;
let isListening = false;

// ================================
// VOICE RECOGNITION
// ================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        isListening = true;
        micButton.classList.add("listening");
        listeningStatus.textContent = "LISTENING...";
    };

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        commandInput.value = transcript;

        addUserMessage(transcript);

        askJarvis(transcript);
    };

    recognition.onerror = (event) => {

        console.error("Voice error:", event.error);

        listeningStatus.textContent =
            "VOICE ERROR";

        stopListening();
    };

    recognition.onend = () => {
        stopListening();
    };

} else {

    listeningStatus.textContent =
        "VOICE NOT SUPPORTED";
}


// ================================
// MICROPHONE
// ================================

micButton.addEventListener("click", () => {

    if (!recognition) {

        addJarvisMessage(
            "Voice recognition is not supported by this browser. Please use Chrome."
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


// ================================
// SEND BUTTON
// ================================

sendButton.addEventListener("click", sendCommand);


commandInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        sendCommand();
    }
});


function sendCommand() {

    const command =
        commandInput.value.trim();

    if (!command) return;

    addUserMessage(command);

    commandInput.value = "";

    askJarvis(command);
}


// ================================
// TALK TO GEMINI THROUGH NETLIFY
// ================================

async function askJarvis(message) {

    listeningStatus.textContent =
        "JARVIS THINKING...";

    try {

        const response = await fetch(
            "/.netlify/functions/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message,
                    provider: "gemini"
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "JARVIS backend error"
            );
        }

        const answer =
            data.answer ||
            "I could not generate a response.";

        addJarvisMessage(answer);

        speak(answer);

    } catch (error) {

        console.error(error);

        addJarvisMessage(
            "I couldn't connect to my AI brain. " +
            "Please check the Netlify function and Gemini API configuration."
        );

    } finally {

        listeningStatus.textContent =
            "SYSTEM READY";
    }
}


// ================================
// TEXT TO SPEECH
// ================================

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


// ================================
// QUICK ACTIONS
// ================================

quickButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const command =
            button.dataset.command;

        commandInput.value = command;

        sendCommand();
    });
});


// ================================
// CHAT UI
// ================================

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


function scrollChat() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ================================
// STARTUP
// ================================

setTimeout(() => {

    addJarvisMessage(
        "Gemini connection ready. I am now waiting for your command."
    );

}, 800);
