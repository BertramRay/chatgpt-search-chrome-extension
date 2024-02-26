// content.js
console.log('chatgpt-search-chrome-extension/content.js loaded');
const query = document.querySelector('textarea').value; // 获取Google搜索框的内容

// 向background.js发送消息
chrome.runtime.sendMessage({query: query});

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    // 假设message中包含了要显示的文本 "text"
    if (message.text) {
        const gptResponseArea = document.querySelector('div[id="gpt-response"]');
        if (!gptResponseArea) {
            let sidebar = document.querySelector('div[id="rhs"]');
            if (!sidebar) {
                console.log('Creating new sidebar')
                const newSidebar = document.createElement('div');
                newSidebar.id = 'rhs';
                const rcnt = document.querySelector('div[id="rcnt"]');
                rcnt.appendChild(newSidebar);
                sidebar = newSidebar;
            }
            // add gpt response div
            fetch(chrome.runtime.getURL('gpt-response.html'))
                .then(response => response.text())
                .then(data => {
                    const newElement = document.createElement('div');
                    newElement.innerHTML = data;
                    // 将新创建的div插入到父元素的最前面
                    if (sidebar.firstChild) {
                        sidebar.insertBefore(newElement, sidebar.firstChild);
                    } else {
                        // 如果parent没有子元素，就直接添加
                        sidebar.appendChild(newElement);
                    }
                })
                .catch(err => console.error(err));
        } else {
            gptResponseArea.innerText = message.text;
        }
    }
});

