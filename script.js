// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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