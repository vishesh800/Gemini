const chatsContainer = document.querySelector(".chats-container");
const promptform = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");

const API_KEY = "AIzaSyBjxzapvUY0Njx_n6M-okKpFTOn_nTFTyc";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
const scrollToBottom = () => chatsContainer.scrollTo({
    top: chatsContainer.scrollHeight,
    behavior: "smooth"
});

const typingEffect = (Text, textElement, botMsgDiv) => {
    textElement.innerHTML ="";
    const words = Text.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        if(wordIndex < words.length){
            textElement.innerHTML += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
            
        }
        else{
            clearInterval(typingInterval);
        }
    },40)
}

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    
    chatHistory.push({
        role: "user",
        parts : [{text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method : "POST",
            headers : {"Content-type": "application/json"},
            body: JSON.stringify({contents : chatHistory})
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);   
        
        let responseText = data.candidates[0]?.content?.parts?.[0]?.text;

        responseText = responseText
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Convert **bold** to <b>
            .replace(/\*(.*?)\*/g, "<i>$1</i>") // Convert *italic* to <i>
            .replace(/```([\s\S]+?)```/g, "<pre><code>$1</code></pre>") // Convert ```code``` to <pre><code>
            .replace(/\n/g, "<br>"); // Convert newlines to <br>

        textElement.innerHTML = responseText;
        typingEffect(responseText, textElement, botMsgDiv);

        avatar.style.animationPlayState = "paused";
    } catch (error) {
        console.log(error);
    }
}
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;
    promptInput.value = "";

    const userMsgHTML = `<p class = "message-text">heloo</p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
        const botMsgHTML = `<img src="gemini-chatbot-logo.svg"
                    class="avatar"><p class = "message-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "Loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 600);
}
promptform.addEventListener("submit", handleFormSubmit);