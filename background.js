chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.url.includes("github.infra.cloudera.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content-script.js']
        });
    }
});

// First, remove any existing dynamic rules to avoid conflicts.
chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1], // Remove the rule with ID 1 if it already exists
    addRules: [{
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
            "urlFilter": "*://github.infra.cloudera.com/*",
            "resourceTypes": ["image", "media"]
        }
    }]
}).then(() => {
    console.log('Dynamic rules updated successfully.');
}).catch((error) => {
    console.error('Error updating dynamic rules:', error);
});
