import PocketBase from './node_modules/pocketbase/dist/pocketbase.es.mjs';

const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

export const saveAuth = async (auth) => {
    pb.authStore.save(auth.token, auth.model)
}
// login
export const login = async ({ email, password }) => {
    console.log("ubu login", email, password);
    return new Promise((resolve, reject) => {
        pb.collection('users').authWithPassword(email, password)
            .then((user) => {
                resolve(user)
            })
            .catch((err) => {
                reject(err)
            });
    })
}
// signup
export const signup = async (user) => {
    return new Promise((resolve, reject) => {
        pb.collection('users').create(user)
            .then((res) => {
                // // (optional) send an email verification request
                // await pb.collection('users').requestVerification(res.email);
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            });
    })
}
// logout
export const logout = async () => {
    pb.authStore.clear()
}

export const fetchBookmarksDB = async (options = {}) => {
    const {
        video_id = "",
        page = 1,
        perPage = 50,
        expand = false
    } = options;
    let filter = {}
    if (video_id !== "") {
        filter = {
            expand: 'bookmark_video',
            filter: `bookmark_video.video_id="${video_id}"`
        }
    } else if (expand) {
        filter = {
            expand: 'bookmark_video,bookmark_video.video_channel',
        }
    }
    try {
        const bookmarksList = await pb.collection('bookmarks').getList(page, perPage, filter);
        return bookmarksList;
    } catch (err) {
        console.error("err fetchBookmarksDB: ", err);
        return []
    }
}

export const addNewBookmarkDB = async (bookmark) => {
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
        console.error("err addNewBookmarkDB: ", err);
    }
    return {}
}
export const deleteBookmarkDB = async (bookmark_record_id) => {
    try {
        await pb.collection('bookmarks').delete(bookmark_record_id);
    } catch (err) {
        console.error("err deleteBookmarkDB: ", err);
    }
}
export const viewBookmarkDB = async (bookmark_record_id) => {
    try {
        const record = await pb.collection('bookmarks').getOne(bookmark_record_id, {});
        return record
    } catch (err) {
        console.error("err viewBookmarkDB: ", err);
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
        console.error("err updateBookmarkDB: ", err);
    }
    return {}
}
export const fetchChannelsDB = async (page = 1, perPage = 50) => {
    try {
        const channelsList = await pb.collection('channels').getList(page, perPage);
        return channelsList;
    } catch (err) {
        console.error("err fetchChannelsDB: ", err);
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
        console.error("err addNewChannelDB: ", err);
    }
    return {}
}
export const deleteChannelDB = async (channel_record_id) => {
    try {
        await pb.collection('channels').delete(channel_record_id);
    } catch (err) {
        console.error("err deleteChannelDB: ", err);
    }
}
export const viewChannelDB = async (channel_record_id) => {
    try {
        const record = await pb.collection('channels').getOne(channel_record_id, {});
        return record
    } catch (err) {
        console.error("err viewChannelDB: ", err);
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
        console.error("err updateChannelDB: ", err);
    }
    return {}
}

export const viewChannelFromYTChannelIDDB = async (channel_id) => {
    return new Promise((resolve, reject) => {
        let filter = `channel_id="${channel_id}"`
        pb.collection('channels').getFirstListItem(filter, {})
            .then((res) => {
                resolve(res)
            })
            .catch((error) => {
                console.error("err fviewChannelFromYTChannelIDDB: ", error);
                reject(error)
            });
    })
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
        console.error("err updateVideoDB: ", err);
    }
    return {}
}
export const fetchVideossDB = async (channel_id, page = 1, perPage = 50) => {
    let filter = {}
    if (channel_id !== "") {
        filter = {
            expand: 'video_channel',
            filter: `video_channel.channel_id="${channel_id}"`
        }
    }
    console.log("fetchVideossDB filter: ", filter);
    try {
        const videoList = await pb.collection('videos').getList(page, perPage, filter);
        return videoList;
    } catch (err) {
        console.log("err fetchVideossDB: ", err);
        return []
    }
}
export const viewVideoFromYTVideoIDDB = async (video_id) => {
    // let filter = `video_id="${video_id}"`
    return new Promise((resolve, reject) => {
        let filter = `video_id="${video_id}"`
        pb.collection('videos').getFirstListItem(filter, {})
            .then((res) => {
                resolve(res)
            })
            .catch((error) => {
                console.error("err viewVideoFromYTVideoIDDB: ", error);
                reject(error)
            });
    })
}