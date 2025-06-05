class CategoryPage {
    constructor(options) {
        this.category = options.category;
        this.title = options.title;
        this.color = options.color;
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.games = [];
        this.filteredGames = [];
        this.currentView = 'grid'; // grid or list
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGames();
        this.setupSearch();
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('difficultyFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('subgenreFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('ratingFilter')?.addEventListener('change', () => this.applyFilters());
        
        // Sort event listener
        document.getElementById('sortBy')?.addEventListener('change', () => this.applySorting());
        
        // View toggle
        document.getElementById('viewToggle')?.addEventListener('click', () => this.toggleView());
        
        // Load more button
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => this.loadMoreGames());
        
        // Search functionality
        document.getElementById('gameSearch')?.addEventListener('input', (e) => this.searchGames(e.target.value));
    }

    setupSearch() {
        const searchInput = document.getElementById('gameSearch');
        if (searchInput) {
            searchInput.placeholder = `Search ${this.title.toLowerCase()}...`;
            
            // Debounce search
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchGames(e.target.value);
                }, 300);
            });
        }
    }

    async loadGames() {
        // In a real application, this would fetch from an API
        // For now, we'll use mock data
        this.games = this.getMockGames();
        this.filteredGames = [...this.games];
        this.renderGames();
        this.updateGameCount();
    }

    getMockGames() {
        // Mock data for demonstration
        const actionGames = [
            {
                id: 'super-fighter',
                title: 'Super Fighter',
                description: 'Epic fighting game with amazing combos and special moves.',
                image: '/images/action-game-1.jpg',
                rating: 4.8,
                reviews: 156,
                plays: 12500,
                tags: ['Fighting', '2D', 'Combos'],
                difficulty: 'medium',
                subgenre: 'fighting',
                isHot: true,
                isNew: false,
                releaseDate: '2024-01-15'
            },
            {
                id: 'space-shooter',
                title: 'Space Shooter',
                description: 'Defend Earth from alien invasion in this intense shooter.',
                image: '/images/action-game-2.jpg',
                rating: 4.6,
                reviews: 89,
                plays: 8200,
                tags: ['Shooter', 'Space', 'Retro'],
                difficulty: 'hard',
                subgenre: 'shooter',
                isHot: false,
                isNew: false,
                releaseDate: '2024-02-20'
            },
            {
                id: 'ninja-runner',
                title: 'Ninja Runner',
                description: 'Fast-paced parkour game with ninja skills and obstacles.',
                image: '/images/action-game-3.jpg',
                rating: 4.9,
                reviews: 67,
                plays: 3100,
                tags: ['Platformer', 'Ninja', 'Runner'],
                difficulty: 'easy',
                subgenre: 'platformer',
                isHot: false,
                isNew: true,
                releaseDate: '2024-03-10'
            },
            {
                id: 'battle-arena',
                title: 'Battle Arena',
                description: 'Intense multiplayer battles in various combat arenas.',
                image: '/images/action-game-4.jpg',
                rating: 4.7,
                reviews: 134,
                plays: 9800,
                tags: ['Multiplayer', 'Combat', 'Arena'],
                difficulty: 'hard',
                subgenre: 'fighting',
                isHot: false,
                isNew: false,
                releaseDate: '2024-01-28'
            }
        ];

        // Add more mock games for pagination testing
        for (let i = 5; i <= 20; i++) {
            actionGames.push({
                id: `action-game-${i}`,
                title: `Action Game ${i}`,
                description: `Exciting action-packed game number ${i} with unique gameplay.`,
                image: `/images/action-game-${i % 4 + 1}.jpg`,
                rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                reviews: Math.floor(Math.random() * 200) + 20,
                plays: Math.floor(Math.random() * 15000) + 1000,
                tags: this.getRandomTags(),
                difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
                subgenre: ['fighting', 'shooter', 'platformer', 'beat-em-up', 'racing'][Math.floor(Math.random() * 5)],
                isHot: Math.random() > 0.8,
                isNew: Math.random() > 0.9,
                releaseDate: this.getRandomDate()
            });
        }

        return actionGames;
    }

    getRandomTags() {
        const allTags = ['Fighting', '2D', 'Combos', 'Shooter', 'Space', 'Retro', 'Platformer', 'Ninja', 'Runner', 'Multiplayer', 'Combat', 'Arena', '3D', 'Classic', 'Fast-paced'];
        const numTags = Math.floor(Math.random() * 3) + 2;
        const shuffled = allTags.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numTags);
    }

    getRandomDate() {
        const start = new Date('2023-01-01');
        const end = new Date();
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
    }

    applyFilters() {
        const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
        const subgenreFilter = document.getElementById('subgenreFilter')?.value || '';
        const ratingFilter = document.getElementById('ratingFilter')?.value || '';

        this.filteredGames = this.games.filter(game => {
            const matchesDifficulty = !difficultyFilter || game.difficulty === difficultyFilter;
            const matchesSubgenre = !subgenreFilter || game.subgenre === subgenreFilter;
            const matchesRating = !ratingFilter || game.rating >= parseInt(ratingFilter);

            return matchesDifficulty && matchesSubgenre && matchesRating;
        });

        this.currentPage = 1;
        this.applySorting();
    }

    applySorting() {
        const sortBy = document.getElementById('sortBy')?.value || 'popular';

        this.filteredGames.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.releaseDate) - new Date(a.releaseDate);
                case 'oldest':
                    return new Date(a.releaseDate) - new Date(b.releaseDate);
                case 'rating':
                    return b.rating - a.rating;
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'plays':
                    return b.plays - a.plays;
                case 'popular':
                default:
                    return (b.plays * b.rating) - (a.plays * a.rating);
            }
        });

        this.renderGames();
        this.updateGameCount();
    }

    searchGames(query) {
        if (!query.trim()) {
            this.filteredGames = [...this.games];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredGames = this.games.filter(game => 
                game.title.toLowerCase().includes(searchTerm) ||
                game.description.toLowerCase().includes(searchTerm) ||
                game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        this.currentPage = 1;
        this.applySorting();
    }

    renderGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const gamesToShow = this.filteredGames.slice(startIndex, endIndex);

        gamesGrid.innerHTML = gamesToShow.map(game => this.createGameCard(game)).join('');
        
        this.updateLoadMoreButton();
        this.updatePagination();
    }

    createGameCard(game) {
        const badgeHtml = game.isHot ? 
            '<div class="absolute top-2 left-2 bg-apple-red text-white px-2 py-1 rounded text-xs font-bold">HOT</div>' :
            game.isNew ? 
            '<div class="absolute top-2 left-2 bg-apple-green text-white px-2 py-1 rounded text-xs font-bold">NEW</div>' : '';

        const tagsHtml = game.tags.map(tag => 
            `<span class="bg-apple-${this.getTagColor(tag)} bg-opacity-20 text-apple-${this.getTagColor(tag)} text-xs px-2 py-1 rounded-full">${tag}</span>`
        ).join('');

        return `
            <div class="game-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
                <div class="relative">
                    <img src="${game.image}" alt="${game.title}" class="w-full h-48 object-cover" loading="lazy">
                    ${badgeHtml}
                    <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">⚡ ${this.title}</div>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-2 text-apple-${this.color}">${game.title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-3">${game.description}</p>
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                            <span class="text-yellow-400 mr-1">⭐</span>
                            <span class="font-bold">${game.rating}</span>
                            <span class="text-gray-500 text-sm ml-1">(${game.reviews})</span>
                        </div>
                        <div class="text-gray-500 text-sm">👥 ${this.formatNumber(game.plays)} plays</div>
                    </div>
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${tagsHtml}
                    </div>
                    <a href="/games/${game.id}/" class="w-full bg-apple-${this.color} text-white px-4 py-2 rounded-lg hover:bg-${this.color}-600 transition duration-300 inline-block text-center font-semibold">
                        Play Now
                    </a>
                </div>
            </div>
        `;
    }

    getTagColor(tag) {
        const colorMap = {
            'Fighting': 'red',
            '2D': 'orange',
            'Combos': 'yellow',
            'Shooter': 'blue',
            'Space': 'purple',
            'Retro': 'green',
            'Platformer': 'indigo',
            'Ninja': 'teal',
            'Runner': 'orange',
            'Multiplayer': 'purple',
            'Combat': 'red',
            'Arena': 'orange',
            '3D': 'blue',
            'Classic': 'gray',
            'Fast-paced': 'red'
        };
        return colorMap[tag] || 'gray';
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    loadMoreGames() {
        this.currentPage++;
        this.renderGames();
        
        // Smooth scroll to new content
        const newGames = document.querySelectorAll('.game-card');
        if (newGames.length > 0) {
            const lastGameIndex = (this.currentPage - 1) * this.itemsPerPage;
            if (newGames[lastGameIndex]) {
                newGames[lastGameIndex].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        const totalPages = Math.ceil(this.filteredGames.length / this.itemsPerPage);
        
        if (this.currentPage >= totalPages) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
            const remainingGames = this.filteredGames.length - (this.currentPage * this.itemsPerPage);
            loadMoreBtn.textContent = `Load More Games (${remainingGames} remaining)`;
        }
    }

    updatePagination() {
        // This would update pagination controls if implemented
        // For now, we're using the "Load More" approach
    }

    updateGameCount() {
        // Update various count displays
        const countElements = document.querySelectorAll('[data-count]');
        countElements.forEach(element => {
            const countType = element.dataset.count;
            switch (countType) {
                case 'total':
                    element.textContent = `${this.filteredGames.length}+`;
                    break;
                case 'showing':
                    const showing = Math.min(this.currentPage * this.itemsPerPage, this.filteredGames.length);
                    element.textContent = showing;
                    break;
            }
        });
    }

    toggleView() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        const gamesGrid = document.getElementById('gamesGrid');
        
        if (this.currentView === 'list') {
            gamesGrid.className = 'space-y-4 mb-8';
        } else {
            gamesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8';
        }
        
        this.renderGames();
    }

    // Analytics and tracking
    trackGameClick(gameId) {
        // Track game clicks for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'game_click', {
                game_id: gameId,
                category: this.category
            });
        }
        
        // You could also send to your own analytics endpoint
        this.sendAnalytics('game_click', { gameId, category: this.category });
    }

    sendAnalytics(event, data) {
        // Send analytics data to your backend
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event,
                data,
                timestamp: new Date().toISOString(),
                url: window.location.href
            })
        }).catch(err => {
            console.log('Analytics error:', err);
        });
    }

    // Social sharing
    shareCategory() {
        if (navigator.share) {
            navigator.share({
                title: `${this.title} - BestGames Online`,
                text: `Check out these amazing ${this.title.toLowerCase()} games!`,
                url: window.location.href
            });
        } else {
            // Fallback to copying URL
            navigator.clipboard.writeText(window.location.href);
            this.showNotification('Link copied to clipboard!');
        }
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-apple-green text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize category page when DOM is loaded
function initCategoryPage(options) {
    return new CategoryPage(options);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryPage;
} 