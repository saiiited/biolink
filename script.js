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
const playPauseBtn = document.querySelector('.play-pause');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const progressBar = document.querySelector('.progress');
const currentTimeEl = document.querySelector('.current-time');
const totalTimeEl = document.querySelector('.total-time');

// Sample tracks
const tracks = [
    {
        title: 'cobain - Lil Peep, Lil Tracy',
        src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
        img: 'https://placehold.co/80x80'
    },
    {
        title: 'hkmori - anybody can find love (except you)',
        src: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_200a51a6d6.mp3',
        img: 'https://placehold.co/80x80'
    },
    {
        title: 'Chill Vibes - Lofi Beat',
        src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e9d46af4.mp3',
        img: 'https://placehold.co/80x80'
    }
];

let currentTrackIndex = 0;

// Initialize the page
function init() {
    // Initialize audio player
    initAudioPlayer();
    
    // Set up event listeners for server cards
    setupServerCards();
}

// Initialize Audio Player
function initAudioPlayer() {
    // Load the first track
    loadTrack(currentTrackIndex);
    
    // Play/Pause button event
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Previous track button
    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        audioPlayer.play();
    });
    
    // Next track button
    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        audioPlayer.play();
    });
    
    // Progress bar events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Click on progress bar to seek
    document.querySelector('.progress-bar').addEventListener('click', seek);
    
    // Track ended event
    audioPlayer.addEventListener('ended', () => {
        // Auto play next track
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        audioPlayer.play();
    });
}

// Load track
function loadTrack(index) {
    const track = tracks[index];
    audioPlayer.src = track.src;
    document.querySelector('.track-title').textContent = track.title;
    document.querySelector('.album-art').src = track.img;
    
    // Reset progress
    progressBar.style.width = '0%';
    
    // Update play/pause button
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    // Load audio
    audioPlayer.load();
    
    // Update total time after metadata is loaded
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Update progress bar and time
function updateProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    const progressPercent = (currentTime / duration) * 100;
    
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
}

// Format time in MM:SS
function formatTime(seconds) {
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

// Set up server cards
function setupServerCards() {
    // Join button functionality
    const joinButton = document.querySelector('.join-button');
    if (joinButton) {
        joinButton.addEventListener('click', () => {
            alert('Joining server...');
            // Here you would typically redirect to a Discord invite link
        });
    }
}

// Initialize when the page loads
window.addEventListener('load', init);