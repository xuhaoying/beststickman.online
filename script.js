// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if running locally from file system
    const isLocalFile = window.location.protocol === 'file:';
    
    if (isLocalFile) {
        console.log("Running in local file mode - SDK disabled");
        handleLocalMode();
    } else {
        // Initialize CrazyGames SDK
        try {
            const crazySdk = window.CrazyGames.CrazySDK.getInstance();
            
            // Initialize the SDK
            crazySdk.init();
            
            // Add ad callbacks
            crazySdk.addEventListener('adStarted', adStartedCallback);
            crazySdk.addEventListener('adFinished', adFinishedCallback);
            crazySdk.addEventListener('adError', adErrorCallback);
            
            // Load the game using the SDK
            const gameConfig = {
                gameId: "count-masters-stickman-games", // The actual game ID for Count Masters Stickman Games
                containerId: "game",
                width: "100%",
                height: "100%"
            };
            
            // Request the game
            crazySdk.gameplayStart();
            
            // Load the game
            const loadingIndicator = document.getElementById('loading-indicator');
            
            // Game is loaded through the CrazyGames SDK
            crazySdk.game.requestGame(gameConfig)
                .then(() => {
                    console.log("Game loaded successfully");
                    if (loadingIndicator) {
                        loadingIndicator.style.opacity = '0';
                        setTimeout(() => {
                            loadingIndicator.style.display = 'none';
                        }, 500);
                    }
                })
                .catch(error => {
                    console.error("Error loading game:", error);
                    if (loadingIndicator) {
                        loadingIndicator.innerHTML = `
                            <div class="text-center p-4">
                                <p class="text-xl font-bold text-apple-red mb-4">Unable to load game</p>
                                <p>Please try again later or visit <a href="https://www.crazygames.com/game/count-masters-stickman-games" class="text-apple-blue underline" target="_blank">CrazyGames</a> directly.</p>
                                <button id="retry-button" class="mt-4 bg-apple-blue hover:bg-apple-teal text-white font-bold py-2 px-4 rounded">Retry</button>
                            </div>
                        `;
                        
                        document.getElementById('retry-button').addEventListener('click', function() {
                            window.location.reload();
                        });
                    }
                });
        } catch (error) {
            console.error("Error initializing game:", error);
            handleLocalMode();
        }
    }
    
    // Function to handle local mode (when SDK is not available)
    function handleLocalMode() {
        const loadingIndicator = document.getElementById('loading-indicator');
        const gameContainer = document.querySelector('.game-container');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        if (gameContainer) {
            const gameElement = document.getElementById('game');
            if (gameElement) {
                gameElement.innerHTML = `
                    <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div class="text-center p-6">
                            <h3 class="text-xl font-bold text-apple-blue mb-4">Game Preview</h3>
                            <p class="mb-4">To play the game, please:</p>
                            <ul class="text-left list-disc pl-6 mb-4">
                                <li class="mb-2">Upload files to a web server, or</li>
                                <li class="mb-2">Use a local development server (e.g., Python's http.server)</li>
                            </ul>
                            <a href="https://www.crazygames.com/game/count-masters-stickman-games" target="_blank" class="inline-block bg-apple-blue hover:bg-apple-teal text-white font-bold py-2 px-4 rounded">
                                Play on CrazyGames
                            </a>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Ad callbacks
    function adStartedCallback() {
        console.log("Ad started");
        // Pause the game or any audio here if needed
    }
    
    function adFinishedCallback() {
        console.log("Ad finished");
        // Resume the game or audio here if needed
    }
    
    function adErrorCallback(error) {
        console.error("Ad error:", error);
        // Handle ad error if needed
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add dark mode toggle functionality
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    function setTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    // Set initial theme based on system preference
    setTheme(prefersDarkScheme.matches);

    // Update theme if system preference changes
    prefersDarkScheme.addEventListener('change', e => {
        setTheme(e.matches);
    });

    // Responsive navigation enhancements for mobile
    function handleResponsiveNav() {
        const navItems = document.querySelectorAll('nav a');
        if (window.innerWidth < 768) {
            navItems.forEach(item => {
                item.setAttribute('data-mobile', 'true');
            });
        } else {
            navItems.forEach(item => {
                item.removeAttribute('data-mobile');
            });
        }
    }

    // Run on load and on resize
    handleResponsiveNav();
    window.addEventListener('resize', handleResponsiveNav);

    // Add some animation when scrolling into view
    const animatedElements = document.querySelectorAll('#features > div > div, #how-to-play > div, #about > div');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        observer.observe(el);
        el.classList.add('opacity-0');
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        el.style.transform = 'translateY(20px)';
    });

    // Add custom CSS for animation
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .animated {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);
}); 