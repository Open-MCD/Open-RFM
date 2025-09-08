// Main POS System Script

// Function to align the timer/blank box with the "Small" box
function alignHeaderBoxes() {
    const smallBox = document.querySelector('.dimension');
    const timerBlankContainer = document.querySelector('.panel-indicator-line div[style*="display: flex; flex: 1; min-width: 0"]');
    
    if (smallBox && timerBlankContainer) {
        const smallBoxWidth = smallBox.offsetWidth;
        timerBlankContainer.style.width = smallBoxWidth + 'px';
        timerBlankContainer.style.flex = 'none';
    }
}

// Function to update screen width display
function updateScreenWidth() {
    const currentWidthSpan = document.getElementById('current-width');
    if (currentWidthSpan) {
        currentWidthSpan.textContent = window.innerWidth;
    }
}

// Function to check screen width and show/hide warning
function checkScreenWidth() {
    updateScreenWidth();
    // The CSS media query handles showing/hiding the overlay
}

// Initialize everything when page loads
function initializeApp() {
    alignHeaderBoxes();
    checkScreenWidth();
    
    // Initialize product selector when the page loads
    if (typeof initializeProductSelector === 'function') {
        initializeProductSelector();
    }
}

// Event listeners
window.addEventListener('load', initializeApp);

window.addEventListener('resize', function() {
    alignHeaderBoxes();
    checkScreenWidth();
});

document.addEventListener('DOMContentLoaded', initializeApp);
