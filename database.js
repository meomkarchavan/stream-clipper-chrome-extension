import PocketBase from './node_modules/pocketbase/dist/pocketbase.es.mjs';
const pb = new PocketBase('http://127.0.0.1:8090');
// pb.autoCancellation(false);

export const fetchBookmarksDB = async (video_id, page = 1, perPage = 50) => {
    let filter = {}
    if (video_id !== "") {
        filter = {
            expand: 'bookmark_video_id',
            filter: `bookmark_video_id.video_id="${video_id}"`
        }
    }
    console.log("filter: ", filter);
    try {
        const bookmarksList = await pb.collection('bookmarks').getList(page, perPage, filter);
        return bookmarksList;
    } catch (err) {
        console.log("err fetchBookmarksDB: ", err);
        return []
    }
}

export const addNewBookmarkDB = async (bookmark) => {
    console.log("addNewBookmarkDB: ", bookmark);
    // const bookmark = {
    //     "bookmark_title": "test title",
    //     "bookmark_video_id": "test video id",
    //     "bookmark_description": "test description",
    //     "bookmark_timestamp": 123
    // };
    try {
        const record = await pb.collection('bookmarks').create(bookmark);
        return record
    } catch (err) {
        console.log("err addNewBookmarkDB: ", err);
    }
    return {}
}
export const deleteBookmarkDB = async (bookmark_record_id) => {
    try {
        await pb.collection('bookmarks').delete(bookmark_record_id);
    } catch (err) {
        console.log("err deleteBookmarkDB: ", err);
    }
}
export const viewBookmarkDB = async (bookmark_record_id) => {
    try {
        const record = await pb.collection('bookmarks').getOne(bookmark_record_id, {});
        return record
    } catch (err) {
        console.log("err viewBookmarkDB: ", err);
    }
    return {}
}
export const updateBookmarkDB = async (bookmark_record_id, bookmark) => {
    // const bookmark = {
    //     "id": "test_id",
    //     "bookmark_title": "test title",
    //     "bookmark_video_id": "test video id",
    //     "bookmark_description": "test description",
    //     "bookmark_timestamp": 123
    // };
    try {
        const record = await pb.collection('bookmarks').update(bookmark_record_id, bookmark);
        return record
    } catch (err) {
        console.log("err updateBookmarkDB: ", err);
    }
    return {}
}
export const fetchChannelsDB = async (page = 1, perPage = 50) => {
    try {
        const channelsList = await pb.collection('channels').getList(page, perPage);
        return channelsList;
    } catch (err) {
        console.log("err fetchChannelsDB: ", err);
        return []
    }
}

export const addNewChannelDB = async (channel) => {
    console.log("addNewChannelDB: ", channel);
    // const channel = {
    //     "channel_name": "test channel",
    //     "channel_id": "test channel id",
    // };
    try {
        const record = await pb.collection('channels').create(channel);
        return record
    } catch (err) {
        console.log("err addNewChannelDB: ", err);
    }
    return {}
}
export const deleteChannelDB = async (channel_record_id) => {
    try {
        await pb.collection('channels').delete(channel_record_id);
    } catch (err) {
        console.log("err deleteChannelDB: ", err);
    }
}
export const viewChannelDB = async (channel_record_id) => {
    try {
        const record = await pb.collection('channels').getOne(channel_record_id, {});
        return record
    } catch (err) {
        console.log("err viewChannelDB: ", err);
    }
    return {}
}
export const updateChannelDB = async (channel_record_id, channel) => {
    // const channel = {
    //     "id": "test id",
    //     "channel_name": "test channel",
    //     "channel_id": "test channel id",
    // };
    try {
        const record = await pb.collection('channels').update(channel_record_id, channel);
        return record
    } catch (err) {
        console.log("err updateChannelDB: ", err);
    }
    return {}
}

export const viewChannelFromYTChannelIDDB = async (channel_id) => {
    let filter = {
        filter: `channel_id="${channel_id}"`
    }
    console.log("filter: ", filter);
    try {
        const channel = await pb.collection('channels').getFirstListItem(filter, {});
        return channel;
    } catch (err) {
        console.log("err viewChannelFromYTChannelIDDB: ", err);
        return {}
    }
}


export const addNewVideoDB = async (video) => {
    console.log("addNewVideoDB: ", video);
    // const video = {
    //     "video_url": "test",
    //     "video_title": "test",
    //     "video_duration": 123,
    //     "video_description": "test",
    //     "video_category": "RELATION_RECORD_ID",
    //     "video_id": "test",
    //     "user_id": "RELATION_RECORD_ID",
    //     "video_channel_id": "RELATION_RECORD_ID"
    // };
    try {
        const record = await pb.collection('videos').create(video);
        return record
    } catch (err) {
        console.log("err addNewVideoDB: ", err);
    }
    return {}
}
export const deleteVideoDB = async (video_record_id) => {
    try {
        await pb.collection('bookmarks').delete(video_record_id);
    } catch (err) {
        console.log("err deleteVideoDB: ", err);
    }
}
export const viewVideoDB = async (video_record_id) => {
    try {
        const record = await pb.collection('videos').getOne(video_record_id, {});
        return record
    } catch (err) {
        console.log("err viewVideoDB: ", err);
    }
    return {}
}
export const updateVideDB = async (video_record_id, video) => {
    // const video = {
    //     "video_url": "test",
    //     "video_title": "test",
    //     "video_duration": 123,
    //     "video_description": "test",
    //     "video_category": "RELATION_RECORD_ID",
    //     "video_id": "test",
    //     "user_id": "RELATION_RECORD_ID",
    //     "video_channel_id": "RELATION_RECORD_ID"
    // };
    try {
        const record = await pb.collection('videos').update(video_record_id, video);
        return record
    } catch (err) {
        console.log("err updateVideoDB: ", err);
    }
    return {}
}
export const fetchVideossDB = async (channel_id, page = 1, perPage = 50) => {
    let filter = {}
    if (channel_id !== "") {
        filter = {
            expand: 'video_channel_id',
            filter: `video_channel_id.channel_id="${channel_id}"`
        }
    }
    console.log("filter: ", filter);
    try {
        const videoList = await pb.collection('videos').getList(page, perPage, filter);
        return videoList;
    } catch (err) {
        console.log("err fetchVideossDB: ", err);
        return []
    }
}