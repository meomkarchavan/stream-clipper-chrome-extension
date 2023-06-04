import PocketBase from './node_modules/pocketbase/dist/pocketbase.es.mjs';
const pb = new PocketBase('http://127.0.0.1:8090');
// pb.autoCancellation(false);

export const fetchBookmarksDB = async (video_id, page = 1, perPage = 50) => {
    let filter = {}
    if (video_id !== "") {
        filter = { filter: `video_id="${video_id}"` }
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
    //     "title": "test title",
    //     "video_id": "test video id",
    //     "description": "test description",
    //     "duration": 123,
    //     "timestamp": 123
    // };
    try {
        const record = await pb.collection('bookmarks').create(bookmark);
        return record
    } catch (err) {
        console.log("err addNewBookmarkDB: ", err);
    }
    return {}
}
export const deleteBookmarkDB = async (bookmark_id) => {
    try {
        await pb.collection('bookmarks').delete(bookmark_id);
    } catch (err) {
        console.log("err deleteBookmarkDB: ", err);
    }
}
export const viewBookmarkDB = async (bookmark_id) => {
    try {
        const record = await pb.collection('bookmarks').getOne(bookmark_id, {});
        return record
    } catch (err) {
        console.log("err viewBookmarkDB: ", err);
    }
    return {}
}
export const updateBookmarkDB = async (bookmark_id, bookmark) => {
    // const bookmark = {
    //     "id": "test_id",
    //     "title": "test title",
    //     "video_id": "test video id",
    //     "description": "test description",
    //     "duration": 123,
    //     "timestamp": 123
    // };
    try {
        const record = await pb.collection('bookmarks').update(bookmark_id, bookmark);
        return record
    } catch (err) {
        console.log("err updateBookmarkDB: ", err);
    }
    return {}
}
export const fetchChannlesDB = async (page = 1, perPage = 50) => {
       try {
        const bookmarksList = await pb.collection('bookmarks').getList(page, perPage);
        return bookmarksList;
    } catch (err) {
        console.log("err fetchBookmarksDB: ", err);
        return []
    }
}

// export const addNewBookmarkDB = async (bookmark) => {
//     console.log("addNewBookmarkDB: ", bookmark);
//     // const bookmark = {
//     //     "title": "test title",
//     //     "video_id": "test video id",
//     //     "description": "test description",
//     //     "duration": 123,
//     //     "timestamp": 123
//     // };
//     try {
//         const record = await pb.collection('bookmarks').create(bookmark);
//         return record
//     } catch (err) {
//         console.log("err addNewBookmarkDB: ", err);
//     }
//     return {}
// }
// export const deleteBookmarkDB = async (bookmark_id) => {
//     try {
//         await pb.collection('bookmarks').delete(bookmark_id);
//     } catch (err) {
//         console.log("err deleteBookmarkDB: ", err);
//     }
// }
// export const viewBookmarkDB = async (bookmark_id) => {
//     try {
//         const record = await pb.collection('bookmarks').getOne(bookmark_id, {});
//         return record
//     } catch (err) {
//         console.log("err viewBookmarkDB: ", err);
//     }
//     return {}
// }
// export const updateBookmarkDB = async (bookmark_id, bookmark) => {
//     // const bookmark = {
//     //     "id": "test_id",
//     //     "title": "test title",
//     //     "video_id": "test video id",
//     //     "description": "test description",
//     //     "duration": 123,
//     //     "timestamp": 123
//     // };
//     try {
//         const record = await pb.collection('bookmarks').update(bookmark_id, bookmark);
//         return record
//     } catch (err) {
//         console.log("err updateBookmarkDB: ", err);
//     }
//     return {}
// }