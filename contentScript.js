import * as database from './database.js';
(async () => {
    let showLogin = false;
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let current_user = null;
    let currentVideoObj = {};
    // let currentChannelObj = {};
    // check auth
    const checkAuth = () => {
        // if user is not logged in, show login / signup page
        const authStr = window.localStorage.getItem('pocketbase_auth')
        // console.log("checking auth", window.localStorage.getItem('pocketbase_auth'));
        if (!authStr) {
            return true, null
        } else {
            // resume session
            const auth = JSON.parse(authStr)
            // console.log("checking auth", auth);
            database.saveAuth(auth)
            return false, auth
        }
    }
    showLogin, current_user = checkAuth()
    // console.log("at start", showLogin, current_user);

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            database.deleteBookmarkDB(value).then((res) => {
                if (res && res.isError) {
                    response(res.error)
                } else {
                    fetchBookmarks().then((res) => {
                        response(res);
                    })
                }
            });
        } else if (type === "FETCH_DATA") {
            currentVideo = videoId
            fetchBookmarks().then((res) => {
                response(res);
            })
        } else if (type === "SHOWLOGIN") {
            var data = checkAuth()
            // console.log("showlign req: ", data);
            if (data) {
                response({ showLogin: false, current_user: data.model })
            } else {
                response({ showLogin: true, current_user: current_user })
            }
            // console.log("shhowing login page", showLogin);
        } else if (type === "LOGIN") {
            // console.log("ider to aya");
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
    const addInputForm = () => {
        // Find the element with ID "related"
        const relatedElement = document.getElementById("related");

        // Check if the element exists
        if (relatedElement) {
            const formContainerExists = document.getElementById("clipper-yt-form-container");
            if (!formContainerExists) {
                injectCSS("./static/bootstrap.min.css");
                injectCSS("./tags.css");
                const script = document.createElement("script");
                script.src = chrome.runtime.getURL('./tags.js');
                document.head.appendChild(script);

                // Create a new div element for the form container
                const formContainer = document.createElement("div");
                formContainer.innerHTML = `
                <div class="container my-4" id="clipper-yt-form-container">
                    <input type="text" placeholder="Add a title" class="form-control mb-3">
                    <textarea placeholder="Add a description" class="form-control mb-3"></textarea>
                    <input type="text" id="tag-input1">

                    <button class="btn btn-primary mt-3">Submit</button>
                </div>
                `
                // <link rel="stylesheet" href="./static/bootstrap.min.css">
                // <link rel="stylesheet" href="./tags.css">
                // <script src="./tags.js"></script>`
                // formContainer.classList.add("container", "my-4");
                // formContainer.id = "clipper-yt-form-container";

                // // Create the input elements
                // const titleInput = document.createElement("input");
                // titleInput.setAttribute("type", "text");
                // titleInput.setAttribute("placeholder", "Add a title");
                // titleInput.classList.add("form-control", "mb-3");

                // const descriptionInput = document.createElement("textarea");
                // descriptionInput.setAttribute("placeholder", "Add a description");
                // descriptionInput.classList.add("form-control", "mb-3");

                // const tagsInput = document.createElement("input");
                // tagsInput.setAttribute("type", "text");
                // tagsInput.setAttribute("placeholder", "Add tags");
                // tagsInput.classList.add("form-control", "mb-3");

                // // Create a button for submitting the form
                // const submitButton = document.createElement("button");
                // submitButton.innerText = "Submit";
                // submitButton.classList.add("btn", "btn-primary");


                // // Append the input elements to the form container
                // formContainer.appendChild(titleInput);
                // formContainer.appendChild(descriptionInput);
                // formContainer.appendChild(tagsInput);
                // formContainer.appendChild(submitButton);

                // // Get the parent element and insert the form container at the beginning of its children
                const parentElement = relatedElement.parentNode;
                parentElement.insertBefore(formContainer, parentElement.firstChild);
            }
        }

    }
    // Inject CSS file into the page
    function injectCSS(cssFile) {
        // console.log("INJETC");
        const link = document.createElement("link");
        link.href = chrome.runtime.getURL(cssFile);
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            database.fetchBookmarksDB({ video_id: currentVideo }).then((res) => {
                // console.log("fetchBookmarksDB", res);
                // if (res && res.isError) {
                //     resolve(res.error)
                // } else {
                resolve(res.items ? res.items : []);
                // }
            });
        });
    }
    const newVideoLoaded = async () => {
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];
        var channel = getChannelDetails()
        if (youtubeLeftControls && youtubePlayer && currentVideo && channel && channel.isValid) {
            // console.log("getChannelDetails", channel)
            await saveVideoDetails(currentVideo, channel).then(async () => {
                // console.log("***********callling fetchbookmarks************");
                await fetchBookmarks()
            }).catch((err) => {
                // console.log("hehe");
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
            bookmark_description: "Bookmark at " + getTime(currentTime),
            bookmark_timestamp: currentTime,
            bookmark_video: currentVideoObj.id
        };
        console.log(newBookmark,currentVideoObj);
        database.addNewBookmarkDB(newBookmark).then((res) => {
            if (res && res.isError) {
                return res.error
            } else {
                return res.bookmark
            }
            // console.log("added to db", res);
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
        // console.log(video);
        // const video = {
        //     "video_url": "videoUrl",
        //     "video_title": "videoTitle",
        //     "video_duration": 123,
        //     "video_description": "videoDescription",
        // };
        return video
    }
    const saveChannelDetails = (channel) => {
        // console.log("saveChannelDetails: ", channel);
        return new Promise((resolve, reject) => {
            // console.log("saveChannelDetails viewChannelFromYTChannelIDDB: ", channel);
            database.viewChannelFromYTChannelIDDB(channel.channel_id).then((res) => {
                if (res) {
                    // currentChannelObj = res
                    resolve(res)
                }
            }).catch((err) => {
                if (err.status == 404) {
                    database.addNewChannelDB(channel).then((res) => {
                        // console.log("addNewChannelDB res: ", res);
                        // currentChannelObj = res
                        if (res && res.isError) {
                            resolve(res.error)
                        } else {
                            resolve(res.channel)
                        }
                    })
                } else {
                    // console.error("viewChannelFromYTChannelIDDB: ", err)
                    throw err;
                }
            })
        })
    }
    const saveVideoDetails = async (video_id, channel) => {
        // console.log("umput: ", video_id, channel);
        const duration = youtubePlayer.duration;
        saveChannelDetails(channel)
            .then((channel) => {
                var videoDetails = fetchVideoDetails()
                videoDetails.video_duration = duration
                videoDetails.video_id = video_id;
                videoDetails.video_channel = channel.id
                // console.log("saveChannelDetails videoDetails: ", videoDetails);
                database.viewVideoFromYTVideoIDDB(videoDetails.video_id).then((res) => {
                    if (res) {
                        //do something i guess
                        currentVideoObj = res
                        return res
                    }
                }).catch((err) => {
                    if (err.status == 404) {
                        database.addNewVideoDB(videoDetails).then((res) => {
                            if (res && res.isError) {
                                return res.error
                            } else {
                                currentVideoObj = res
                                return res
                            }
                        })
                    } else {
                        // console.error("viewVideoFromYTVideoIDDB: ", err)
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
