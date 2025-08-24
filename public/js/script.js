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

// Run alignment when page loads
window.addEventListener('load', alignHeaderBoxes);

// Run alignment when window resizes
window.addEventListener('resize', function() {
    alignHeaderBoxes();
});

// Also run on DOM content loaded as backup
document.addEventListener('DOMContentLoaded', alignHeaderBoxes);
