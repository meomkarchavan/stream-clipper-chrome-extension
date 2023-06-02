let storedData;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.data) {
        storedData = request.data;
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getData) {
        sendResponse({ data: storedData });
    }
});
