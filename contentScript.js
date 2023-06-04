const database = require('./database.js');
(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if (obj.message === "Hello from dashboard!") {
            // Perform actions based on the message from dashboard.js
            // You can send a response back if needed using sendResponse
            response({ response: "Message received in contentscript.js!" });
        }
        console.log("call aya ka", type, value, videoId);
        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            database.deleteBookmarkDB(value).then(() => {
                fetchBookmarks().then((res) => {
                    response(res);
                })
            });
        } else if (type === "FETCH_DATA") {
            console.log("call aya fetch data ka", type, value, videoId);
            currentVideo = videoId
            fetchBookmarks().then((res) => {
                console.log("ye bhejna hai: ", res);
                response(res);
            })
        }
        return true;
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            database.fetchBookmarksDB(currentVideo).then((res) => {
                console.log("fetchBookmarksDB: ", currentVideo);
                console.log("fetchBookmarksDB: ", res);
                resolve(res.items ? res.items : []);
            });
        });
    }
    const newVideoLoaded = async () => {
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];

        if (youtubeLeftControls && youtubePlayer && currentVideo) {
            const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
            // console.log(bookmarkBtnExists);
            if (!bookmarkBtnExists) {
                await fetchBookmarks()
                const bookmarkBtn = document.createElement("img");

                bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
                bookmarkBtn.className = "ytp-button " + "bookmark-btn";
                bookmarkBtn.title = "Click to bookmark current timestamp";


                youtubeLeftControls.append(bookmarkBtn);
                bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
            }
        }
    }

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const duration = youtubePlayer.duration;
        console.log("currenttime: ", currentTime);
        const newBookmark = {
            bookmark_title: "test",
            bookmark_video_id: currentVideo,
            bookmark_description: "Bookmark at " + getTime(currentTime),
            bookmark_timestamp: currentTime,
        };
        database.addNewBookmarkDB(newBookmark).then((res) => {
            console.log("added to db", res);
        })

    }

    newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substring(19, 11)
}
