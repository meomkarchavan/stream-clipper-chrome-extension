document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ getData: true }, function (response) {
        if (response.data) {
            const dataTable = document.getElementById('dataTable');
            const tbody = dataTable.getElementsByTagName('tbody')[0];

            response.data.forEach(function (item) {
                const row = document.createElement('tr');

                const titleCell = document.createElement('td');
                titleCell.textContent = item.title;
                row.appendChild(titleCell);

                const channelCell = document.createElement('td');
                channelCell.textContent = item.channel;
                row.appendChild(channelCell);

                const videoIDCell = document.createElement('td');
                videoIDCell.textContent = item.videoID;
                row.appendChild(videoIDCell);

                const durationCell = document.createElement('td');
                durationCell.textContent = item.duration;
                row.appendChild(durationCell);

                const startCell = document.createElement('td');
                startCell.textContent = item.timestamps.start;
                row.appendChild(startCell);

                const endCell = document.createElement('td');
                endCell.textContent = item.timestamps.end;
                row.appendChild(endCell);

                tbody.appendChild(row);
            });
        }
    });
});
