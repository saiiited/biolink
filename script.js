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

// Initialize when the page loads
window.addEventListener('load', init);