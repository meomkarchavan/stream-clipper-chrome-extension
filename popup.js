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
const addDashBoardButton = () => { }
// const 
const checkShowLogin = () => {
    return new Promise(async (resolve, reject) => {
        const activeTab = await getActiveTabURL();
        chrome.tabs.sendMessage(activeTab.id, {
            type: "SHOWLOGIN",
        }, (res) => {
            console.log("show login response", res);
            if (res == undefined) {

            }
            resolve(res);
        });
    });
};
const login = async () => {
    const activeTab = await getActiveTabURL();
    var user = { email: "", password: "" }
    const emailElement = document.getElementById("login-email");
    user.email = emailElement.value
    const passwordElement = document.getElementById("login-password");
    user.password = passwordElement.value
    // console.log(user);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "LOGIN",
        value: user,
    }, (res) => {
        console.log("got login", res);
        // user = res
        hideLoginSignUp()
        showLogOut();
        showDashboardButton()
        showPopUp();
        return res
    });
}
const signup = async () => {
    const activeTab = await getActiveTabURL();

    var user = {
        "email": "",
        "emailVisibility": true,
        "password": "",
        "passwordConfirm": "",
    };
    const emailElement = document.getElementById("signup-email");
    user.email = emailElement.value
    const passwordElement = document.getElementById("signup-password");
    user.password = passwordElement.value
    const confirmPasswordElement = document.getElementById("signup-passwordConfirm");
    user.passwordConfirm = confirmPasswordElement.value
    console.log(user);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "SIGNUP",
        value: user,
    }, (res) => {
        console.log("got SIGNUP", res);
        // user = res
        hideLoginSignUp()
        showLogOut();
        showDashboardButton()
        showPopUp();
        return res
    });
}
const logout = async () => {
    console.log("logout clicked");
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "LOGOUT",
    });
    hideLogOut()
    hideDashboardButton()
    hidePopUp();
    showLoginSignUp();
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("loaded");
    checkShowLogin().then((showLogin) => {
        console.log("final show login:", showLogin);
        if (showLogin) {
            hidePopUp();
            showLoginSignUp();
        } else {
            showDashboardButton();
            console.log("not showwung this", showLogin);
            if (showLogin === undefined) {
                hidePopUp()
            } else {
                showLogOut();
                showPopUp();
            }
        }
    });
});

async function showPopUp() {
    const main = document.getElementById("main");
    main.classList.remove('hidden')

    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    const heading = document.getElementById("heading");
    heading.innerHTML = '<div class="title">Logged In</div>'
    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.tabs.sendMessage(activeTab.id, {
            type: "FETCH_DATA",
            videoId: currentVideo,
        }, viewBookmarks);
    } else {
        const heading = document.getElementById("heading");
        heading.innerHTML = '<div class="title">This is not a Youtube Video Page</div>'
        // chrome.tabs.sendMessage(activeTab.id, {
        //     type: "FETCH_DATA",
        //     videoId: currentVideo,
        // }, viewBookmarks);
    }
}
function hidePopUp() {
    const main = document.getElementById("main");
    while (!main.classList.contains("hidden")) {
        main.classList.add('hidden')
    }
}
function showLogOut() {
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.classList.remove('hidden')
    document.getElementById("logout-btn").addEventListener("click", logout);
}
function hideLogOut() {
    const logoutBtn = document.getElementById("logout-btn");
    while (!logoutBtn.classList.contains("hidden")) {
        logoutBtn.classList.add('hidden')
    }
}

function showDashboardButton() {
    const dashboardButton = document.getElementById("openDashboardButton");
    dashboardButton.classList.remove('hidden')
    document.getElementById("openDashboardButton").addEventListener("click", openDashboard);
}
function hideDashboardButton() {
    const dashboardButton = document.getElementById("openDashboardButton");
    while (!dashboardButton.classList.contains("hidden")) {
        dashboardButton.classList.add('hidden')
    }
}
function showLoginSignUp() {
    const heading = document.getElementById("heading");
    heading.innerHTML = '<div class="title">Not Logged In</div>';

    const loginForm = document.getElementById("login-form");
    loginForm.classList.remove('hidden')

    document.getElementById("login-btn").addEventListener("click", login);
    document.getElementById("signup-btn").addEventListener("click", signup);
}
function hideLoginSignUp() {
    const loginForm = document.getElementById('login-form');
    while (!loginForm.classList.contains("hidden")) {
        loginForm.classList.add('hidden')
    }
}

function openDashboard() {
    // Open a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
}
