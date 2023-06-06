import * as database from './database.js';
(async () => {
    let showLogin = false;
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";

    let currentVideoObj = {};
    // let currentChannelObj = {};
    // check auth
    const checkAuth = () => {
        // if user is not logged in, show login / signup page
        const authStr = window.localStorage.getItem('pocketbase_auth')
        console.log("checking auth", window.localStorage.getItem('pocketbase_auth'));
        if (!authStr) {
            return true
        } else {
            // resume session
            const auth = JSON.parse(authStr)
            console.log("checking auth", auth);
            database.saveAuth(auth)
            return false
        }
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
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
        } else if (type === "SHOWLOGIN") {
            showLogin = checkAuth()
            console.log("shhowing login page", showLogin);
            response(showLogin)
        } else if (type === "LOGIN") {
            console.log("ider to aya");
            database.login(value).then((res) => {
                showLogin = false
                response(res)
            }).catch((err) => {
                throw err
            })
        } else if (type === "SIGNUP") {
            database.signup(value).then((res) => {
                showLogin = false
                response(res)
            }).catch((err) => {
                throw err
            })
        } else if (type === "LOGOUT") {
            database.logout().then((res) => {
                showLogin = true
                response(showLogin)
                // console.log(res);
            })
        }
        return true;
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            database.fetchBookmarksDB({ video_id: currentVideo }).then((res) => {
                resolve(res.items ? res.items : []);
            });
        });
    }
    const newVideoLoaded = async () => {
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];
        var channel = getChannelDetails()

        if (youtubeLeftControls && youtubePlayer && currentVideo && channel && channel.isValid) {
            console.log("getChannelDetails", channel)
            await saveVideoDetails(currentVideo, channel).then(async () => {
                console.log("***********callling fetchbookmarks************");
                await fetchBookmarks()
            }).catch((err) => {
                console.log("hehe");
            })
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
        // createBookmarkModal()
        // Prompt the user for input
        const title = window.prompt('Enter bookmark title:');
        // const description = window.prompt('Enter bookmark description:');
        // const tags = window.prompt('Enter bookmark tags (comma-separated):').split(',');

        // Do something with the bookmark data, e.g., store it or perform further actions
        console.log('Bookmark title:', title);
        // console.log('Bookmark description:', description);
        // console.log('Bookmark tags:', tags);
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            bookmark_title: title,
            bookmark_video_id: currentVideo,
            bookmark_description: "Bookmark at " + getTime(currentTime),
            bookmark_timestamp: currentTime,
            bookmark_video: currentVideoObj.id
        };
        database.addNewBookmarkDB(newBookmark).then((res) => {
            console.log("added to db", res);
        })
    }
    function getChannelUsername() {
        // Find the element containing the username
        var usernameElement = document.querySelector('ytd-video-owner-renderer a.yt-simple-endpoint');

        if (usernameElement) {
            // Extract the username from the element's href attribute
            var href = usernameElement.getAttribute('href');
            var username = href.split('/@')[1];
            return username;
        }

        // Username not found
        return '';
    }
    const getChannelDetails = () => {
        // Get the channel name
        var channelNameElement = document.querySelector('.ytd-channel-name a');
        var channelName = channelNameElement ? channelNameElement.textContent.trim() : '';

        // Get the channel ID
        var channelId = getChannelUsername();
        var isValid = false;
        if (channelId != '' && channelName != '') {
            isValid = true
        }
        // Return the channel Details as an object
        return {
            isValid: isValid,
            channel_name: channelName,
            channel_id: channelId
        };
    }
    const fetchVideoDetails = () => {
        var videoTitleElement = document.querySelector("#title > h1 > yt-formatted-string");
        var videoTitle = videoTitleElement ? videoTitleElement.textContent.trim() : '';
        var videoDescriptionElement = document.querySelector('#description.ytd-video-secondary-info-renderer');
        var videoDescription = videoDescriptionElement ? videoDescriptionElement.textContent.trim() : '';
        // var videoDurationElement = document.querySelector('span.ytp-time-duration');
        // var videoDuration = videoDurationElement ? videoDurationElement.textContent.trim() : '';
        var videoUrl = getVideoUrl();

        // example create data
        const video = {
            "video_url": videoUrl,
            "video_title": videoTitle,
            "video_duration": 0,
            "video_description": videoDescription,
        };
        console.log(video);
        // const video = {
        //     "video_url": "videoUrl",
        //     "video_title": "videoTitle",
        //     "video_duration": 123,
        //     "video_description": "videoDescription",
        // };
        return video
    }
    const saveChannelDetails = (channel) => {
        console.log("saveChannelDetails: ", channel);
        return new Promise((resolve, reject) => {
            console.log("saveChannelDetails viewChannelFromYTChannelIDDB: ", channel);
            database.viewChannelFromYTChannelIDDB(channel.channel_id).then((res) => {
                if (res) {
                    // currentChannelObj = res
                    resolve(res)
                }
            }).catch((err) => {
                if (err.status == 404) {
                    database.addNewChannelDB(channel).then((res) => {
                        console.log("addNewChannelDB res: ", res);
                        // currentChannelObj = res
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
    const saveVideoDetails = async (video_id, channel) => {
        console.log("umput: ", video_id, channel);
        const duration = youtubePlayer.duration;
        saveChannelDetails(channel)
            .then((channel) => {
                var videoDetails = fetchVideoDetails()
                videoDetails.video_duration = duration
                videoDetails.video_id = video_id;
                videoDetails.video_channel = channel.id
                console.log("saveChannelDetails videoDetails: ", videoDetails);
                database.viewVideoFromYTVideoIDDB(videoDetails.video_id).then((res) => {
                    if (res) {
                        //do something i guess
                        currentVideoObj = res
                        return res
                    }
                }).catch((err) => {
                    if (err.status == 404) {
                        database.addNewVideoDB(videoDetails).then((res) => {
                            currentVideoObj = res
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
