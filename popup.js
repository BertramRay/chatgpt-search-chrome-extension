// popup.js
console.log('chatgpt-search-chrome-extension/popup.js loaded');
document.getElementById('save').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.local.set({'openai_api_key': apiKey}, function() {
        console.log('API Key saved.');
    });
});
