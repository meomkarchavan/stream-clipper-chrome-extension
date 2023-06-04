import { getActiveTabURL } from "./utils.js";
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarkElement, bookmark) => {

    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");

    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.bookmark_description;
    bookmarkTitleElement.className = "bookmark-title";

    controlsElement.className = "bookmark-controls";

    newBookmarkElement.id = bookmark.id;
    // newBookmarkElement.textContent = bookmark.timestamp;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.bookmark_timestamp)
    newBookmarkElement.setAttribute("id", bookmark.id)

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.appendChild(bookmarkTitleElement)
    newBookmarkElement.appendChild(controlsElement)
    bookmarkElement.appendChild(newBookmarkElement)
};

const viewBookmarks = (currentVideoBookmarks = []) => {
    console.log("view bookmarks was called: ", currentVideoBookmarks);
    const bookmarkElement = document.getElementById("bookmarks");
    bookmarkElement.innerHTML = "";
    if (currentVideoBookmarks.length > 0) {
        for (let i = 0; i < currentVideoBookmarks.length; i++) {
            const bookmark = currentVideoBookmarks[i];
            addNewBookmark(bookmarkElement, bookmark)
        }
    } else {
        bookmarkElement.innerHTML = '<i class="row">No Bookmarks to show</i>'
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    });
};

const onDelete = async e => {
    const bookmarkID = e.target.parentNode.parentNode.getAttribute("id");
    const activeTab = await getActiveTabURL();
    const bookmarkElementToDelete = document.getElementById(bookmarkID);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkID,
    }, viewBookmarks);

};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    console.log("loaded");
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");
    console.log("currentVideo: ", currentVideo);

    document.getElementById('openDashboardButton').addEventListener('click', openDashboard);

    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.tabs.sendMessage(activeTab.id, {
            type: "FETCH_DATA",
            videoId: currentVideo,
        }, viewBookmarks);
    } else if (window.location.hash == '#window') {
        const container = document.getElementsByClassName("container")[0];
        // Call the function to load the external HTML file
        loadExternalHTML(container);
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<button id="openDashboardButton">Open Dashboard</button><div class="title">This is not a Youtube Video Page</div>'
        document.getElementById('openDashboardButton').addEventListener('click', openDashboard);
    }


});
// Function to load the content of the external HTML file
function loadExternalHTML(element) {
    fetch('./dashboard.html')
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading external HTML:', error);
        });
}

function openDashboard() {
    // chrome.tabs.create({ url: chrome.runtime.getURL('popup.html#window') });
    // Open a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
}
