// background.js
console.log('chatgpt-search-chrome-extension/background.js loaded');
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('Received query:', request.query);
        chrome.storage.local.get('openai_api_key', async function(data) {
            const apiKey = data.openai_api_key;
            if (!apiKey) {
                alert("OpenAI API Key is not set.");
                return;
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {role: "system", content: "You should answer like goole search engine, user will provide prompt as search query."},
                        {role: "user", content: request.query}
                    ],
                    stream: true
                })
            });

            // 注意：由于stream参数为true，响应将是一个流式的。
            // 在实际应用中，你需要处理这个流式响应，这里仅作演示。
            const reader = response.body.getReader();
            let answer = '';
            reader.read().then(function processText({ done, value }) {
                if (done) return;
                // 将Uint8Array转换为字符串
                const textChunk = new TextDecoder("utf-8").decode(value);
                // 移除 `data: ` 前缀并分割字符串
                const dataLines = textChunk.split('\n').map(line => line.substring(6).trim()).filter(line => line !== '[DONE]');
                dataLines.forEach(line => {
                    if (!line) return; // 忽略空行
                    try {
                        const responseData = JSON.parse(line); // 将行解析为JSON对象
                        if (responseData.choices && responseData.choices.length > 0) {
                            const content = responseData.choices[0].delta.content;
                            if (content) { // 确保content存在
                                answer += content; // 将内容拼接到完整的回答中
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing response data:', error);
                    }
                });
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {"text": answer});
                });
                // 下一次迭代
                return reader.read().then(processText);
            });
            return true; // 必须返回true表示异步响应
        });
        
    }
);
