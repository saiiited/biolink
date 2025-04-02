// Discord User ID - Replace with the actual Discord ID
const DISCORD_ID = '1234567890123456789'; // Replace with the actual Discord ID

// Lanyard API endpoints
const LANYARD_API = 'https://api.lanyard.rest/v1';
const LANYARD_SOCKET = 'wss://api.lanyard.rest/socket';

// DOM Elements
const avatarElement = document.getElementById('avatar');
const usernameElement = document.getElementById('username');
const discordTagElement = document.getElementById('discord-tag');
const statusIndicatorElement = document.getElementById('status-indicator');
const statusTextElement = document.getElementById('status-text');
const spotifySection = document.getElementById('spotify-section');
const albumArtElement = document.getElementById('album-art');
const songTitleElement = document.getElementById('song-title');
const artistNameElement = document.getElementById('artist-name');
const activitySection = document.getElementById('activity-section');
const activitiesContainer = document.getElementById('activities-container');

// Audio Player Elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressBar = document.getElementById('progress');
const currentTimeElement = document.getElementById('current-time');
const durationElement = document.getElementById('duration');
const trackSelector = document.getElementById('track-selector');
const trackTitleElement = document.getElementById('track-title');

// Initialize WebSocket connection
let socket;
let heartbeatInterval;

// Status mapping
const statusMap = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline'
};

// Initialize the page
function init() {
    // First, try to get data via REST API
    fetchUserData();
    
    // Then, establish WebSocket connection for real-time updates
    connectWebSocket();
    
    // Initialize audio player
    initAudioPlayer();
}

// Fetch user data via REST API
async function fetchUserData() {
    try {
        const response = await fetch(`${LANYARD_API}/users/${DISCORD_ID}`);
        const data = await response.json();
        
        if (data.success) {
            updateUI(data.data);
        } else {
            console.error('Failed to fetch user data:', data);
            showError('Failed to load user data. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showError('Failed to load user data. Please try again later.');
    }
}

// Connect to Lanyard WebSocket
function connectWebSocket() {
    socket = new WebSocket(LANYARD_SOCKET);
    
    socket.onopen = () => {
        console.log('Connected to Lanyard WebSocket');
        
        // Subscribe to user updates
        socket.send(
            JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_ids: [DISCORD_ID]
                }
            })
        );
        
        // Set up heartbeat interval
        heartbeatInterval = setInterval(() => {
            socket.send(JSON.stringify({ op: 3 }));
        }, 30000);
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.op) {
            case 0:
                // Initial connection established
                break;
            case 1:
                // Heartbeat ACK
                break;
            case 0:
                // Event
                if (data.t === 'PRESENCE_UPDATE' && data.d.user_id === DISCORD_ID) {
                    updateUI(data.d);
                }
                break;
        }
    };
    
    socket.onclose = () => {
        console.log('Disconnected from Lanyard WebSocket');
        clearInterval(heartbeatInterval);
        
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
    };
}

// Update UI with user data
function updateUI(data) {
    // Update avatar
    if (data.discord_user && data.discord_user.avatar) {
        const avatarHash = data.discord_user.avatar;
        const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${avatarHash}.${avatarHash.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        avatarElement.src = avatarUrl;
    }
    
    // Update username and tag
    if (data.discord_user) {
        usernameElement.textContent = data.discord_user.username;
        discordTagElement.textContent = `#${data.discord_user.discriminator}`;
    }
    
    // Update status
    if (data.discord_status) {
        // Remove all status classes
        statusIndicatorElement.classList.remove('online', 'idle', 'dnd', 'offline');
        // Add current status class
        statusIndicatorElement.classList.add(data.discord_status);
        
        // Update status text
        statusTextElement.textContent = statusMap[data.discord_status] || 'Unknown';
        
        // Add custom status if available
        if (data.discord_status !== 'offline' && data.activities) {
            const customStatus = data.activities.find(activity => activity.type === 4);
            if (customStatus && customStatus.state) {
                statusTextElement.textContent = customStatus.state;
            }
        }
    }
    
    // Update Spotify section
    if (data.spotify) {
        spotifySection.style.display = 'block';
        
        // Update album art
        if (data.spotify.album_art_url) {
            albumArtElement.src = data.spotify.album_art_url;
        }
        
        // Update song info
        songTitleElement.textContent = data.spotify.song || 'Unknown Song';
        artistNameElement.textContent = data.spotify.artist || 'Unknown Artist';
    } else {
        spotifySection.style.display = 'none';
    }
    
    // Update activities
    if (data.activities && data.activities.length > 0) {
        activitySection.style.display = 'block';
        
        // Clear previous activities
        activitiesContainer.innerHTML = '';
        
        // Filter out Spotify and Custom Status activities
        const filteredActivities = data.activities.filter(
            activity => activity.type !== 4 && activity.type !== 2
        );
        
        if (filteredActivities.length > 0) {
            // Add each activity
            filteredActivities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                // Activity icon
                let iconUrl = 'https://placehold.co/50x50';
                if (activity.application_id && activity.assets && activity.assets.large_image) {
                    iconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                }
                
                activityItem.innerHTML = `
                    <img src="${iconUrl}" alt="${activity.name}" class="activity-icon">
                    <div class="activity-details">
                        <h3>${activity.name}</h3>
                        <p>${activity.details || ''}</p>
                        <p>${activity.state || ''}</p>
                    </div>
                `;
                
                activitiesContainer.appendChild(activityItem);
            });
        } else {
            activitySection.style.display = 'none';
        }
    } else {
        activitySection.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    usernameElement.textContent = 'Error';
    discordTagElement.textContent = '';
    statusTextElement.textContent = message;
    spotifySection.style.display = 'none';
    activitySection.style.display = 'none';
}

// Initialize Audio Player
function initAudioPlayer() {
    // Set initial volume
    audioPlayer.volume = volumeSlider.value / 100;
    
    // Play/Pause button event
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Track selector event
    trackSelector.addEventListener('change', changeTrack);
    
    // Mute button event
    muteBtn.addEventListener('click', toggleMute);
    
    // Volume slider event
    volumeSlider.addEventListener('input', changeVolume);
    
    // Progress bar events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    
    // Click on progress bar to seek
    document.querySelector('.progress-bar').addEventListener('click', seek);
    
    // Track ended event
    audioPlayer.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressBar.style.width = '0%';
        currentTimeElement.textContent = '0:00';
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (!audioPlayer.src) {
        // If no track is selected, select the first one
        if (trackSelector.options.length > 1) {
            trackSelector.selectedIndex = 1;
            changeTrack();
        } else {
            return;
        }
    }
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Change track
function changeTrack() {
    const selectedTrack = trackSelector.value;
    if (selectedTrack) {
        audioPlayer.src = selectedTrack;
        trackTitleElement.textContent = trackSelector.options[trackSelector.selectedIndex].text;
        audioPlayer.load();
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

// Toggle mute
function toggleMute() {
    audioPlayer.muted = !audioPlayer.muted;
    if (audioPlayer.muted) {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Change volume
function changeVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
    if (audioPlayer.volume === 0) {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Update progress bar
function updateProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    const progressPercent = (currentTime / duration) * 100;
    
    progressBar.style.width = `${progressPercent}%`;
    
    // Update current time display
    currentTimeElement.textContent = formatTime(currentTime);
}

// Update duration display
function updateDuration() {
    durationElement.textContent = formatTime(audioPlayer.duration);
}

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Seek to position in audio
function seek(e) {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    audioPlayer.currentTime = percent * audioPlayer.duration;
}

// Initialize when the page loads
window.addEventListener('load', init);