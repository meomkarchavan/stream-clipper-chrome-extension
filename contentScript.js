import * as database from './database.js';
(async () => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if (obj.message === "Hello from dashboard!") {
            // Perform actions based on the message from dashboard.js
            // You can send a response back if needed using sendResponse
            response({ response: "Message received in contentscript.js!" });
        }
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
            currentVideo = videoId
            fetchBookmarks().then((res) => {
                response(res);
            })
        }
        return true;
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            database.fetchBookmarksDB(currentVideo).then((res) => {
                resolve(res.items ? res.items : []);
            });
        });
    }
    const newVideoLoaded = async () => {
        await saveVideoDetails("video_id").then(async () => {
            // await fetchBookmarks()
        })
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];

        if (youtubeLeftControls && youtubePlayer && currentVideo) {
            const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
            // console.log(bookmarkBtnExists);
            if (!bookmarkBtnExists) {
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
        const newBookmark = {
            bookmark_title: "test",
            bookmark_video_id: currentVideo,
            bookmark_description: "Bookmark at " + getTime(currentTime),
            bookmark_timestamp: currentTime,
        };
        database.addNewBookmarkDB(newBookmark).then((res) => {
            // console.log("added to db", res);
        })

    }
    function getChannelUsername() {
        // Find the element containing the username
        var usernameElement = document.querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string');

        if (usernameElement) {
            // Extract the username from the element's href attribute
            var href = usernameElement.getAttribute('href');
            var username = href.split('/@')[1];

            return username;
        }

        // Username not found
        return null;
    }
    const getChannelDetails = () => {
        // // Get the channel name
        // var channelNameElement = document.querySelector('.ytd-channel-name a');
        // var channelName = channelNameElement ? channelNameElement.textContent.trim() : '';

        // // Get the channel ID
        // var channelId = getChannelUsername();

        // Return the channel Details as an object
        return {
            channel_name: "channelName",
            channel_id: "channelId"
        };
    }
    const fetchVideoDetails = () => {
        // var videoTitleElement = document.querySelector('h1.title');
        // var videoTitle = videoTitleElement ? videoTitleElement.textContent.trim() : '';
        // var videoDescriptionElement = document.querySelector('#description.ytd-video-secondary-info-renderer');
        // var videoDescription = videoDescriptionElement ? videoDescriptionElement.textContent.trim() : '';
        // var videoDurationElement = document.querySelector('span.ytp-time-duration');
        // var videoDuration = videoDurationElement ? videoDurationElement.textContent.trim() : '';
        // var videoUrl = getVideoUrl();

        // example create data
        const video = {
            "video_url": "videoUrl",
            "video_title": "videoTitle",
            "video_duration": 123,
            "video_description": "videoDescription",
        };
        return video
    }
    const saveChannelDetails = (channel) => {
        return new Promise((resolve, reject) => {
            database.viewChannelFromYTChannelIDDB(channel.channel_id).then((res) => {
                if (res) {
                    resolve(res)
                }
            }).catch((err) => {
                if (err.status == 404) {
                    database.addNewChannelDB(channel).then((res) => {
                        console.error("addNewChannelDB res: ", res);
                        resolve(res)
                    }).catch((err) => {
                        console.error("addNewChannelDB", (err))
                        throw err;
                    })
                } else {
                    console.error("viewChannelFromYTChannelIDDB: ", err)
                    throw err;
                }
            })
        })
    }
    const saveVideoDetails = async (video_id) => {
        var channel = getChannelDetails()
        saveChannelDetails(channel)
            .then((channel_record_id) => {
                var videoDetails = fetchVideoDetails()
                videoDetails.video_id = video_id;
                videoDetails.video_channel_id = channel_record_id
                database.viewVideoFromYTVideoIDDB(videoDetails.video_id).then((res) => {
                    if (res) {
                        //do something i guess
                        return res
                    }
                }).catch((err) => {
                    if (err.status == 404) {
                        database.addNewVideoDB(videoDetails).then((res) => {
                            return res
                        }).catch((err) => {
                            console.error("addNewVideoDB", err)
                            throw err;
                        })
                    } else {
                        console.error("viewVideoFromYTVideoIDDB: ", err)
                        throw err;
                    }
                })

            })
    }
    // Get the video URL from the YouTube video watch page DOM
    function getVideoUrl() {
        // Get the video URL
        var videoUrlElement = document.querySelector('link[itemprop="url"]');
        var videoUrl = videoUrlElement ? videoUrlElement.getAttribute('href') : '';

        // Return the video URL
        return videoUrl;
    }


    newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substring(19, 11)
}
