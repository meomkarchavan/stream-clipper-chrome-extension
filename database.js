import PocketBase from './node_modules/pocketbase/dist/pocketbase.es.mjs';

// const pb = new PocketBase('https://cliper-backend.fly.dev/')
const pb = new PocketBase('http://127.0.0.1:8090')

pb.autoCancellation(false);
// pb.
export const saveAuth = async (auth) => {
    pb.authStore.save(auth.token, auth.model)
}
// login
export const login = async ({ email, password }) => {
    // console.log("ubu login", email, password);
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

export const fetchBookmarksDB = async ({ video_id = "", page = 1, perPage = 50, expand = false }) => {
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
        const res = await pb.collection('bookmarks').getList(page, perPage, filter);
        return res;
    } catch (err) {
        // console.error("err fetchBookmarksDB: ", err);
        return {
            isError: true,
            error: err,
            items: []
        }
    }
}

export const addNewBookmarkDB = async (newBookmark) => {
    // const bookmark = {
    //     "bookmark_title": "test title",
    //     "bookmark_video_id": "test video id",
    //     "bookmark_description": "test description",
    //     "bookmark_timestamp": 123
    // };
    newBookmark.user = pb.authStore.baseModel.id;
    try {
        const bookmark = await pb.collection('bookmarks').create(newBookmark);
        return {
            bookmark
        }
    } catch (err) {
        // console.error("err addNewBookmarkDB: ", err);
        return {
            isError: true,
            error: err,
            bookmark: {}
        }
    }
}
export const deleteBookmarkDB = async (bookmark_record_id) => {
    try {
        const res = await pb.collection('bookmarks').delete(bookmark_record_id);
        if (res === null) {
            return {
                isError: false,
                error: null
            }
        } else {
            return {
                isError: true,
                error: res
            }
        }
    } catch (err) {
        // console.error("err deleteBookmarkDB: ", err);
        return {
            isError: true,
            error: err
        }
    }
}
export const viewBookmarkDB = async (bookmark_record_id) => {
    try {
        const bookmark = await pb.collection('bookmarks').getOne(bookmark_record_id, {});
        return { bookmark }
    } catch (err) {
        // console.error("err viewBookmarkDB: ", err);
        return {
            isError: true,
            error: err,
            bookmark: {}
        }
    }
}
export const updateBookmarkDB = async (bookmark_record_id, updatedBookmark) => {
    try {
        const bookmark = await pb.collection('bookmarks').update(bookmark_record_id, updatedBookmark);
        return {
            bookmark
        }
    } catch (err) {
        // console.error("err updateBookmarkDB: ", err);
        return {
            isError: true,
            error: err,
            bookmark: {}
        }
    }
}
export const fetchChannelsDB = async (page = 1, perPage = 50) => {
    try {
        const channelsList = await pb.collection('channels').getList(page, perPage);
        return channelsList;
    } catch (err) {
        // console.error("err fetchChannelsDB: ", err);
        return {
            isError: true,
            error: err,
            items: []
        }
    }
}

export const addNewChannelDB = async (newChannel) => {
    // console.log("addNewChannelDB: ", channel);
    // const channel = {
    //     "channel_name": "test channel",
    //     "channel_id": "test channel id",
    // };
    try {
        const channel = await pb.collection('channels').create(newChannel);
        return {
            channel
        }
    } catch (err) {
        // console.error("err addNewChannelDB: ", err);
        return {
            isError: true,
            error: err,
            channel: {}
        }
    }
}
export const deleteChannelDB = async (channel_record_id) => {
    try {
        const res = await pb.collection('channels').delete(channel_record_id);
        if (res === null) {
            return {
                isError: false
            }
        } else {
            return {
                isError: true,
                error: res
            }
        }
    } catch (err) {
        return {
            isError: true,
            error: err,
        }
        // console.error("err deleteChannelDB: ", err);
    }
}
export const viewChannelDB = async (channel_record_id) => {
    try {
        const channel = await pb.collection('channels').getOne(channel_record_id, {});
        return { channel }
    } catch (err) {
        // console.error("err viewChannelDB: ", err);
        return {
            isError: true,
            error: err,
            channel: {}
        }
    }
}
export const updateChannelDB = async (channel_record_id, updatedChannel) => {
    // const channel = {
    //     "id": "test id",
    //     "channel_name": "test channel",
    //     "channel_id": "test channel id",
    // };
    try {
        const channel = await pb.collection('channels').update(channel_record_id, updatedChannel);
        return { channel }
    } catch (err) {
        // console.error("err updateChannelDB: ", err);
        return {
            isError: true,
            error: err,
            channel: {}
        }
    }

}

export const viewChannelFromYTChannelIDDB = async (channel_id) => {
    return new Promise((resolve, reject) => {
        let filter = `channel_id="${channel_id}"`
        pb.collection('channels').getFirstListItem(filter, {})
            .then((res) => {
                resolve(res)
            })
            .catch((error) => {
                // console.error("err fviewChannelFromYTChannelIDDB: ", error);
                reject(error)
            });
    })
}


export const addNewVideoDB = async (newVideo) => {
    // console.log("addNewVideoDB: ", video);
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
        const video = await pb.collection('videos').create(newVideo);
        return { video }
    } catch (err) {
        // console.log("err addNewVideoDB: ", err);
        return {
            isError: true,
            error: err,
            video: {}
        }
    }
}
export const deleteVideoDB = async (video_record_id) => {
    try {
        const res = await pb.collection('bookmarks').delete(video_record_id);
        if (res === null) {
            return {
                isError: false
            }
        } else {
            return {
                isError: true,
                error: res
            }
        }
    } catch (err) {
        // console.log("err deleteVideoDB: ", err);
        return {
            isError: true,
            error: err,
        }
    }
}
export const viewVideoDB = async (video_record_id) => {
    try {
        const video = await pb.collection('videos').getOne(video_record_id, {});
        return { video }
    } catch (err) {
        // console.log("err viewVideoDB: ", err);
        return {
            isError: true,
            error: err,
            video: {}
        }
    }
}
export const updateVideDB = async (video_record_id, updatedVideo) => {
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
        const video = await pb.collection('videos').update(video_record_id, updatedVideo);
        return { video }
    } catch (err) {
        // console.error("err updateVideoDB: ", err);
        return {
            isError: true,
            error: err,
            video: {}
        }
    }
}
export const fetchVideossDB = async (channel_id, page = 1, perPage = 50) => {
    let filter = {}
    if (channel_id !== "") {
        filter = {
            expand: 'video_channel',
            filter: `video_channel.channel_id="${channel_id}"`
        }
    }
    // console.log("fetchVideossDB filter: ", filter);
    try {
        const videoList = await pb.collection('videos').getList(page, perPage, filter);
        return videoList;
    } catch (err) {
        // console.log("err fetchVideossDB: ", err);
        return {
            isError: true,
            error: err,
            items: []
        }
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