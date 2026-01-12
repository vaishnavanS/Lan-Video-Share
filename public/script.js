async function checkAuth() {
    try {
        const response = await fetch('/auth-status');
        const data = await response.json();

        if (data.authenticated) {
            showMainContent();
            loadVideos();
        } else {
            showLoginOverlay();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginOverlay();
    }
}

function showMainContent() {
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
}

function showLoginOverlay() {
    document.getElementById('loginOverlay').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
}

async function login() {
    const registerNumber = document.getElementById('regNo').value.trim();
    const password = document.getElementById('wifiPass').value.trim();
    const errorEl = document.getElementById('loginError');

    if (!/^71402\d{7}$/.test(registerNumber)) {
        errorEl.innerText = 'Register number must start with 71402 and be 12 digits.';
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registerNumber, password })
        });

        if (response.ok) {
            showMainContent();
            loadVideos();
        } else {
            const data = await response.json();
            errorEl.innerText = data.message || 'Invalid register number or password.';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorEl.innerText = 'Server error. Try again later.';
    }
}

async function logout() {
    try {
        await fetch('/logout', { method: 'POST' });
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function uploadVideo() {
    const input = document.getElementById('videoInput');
    const status = document.getElementById('status');

    if (!input.files[0]) {
        status.innerText = 'Please select a file first.';
        return;
    }

    const formData = new FormData();
    formData.append('video', input.files[0]);

    status.innerText = 'Uploading...';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            status.innerText = 'Uploaded successfully!';
            loadVideos();
        } else if (response.status === 401) {
            location.reload(); // Redirect to login if session expired
        } else {
            status.innerText = 'Upload failed.';
        }
    } catch (error) {
        console.error('Error:', error);
        status.innerText = 'Error uploading video.';
    }
}

async function loadVideos() {
    const videoList = document.getElementById('videoList');

    try {
        const response = await fetch('/videos');

        if (response.status === 401) {
            showLoginOverlay();
            return;
        }

        const videos = await response.json();

        videoList.innerHTML = '';
        videos.forEach(video => {
            const li = document.createElement('li');
            li.className = 'video-item';

            const link = document.createElement('a');
            link.href = `/download/${video}`;
            link.innerText = video;
            link.target = '_blank';

            li.appendChild(link);
            videoList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Initial load
checkAuth();
