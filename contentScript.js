// Array to store video details with timestamps
var videoDataArray = [];

// Function to retrieve the YouTube video URL
function getVideoUrl() {
    return window.location.href;
}
function getVideoId(url) {
    // Regular expression pattern to match the video ID
    var pattern = /(?:\?v=|&v=|youtu\.be\/|\/v\/|\/embed\/|\/watch\?v=|\/watch\?.+&v=|\/videos\/|\/embed\/|\/v\/|e\/|youtu\.be\/|v=)([^&\n?#]+)/;
  
    // Extract the video ID from the URL
    var match = url.match(pattern);
  
    if (match && match[1]) {
      return match[1];
    } else {
      return null; // No video ID found
    }
  }
// Function to retrieve video details from the YouTube player
function getVideoDetails() {
    var titleElement = document.querySelector('.title > .ytd-video-primary-info-renderer');
    var videoTitle = titleElement ? titleElement.textContent.trim() : '';

    var channelElement = document.querySelector('.ytd-channel-name > .yt-simple-endpoint');
    var channelName = channelElement ? channelElement.textContent.trim() : '';

    var videoDetails = {
        title: videoTitle,
        channel: channelName,
        videoID: getVideoId(getVideoUrl())
    };

    return videoDetails;
}

// Function to get time range for the current time stamp
function getTimeRange(currentTime, duration) {
    var startTime = Math.max(0, currentTime - 10); // 10 seconds before the current time
    var endTime = Math.min(duration, currentTime + 10); // 10 seconds after the current time

    return {
        start: startTime,
        end: endTime
    };
}

// Function to update the timestamp of the video details
function updateTimestamp() {
    var player = document.querySelector('video');
    if (player && player.currentTime) {
        var currentTime = player.currentTime;
        var duration = player.duration;
        var details = getVideoDetails();
        details.duration = duration;
        details.timestamps = getTimeRange(currentTime, duration);
        videoDataArray.push(details);
        console.log(videoDataArray);
        sendVideoData();
    }
}

// Function to send video data to the extension popup
function sendVideoData() {
    console.log(chrome);
    chrome.runtime.sendMessage({ data: videoDataArray });
    // chrome.runtime.sendMessage({ action: 'videoData', data: videoDataArray });
}

// Add an event listener to capture the key press event
document.addEventListener('keydown', function (event) {
    // Check if the "S" key is pressed
    if (event.key === 's' || event.key === 'S') {
        updateTimestamp();
    }
});

// Send initial video details to the extension popup
sendVideoData();
// setTimeout(updateTimestamp, 3000)