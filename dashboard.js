import { fetchBookmarksDB, addNewBookmarkDB, deleteBookmarkDB, viewBookmarkDB, updateBookmarkDB } from './pb.js';

document.addEventListener("DOMContentLoaded", async () => {

    console.log("dashboard loaded");
    fetchBookmarks().then((res) => {
        console.log(res);
        $(document).ready(function () {
            var table;
            // Initialize DataTable
            table = $('#bookmarkTable').DataTable({
                data: res,
                columns: [
                    {
                        data: null, render: function (data, type, row) {
                            return '<input type="checkbox" class="checkbox">';
                        }
                    },
                    { data: 'title' },
                    { data: 'video_id' },
                    { data: 'description' },
                    { data: 'duration' },
                    { data: 'timestamp' },
                    { data: 'channel_name', defaultContent: "None" },
                    { data: 'channel_id', defaultContent: "None" },
                    {
                        data: null, render: function (data, type, row) {
                            return '<button class="btn btn-primary view-btn" data-toggle="modal" data-target="#viewModal">View</button> ' +
                                '<button class="btn btn-info update-btn">Update</button> ' +
                                '<button class="btn btn-danger delete-btn">Delete</button>';
                        }
                    }
                ]
            });
            // View button click event handler
            $('#bookmarkTable').on('click', '.view-btn', function () {
                // Get the data of the row
                var data = table.row($(this).closest('tr')).data();

                // Update the modal with row data
                $('#viewTitle').text(data.title);
                $('#viewVideoId').text(data.video_id);
                $('#viewDescription').text(data.description);
                $('#viewDuration').text(data.duration);
                $('#viewTimestamp').text(data.timestamp);
                $('#viewChannelName').text(data.channel_name);
                $('#viewChannelId').text(data.channel_id);

                // Show the modal
                $('#viewModal').modal('show');
            });
        });
    }).catch(error => console.error('Error:', error));
});
const fetchBookmarks = () => {
    return new Promise((resolve) => {
        fetchBookmarksDB("").then((res) => {
            console.log("fetchBookmarksDB: ", res);
            resolve(res.items ? res.items : []);
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
