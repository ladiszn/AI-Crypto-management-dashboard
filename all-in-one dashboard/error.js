document.addEventListener('DOMContentLoaded', () => {
    const askAIButton = document.getElementById('askAI');
    const inputField = document.getElementById('sapphire-assistant');
    const aiResponseBox = document.getElementById('ai-response');
    const aiMessage = aiResponseBox.querySelector('.ai-message p');
    const closeResponse = document.getElementById('close-response');
    const copyButton = aiResponseBox.querySelector('.copy');
    const voiceButton = aiResponseBox.querySelector('.voice');
    let speechSynthesisUtterance;

    const saveToLocalStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getFromLocalStorage = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    };

    const systemMessage = 'You are Sapphire, a digital assistant for LOURD JVKE. You are integrated with the LOURD dashboard and are only authorized to solve Firebase-related and domain-related issues. For anything outside of that jurisdiction, please refer users to subscribe to a higher plan.';

    const fetchAIResponse = async (message) => {
        const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': '11a1e14780msh7e751b2020d507dp1c42f1jsn7d2db5f90ea7',
                'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemMessage },
                    ...(getFromLocalStorage('chatHistory') || [])
                ],
                model: 'gpt-4o',
                max_tokens: 100,
                temperature: 0.9
            })
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result.choices[0].message.content;
        } catch (error) {
            console.error(error);
            return 'Error fetching response.';
        }
    };

    const displayResponse = (response) => {
        aiMessage.textContent = response;
        aiResponseBox.style.display = 'block';
    };

    const handleVoice = (text) => {
        if (speechSynthesisUtterance) {
            window.speechSynthesis.cancel();
            speechSynthesisUtterance = null;
        } else {
            speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speechSynthesisUtterance);
        }
    };

    askAIButton.addEventListener('click', async () => {
        const userMessage = inputField.value.trim();
        if (userMessage) {
            const chatHistory = getFromLocalStorage('chatHistory') || [];
            
            // Check for duplicate user message
            if (!chatHistory.some(entry => entry.role === 'user' && entry.content === userMessage)) {
                chatHistory.push({ role: 'user', content: userMessage });
                saveToLocalStorage('chatHistory', chatHistory);
            }

            aiResponseBox.style.display = 'none';
            const aiResponse = await fetchAIResponse(userMessage);

            // Check for duplicate assistant response
            if (!chatHistory.some(entry => entry.role === 'assistant' && entry.content === aiResponse)) {
                chatHistory.push({ role: 'assistant', content: aiResponse });
                saveToLocalStorage('chatHistory', chatHistory);
            }

            displayResponse(aiResponse);
            inputField.value = '';
        }
    });

    closeResponse.addEventListener('click', () => {
        aiResponseBox.style.display = 'none';
        if (speechSynthesisUtterance) {
            window.speechSynthesis.cancel();
            speechSynthesisUtterance = null;
        }
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(aiMessage.textContent).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });

    voiceButton.addEventListener('click', () => {
        handleVoice(aiMessage.textContent);
    });

    window.addEventListener('beforeunload', () => {
        if (speechSynthesisUtterance) {
            window.speechSynthesis.cancel();
        }
    });
});
