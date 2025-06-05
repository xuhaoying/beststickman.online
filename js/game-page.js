// Game Page JavaScript Functionality
class GamePage {
    constructor(gameData) {
        this.gameData = gameData;
        this.userRating = 0;
        this.isFavorite = false;
        this.comments = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.setupSearch();
    }

    setupEventListeners() {
        // Star rating system
        const stars = document.querySelectorAll('#starRating span');
        stars.forEach(star => {
            star.addEventListener('click', (e) => this.setRating(e.target.dataset.rating));
            star.addEventListener('mouseover', (e) => this.highlightStars(e.target.dataset.rating));
        });

        document.getElementById('starRating').addEventListener('mouseleave', () => {
            this.highlightStars(this.userRating);
        });

        // Review form
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.submitReview(e));
        }

        // Comment form
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.submitComment(e));
        }

        // Game controls
        const playButton = document.querySelector('[onclick="playGame()"]');
        if (playButton) {
            playButton.onclick = () => this.playGame();
        }

        const favoriteButton = document.querySelector('[onclick="toggleFavorite()"]');
        if (favoriteButton) {
            favoriteButton.onclick = () => this.toggleFavorite();
        }

        const shareButton = document.querySelector('[onclick="shareGame()"]');
        if (shareButton) {
            shareButton.onclick = () => this.shareGame();
        }

        const fullscreenButton = document.querySelector('[onclick="toggleFullscreen()"]');
        if (fullscreenButton) {
            fullscreenButton.onclick = () => this.toggleFullscreen();
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('gameSearch');
        const mobileSearchInput = document.getElementById('mobileGameSearch');
        
        [searchInput, mobileSearchInput].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => this.performSearch(e.target.value));
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.navigateToSearch(e.target.value);
                    }
                });
            }
        });
    }

    performSearch(query) {
        if (query.length < 2) return;
        
        // Implement search suggestions
        // This would typically call an API endpoint
        console.log('Searching for:', query);
    }

    navigateToSearch(query) {
        if (query.trim()) {
            window.location.href = `/search/?q=${encodeURIComponent(query.trim())}`;
        }
    }

    setRating(rating) {
        this.userRating = parseInt(rating);
        this.highlightStars(rating);
        this.updateRatingText(rating);
        this.saveRating(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('#starRating span');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.classList.add('text-yellow-400');
            } else {
                star.textContent = '☆';
                star.classList.remove('text-yellow-400');
            }
        });
    }

    updateRatingText(rating) {
        const ratingText = document.getElementById('ratingText');
        const ratings = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        if (ratingText) {
            ratingText.textContent = ratings[rating] || 'Click to rate';
        }
    }

    async saveRating(rating) {
        try {
            const response = await fetch('/api/games/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: this.gameData.id,
                    rating: rating
                })
            });
            
            if (response.ok) {
                this.showNotification('Rating saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving rating:', error);
            this.showNotification('Failed to save rating', 'error');
        }
    }

    async submitReview(e) {
        e.preventDefault();
        
        const title = document.getElementById('reviewTitle').value;
        const text = document.getElementById('reviewText').value;
        
        if (!title.trim() || !text.trim()) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (this.userRating === 0) {
            this.showNotification('Please rate the game first', 'error');
            return;
        }

        try {
            const response = await fetch('/api/games/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: this.gameData.id,
                    title: title,
                    text: text,
                    rating: this.userRating
                })
            });
            
            if (response.ok) {
                this.showNotification('Review submitted successfully!', 'success');
                document.getElementById('reviewForm').reset();
                this.loadComments(); // Refresh comments
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            this.showNotification('Failed to submit review', 'error');
        }
    }

    async submitComment(e) {
        e.preventDefault();
        
        const text = document.getElementById('commentText').value;
        const hasSpoilers = document.getElementById('spoilerAlert').checked;
        
        if (!text.trim()) {
            this.showNotification('Please enter a comment', 'error');
            return;
        }

        try {
            const response = await fetch('/api/games/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: this.gameData.id,
                    text: text,
                    hasSpoilers: hasSpoilers
                })
            });
            
            if (response.ok) {
                this.showNotification('Comment posted successfully!', 'success');
                document.getElementById('commentText').value = '';
                document.getElementById('spoilerAlert').checked = false;
                this.loadComments(); // Refresh comments
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showNotification('Failed to post comment', 'error');
        }
    }

    async loadComments() {
        try {
            const response = await fetch(`/api/games/${this.gameData.id}/comments`);
            if (response.ok) {
                this.comments = await response.json();
                this.renderComments();
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    renderComments() {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        if (this.comments.length === 0) {
            commentsList.innerHTML = '<p class="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        commentsList.innerHTML = this.comments.map(comment => `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <img src="${comment.avatar || '/images/avatar-placeholder.png'}" alt="${comment.username}" class="w-10 h-10 rounded-full">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium">${comment.username}</span>
                            ${comment.rating ? `<div class="flex items-center text-sm"><span class="text-yellow-400 mr-1">⭐</span><span>${comment.rating}/5</span></div>` : ''}
                            <span class="text-sm text-gray-500">${this.formatDate(comment.created_at)}</span>
                        </div>
                        ${comment.title ? `<h4 class="font-medium mb-2">${comment.title}</h4>` : ''}
                        <div class="text-gray-700 dark:text-gray-300 ${comment.hasSpoilers ? 'spoiler-content' : ''}">
                            ${comment.hasSpoilers ? '<span class="spoiler-warning">⚠️ Spoiler Alert - Click to reveal</span>' : ''}
                            <p>${comment.text}</p>
                        </div>
                        <div class="flex items-center gap-4 mt-3">
                            <button onclick="likeComment(${comment.id})" class="text-sm text-gray-500 hover:text-apple-blue flex items-center gap-1">
                                👍 <span>${comment.likes || 0}</span>
                            </button>
                            <button onclick="replyToComment(${comment.id})" class="text-sm text-gray-500 hover:text-apple-blue">
                                💬 Reply
                            </button>
                            <button onclick="reportComment(${comment.id})" class="text-sm text-gray-500 hover:text-red-500">
                                🚩 Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add spoiler functionality
        this.setupSpoilerTags();
    }

    setupSpoilerTags() {
        document.querySelectorAll('.spoiler-content').forEach(spoiler => {
            const warning = spoiler.querySelector('.spoiler-warning');
            const content = spoiler.querySelector('p');
            
            if (warning && content) {
                content.style.display = 'none';
                warning.style.cursor = 'pointer';
                warning.addEventListener('click', () => {
                    content.style.display = 'block';
                    warning.style.display = 'none';
                });
            }
        });
    }

    playGame() {
        const gameFrame = document.getElementById('gameFrame');
        const gameContainer = document.getElementById('gameContainer');
        
        if (gameFrame && gameContainer) {
            gameContainer.scrollIntoView({ behavior: 'smooth' });
            
            // Track play event
            this.trackGamePlay();
        }
    }

    async trackGamePlay() {
        try {
            await fetch('/api/games/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: this.gameData.id
                })
            });
        } catch (error) {
            console.error('Error tracking game play:', error);
        }
    }

    toggleFavorite() {
        this.isFavorite = !this.isFavorite;
        const favoriteButton = document.querySelector('[onclick="toggleFavorite()"]');
        
        if (favoriteButton) {
            if (this.isFavorite) {
                favoriteButton.innerHTML = '❤️ Favorited';
                favoriteButton.classList.add('bg-apple-red', 'text-white');
                favoriteButton.classList.remove('bg-gray-200', 'dark:bg-gray-700');
            } else {
                favoriteButton.innerHTML = '❤️ Favorite';
                favoriteButton.classList.remove('bg-apple-red', 'text-white');
                favoriteButton.classList.add('bg-gray-200', 'dark:bg-gray-700');
            }
        }
        
        this.saveFavorite();
        this.showNotification(
            this.isFavorite ? 'Added to favorites!' : 'Removed from favorites!',
            'success'
        );
    }

    async saveFavorite() {
        try {
            await fetch('/api/games/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: this.gameData.id,
                    isFavorite: this.isFavorite
                })
            });
        } catch (error) {
            console.error('Error saving favorite:', error);
        }
    }

    shareGame() {
        if (navigator.share) {
            navigator.share({
                title: this.gameData.title,
                text: `Check out ${this.gameData.title} - a free online game!`,
                url: window.location.href
            });
        } else {
            this.copyGameLink();
        }
    }

    copyGameLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Game link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }

    toggleFullscreen() {
        const gameFrame = document.getElementById('gameFrame');
        
        if (!document.fullscreenElement) {
            gameFrame.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    loadUserPreferences() {
        // Load user rating
        const savedRating = localStorage.getItem(`game_rating_${this.gameData.id}`);
        if (savedRating) {
            this.setRating(parseInt(savedRating));
        }

        // Load favorite status
        const savedFavorite = localStorage.getItem(`game_favorite_${this.gameData.id}`);
        if (savedFavorite === 'true') {
            this.toggleFavorite();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Social sharing functions
function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareToTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this amazing game: ${document.title}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareToWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this amazing game: ${document.title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

// Lightbox functions
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
    }
}

// Comment interaction functions
async function likeComment(commentId) {
    try {
        const response = await fetch(`/api/comments/${commentId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            // Refresh comments to show updated like count
            if (window.gamePage) {
                window.gamePage.loadComments();
            }
        }
    } catch (error) {
        console.error('Error liking comment:', error);
    }
}

function replyToComment(commentId) {
    // Implementation for replying to comments
    console.log('Reply to comment:', commentId);
}

function reportComment(commentId) {
    if (confirm('Are you sure you want to report this comment?')) {
        fetch(`/api/comments/${commentId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (response.ok) {
                alert('Comment reported successfully');
            }
        }).catch(error => {
            console.error('Error reporting comment:', error);
        });
    }
}

// Initialize game page
function initGamePage(gameData) {
    window.gamePage = new GamePage(gameData);
}

// Setup rating system
function setupRatingSystem() {
    // Already handled in GamePage constructor
}

// Setup share buttons
function setupShareButtons() {
    // Already handled in GamePage constructor
}

// Load comments
function loadComments() {
    if (window.gamePage) {
        window.gamePage.loadComments();
    }
} 