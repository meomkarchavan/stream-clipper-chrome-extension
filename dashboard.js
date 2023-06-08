import * as database from './database.js';

document.addEventListener("DOMContentLoaded", async () => {
    var current_user_data = {}
    // console.log("dashboard loaded");
    fetchBookmarks().then((res) => {

        //tranform data before addding to table
        var data = transformObject(res);
        var current_user_data
        // console.log(data);
        // Initialize DataTable
        $(document).ready(function () {
            var table;
            // Initialize DataTable
            table = $('#bookmarkTable').DataTable({
                data: data,
                responsive: true,
                pagination: true,
                columns: [
                    {
                        data: null, render: function (data, type, row) {
                            return '<input type="checkbox" class="checkbox">';
                        }
                    },
                    { data: 'bookmark_video.video_channel.channel_name' },
                    { data: 'bookmark_video.video_title' },
                    { data: 'bookmark_title' },
                    { data: 'bookmark_video.video_url' },
                    { data: 'bookmark_description' },
                    { data: 'bookmark_timestamp' },
                    {
                        data: null, render: function (data, type, row) {
                            let actions = '<button class="btn btn-primary view-btn" data-toggle="modal" data-target="#viewModal">View</button> '
                                +
                                '<button class="btn btn-danger delete-btn" disabled>Delete</button>';
                            return actions
                        }
                    }
                ]
            });
            // View button click event handler
            $('#bookmarkTable').on('click', '.view-btn', function () {
                // Get the data of the row
                var data = table.row($(this).closest('tr')).data();

                $('#viewID').val(data.id);
                $('#viewTitle').val(data.bookmark_title);
                $('#viewDescription').val(data.bookmark_description);
                $('#viewTimestamp').val(data.bookmark_timestamp);
                $('#viewVideoId').val(data.bookmark_video.video_id);
                $('#viewUserId').val(data.user);
                $('#viewChannelId').val(data.bookmark_video.video_channel.channel_id);
                $('#viewChannelName').val(data.bookmark_video.video_channel.channel_name);
                $('#viewVideoDescription').val(data.bookmark_video.video_description);
                $('#viewVideoDuration').val(data.bookmark_video.video_duration);
                $('#viewVideoTitle').val(data.bookmark_video.video_title);
                $('#viewVideoUrl').val(data.bookmark_video.video_url);

                // Show the modal
                $('#viewModal').modal('show');

                // Update button click event handler
                $('#updateBtn').on('click', function () {
                    // Handle update functionality
                    // You can access the row data here and perform the update operation
                });

                // Delete button click event handler
                $('#deleteBtn').on('click', function () {
                    // Handle delete functionality
                    // You can access the row data here and perform the delete operation
                });
            });
        });
    }).catch(error => console.error('Error:', error));
});
const fetchBookmarks = () => {
    return new Promise((resolve) => {
        database.fetchBookmarksDB({ expand: true }).then((res) => {
            // if (res && res.isError) {
            //     resolve(res.error)
            // } else {
            resolve(res.items ? res.items : []);
            // }
        });
    });
}
async function performBulkOperation(table, action) {
    // Get all the selected checkboxes
    var checkboxes = $('.checkbox:checked');

    // Check if any checkboxes are selected
    if (checkboxes.length > 0) {
        // Create an array to store the IDs of the selected rows
        var selectedIds = [];

        // Iterate over the selected checkboxes
        checkboxes.each(function () {
            // Get the data of the row associated with the checkbox
            var data = table.row($(this).closest('tr')).data();

            // Push the ID of the row to the selectedIds array
            selectedIds.push(data.id);
        });

        // Perform the bulk operation with the selected IDs
        // Replace this with your own implementation
        console.log('Performing bulk operation with IDs:', selectedIds);
        return await action(selectedIds);
    } else {
        // No checkboxes are selected
        console.log('No checkboxes selected');
    }
}

function transformObject(obj) {
    // Iterate through each key in the object
    for (let key in obj) {
        if (key === 'expand' && obj[key]) {
            // Get the parent key from the nested "expand" object
            const parentKey = Object.keys(obj[key])[0];

            // Move the nested "expand" object one level up and replace the value
            obj[parentKey] = obj[key][parentKey];

            // Recursively transform the nested "expand" object
            transformObject(obj[parentKey]);

            // Remove the "expand" key
            delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively transform the nested objects
            transformObject(obj[key]);
        }
    }

    return obj;
}
