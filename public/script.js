async function uploadFile() {
    const input = document.getElementById('fileInput');
    const status = document.getElementById('status');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const percentage = document.getElementById('percentage');

    if (!input.files[0]) {
        status.innerText = 'Please select a file first.';
        return;
    }

    const formData = new FormData();
    formData.append('file', input.files[0]);

    status.innerText = 'Uploading...';
    progressContainer.style.display = 'block';
    progressBar.value = 0;
    percentage.innerText = '0%';

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressBar.value = percentComplete;
            percentage.innerText = `${percentComplete}%`;
        }
    });

    xhr.onload = function () {
        if (xhr.status === 200) {
            status.innerText = 'Uploaded successfully!';
            loadFiles();
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 2000);
        } else {
            console.error('Upload failed with status:', xhr.status);
            status.innerText = `Upload failed (${xhr.status}).`;
        }
    };

    xhr.onerror = function () {
        console.error('Error during upload.');
        status.innerText = 'Error uploading file.';
    };

    xhr.open('POST', '/upload');
    xhr.send(formData);
}

async function loadFiles() {
    try {
        const response = await fetch('/files');
        const data = await response.json();
        console.log('Fetched files:', data);

        const sections = {
            video: document.getElementById('videoList'),
            audio: document.getElementById('audioList'),
            images: document.getElementById('imagesList'),
            others: document.getElementById('othersList')
        };

        // Clear all lists
        Object.values(sections).forEach(list => {
            if (list) list.innerHTML = '';
        });

        if (Array.isArray(data)) {
            // Fallback for old simple list format
            console.warn('Received old array format from server. Migration might be pending.');
            const othersList = sections.others;
            if (othersList) {
                data.forEach(file => {
                    appendFileToList(othersList, file);
                });
            }
        } else if (typeof data === 'object' && data !== null) {
            // New categorized format
            for (const [category, files] of Object.entries(data)) {
                const listElement = sections[category];
                if (!listElement) continue;

                if (files.length === 0) {
                    const li = document.createElement('li');
                    li.style.color = '#999';
                    li.style.padding = '10px';
                    li.innerText = 'No files available.';
                    listElement.appendChild(li);
                    continue;
                }

                files.forEach(file => {
                    appendFileToList(listElement, file);
                });
            }
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

function appendFileToList(listElement, file) {
    const li = document.createElement('li');
    li.className = 'video-item';

    const link = document.createElement('a');
    link.href = `/download/${encodeURIComponent(file)}`;
    link.innerText = file;
    link.target = '_blank';

    li.appendChild(link);
    listElement.appendChild(li);
}

// Initial load
loadFiles();
