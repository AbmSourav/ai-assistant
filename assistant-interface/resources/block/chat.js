
document.addEventListener('DOMContentLoaded', () => {
    const chatBlock = document.querySelector('.assistant-chat-block .assistant-chat');
    const chatBox = document.querySelector('.assistant-chat-block .assistant-chat-box');
    const chatClose = document.querySelector('.assistant-chat-block .assistant-box-close');
    const chatInput = document.querySelector('.assistant-chat-block .assistant-input');
    const chatBody = document.querySelector('.assistant-chat-block .assistant-box-body');

    if (!chatBlock) {
        return;
    }

    chatBlock.addEventListener('click', () => {
        chatBox.classList.toggle('show');

        if (chatBox.classList.contains('show')) {
            chatBlock.classList.add('hide');
            setTimeout(() => {
                chatInput.focus();
            }, 200);
        }
    });

    chatClose.addEventListener('click', () => {
        chatBox.classList.remove('show');
        chatBlock.classList.remove('hide');
        chatInput.disabled = false;
    });

    chatInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            const message = chatInput.value.trim();
            if (!message) {
                return;
            }

            chatBody.innerHTML += `<div class="thread-wrap"><div class="user-message">${message}</div></div>`;
            chatInput.value = '';
            chatInput.disabled = true;

            const form = new FormData();
            form.append('action', 'retrieveAIResponse');
            form.append('nonce', aiAssistantData.nonce);
            form.append('query', message);

            const processMessages = [
                'Thinking...',
                'Analyzing your query...',
                'Fetching relevant information...',
                'Formulating a response...'
            ]

            // Add initial process message
            chatBody.innerHTML += `<div class="ai-thread-wrap process"><div class="ai-response">${processMessages[0]}</div></div>`;
            chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom

            // Rotate messages every 2 seconds
            let messageIndex = 0;
            const messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % processMessages.length;
                const processElem = chatBody.querySelector('.ai-thread-wrap.process .ai-response');
                if (processElem) {
                    processElem.textContent = processMessages[messageIndex];
                }
            }, 2000);

            await getData(message, messageInterval);
        }
    })
});

const getData = async (message, messageInterval) => {
    const chatBody = document.querySelector('.assistant-chat-block .assistant-box-body');
    const chatInput = document.querySelector('.assistant-chat-block .assistant-input');

    const form = new FormData();
    form.append('action', 'retrieveAIResponse');
    form.append('nonce', aiAssistantData.nonce);
    form.append('query', message);

    fetch(aiAssistantData.ajaxUrl, {
        method: 'POST',
        body: form,
    })
    .then(response => response.json())
    .then(data => {
        console.log('AI response data:', data);
        // If unable to get relevant data
        if (!data?.data?.results) {
            return contactSupport();
        }

        const content = data.data.results.message.content ?? ''
        if (data.success) {
            clearInterval(messageInterval); // Stop rotating messages
            const processElem = chatBody.querySelector('.process');
            if (processElem) {
                processElem.remove();
            }
            chatBody.innerHTML += `<div class="ai-thread-wrap"><div class="ai-response">${content}</div></div>`;
        }
    })
    .catch(error => {
        console.error('Error fetching AI response:', error);
    })
    .finally(() => {
        clearInterval(messageInterval);
        chatInput.disabled = false;
        chatBody.scrollTop = chatBody.scrollHeight;
        chatInput.focus();
    });
}

const contactSupport = (res) => {
    const chatBody = document.querySelector('.assistant-chat-block .assistant-box-body')

    const processElem = chatBody.querySelector('.process')
    if (processElem) {
        processElem.remove();
    }

    const content = `
        Sorry, I couldn't find relevant information to answer your query.
        Do you want to create a support ticket or contact support team?
        <br/><br/>
        <button href="#" target="_blank" class="support-btn">Contact Support</button>
        <button href="#" target="_blank" class="support-btn">Create Ticket</button>
    `

    chatBody.innerHTML += `<div class="ai-thread-wrap"><div class="ai-response">${content}</div></div>`;
}
