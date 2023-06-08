export async function getActiveTabURL() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab
}

// Function to export CSV file
export const exportCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Initiate download
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    });
}
export const generateTimestampCSV = (data) => {
    console.log(data);
    const bufferSize = 10

    // Group the data by bookmark_video
    const groupedData = {};
    data.forEach(item => {
        if (!groupedData[item.bookmark_video]) {
            groupedData[item.bookmark_video] = [];
        }
        groupedData[item.bookmark_video].push(item);
    });

    // Calculate start and end times for each grouped video
    const rows = [];
    for (const videoId in groupedData) {
        const sortedItems = groupedData[videoId].sort((a, b) => a.bookmark_timestamp - b.bookmark_timestamp);
        // let prevEndTime = null;
        sortedItems.forEach(item => {
            const startTime = item.bookmark_timestamp - bufferSize;
            const endTime = item.bookmark_timestamp + bufferSize;
            rows.push([item.bookmark_timestamp, Math.max(0, startTime), endTime, item.bookmark_video, item.bookmark_title, item.id]);
        });
    }

    // Prepare CSV content with header
    const header = ['TimeStamp', 'Start Time', 'End Time', 'Video ID', 'Bookmark Title', 'Bookmark ID'];
    const csvContent = [header, ...rows].map(row => row.join(',')).join('\n');

    return csvContent;
}