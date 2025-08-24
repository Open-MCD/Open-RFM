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

// Run alignment when page loads
window.addEventListener('load', function() {
    alignHeaderBoxes();
    checkScreenWidth();
});

// Run alignment and width check when window resizes
window.addEventListener('resize', function() {
    alignHeaderBoxes();
    checkScreenWidth();
});

// Also run on DOM content loaded as backup
document.addEventListener('DOMContentLoaded', function() {
    alignHeaderBoxes();
    checkScreenWidth();
});
