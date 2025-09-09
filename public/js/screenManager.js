// Screen Management System
class ScreenManager {
    constructor() {
        this.screens = new Map(); // Store screen data by ID
        this.currentScreenId = 301; // Default screen ID
        this.nextScreenId = 302; // Next available screen ID
        
        this.init();
    }
    
    init() {
        // Create default screen (301)
        this.createScreen(301, true);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render initial screen list
        this.renderScreenList();
    }
    
    setupEventListeners() {
        // Use a timeout to ensure DOM is ready
        setTimeout(() => {
            const addScreenBtn = document.getElementById('add-screen-btn');
            if (addScreenBtn) {
                addScreenBtn.addEventListener('click', () => this.addNewScreen());
                console.log('Add screen button event listener attached');
            } else {
                console.warn('Add screen button not found in DOM');
            }
        }, 100);
    }
    
    // Create a new screen with given ID
    createScreen(screenId, isDefault = false) {
        if (this.screens.has(screenId)) {
            console.warn(`Screen ${screenId} already exists`);
            return false;
        }
        
        // Initialize empty grid state for the screen
        const gridState = new Array(90).fill(null); // 9x10 grid = 90 cells
        
        this.screens.set(screenId, {
            id: screenId,
            name: isDefault ? `Main Screen (${screenId})` : `Screen ${screenId}`,
            gridState: gridState,
            isDefault: isDefault,
            createdAt: new Date()
        });
        
        console.log(`Created screen ${screenId}`);
        return true;
    }
    
    // Add a new screen with auto-generated ID
    addNewScreen() {
        // Find next available screen ID
        while (this.screens.has(this.nextScreenId)) {
            this.nextScreenId++;
        }
        
        const screenId = this.nextScreenId;
        
        if (this.createScreen(screenId)) {
            this.nextScreenId++;
            this.renderScreenList();
            
            // Optionally switch to the new screen
            // this.switchToScreen(screenId);
        }
    }
    
    // Delete a screen (except default)
    deleteScreen(screenId) {
        const screen = this.screens.get(screenId);
        if (!screen) {
            console.warn(`Screen ${screenId} not found`);
            return false;
        }
        
        if (screen.isDefault) {
            alert('Cannot delete the default screen');
            return false;
        }
        
        // If deleting current screen, switch to default
        if (screenId === this.currentScreenId) {
            this.switchToScreen(301);
        }
        
        this.screens.delete(screenId);
        this.renderScreenList();
        
        console.log(`Deleted screen ${screenId}`);
        return true;
    }
    
    // Switch to a different screen
    switchToScreen(screenId) {
        if (!this.screens.has(screenId)) {
            console.warn(`Screen ${screenId} not found`);
            return false;
        }
        
        // Save current grid state before switching
        this.saveCurrentGridState();
        
        // Update current screen ID
        this.currentScreenId = screenId;
        
        // Load the new screen's grid state
        this.loadGridState(screenId);
        
        // Update UI to reflect current screen
        this.renderScreenList();
        
        console.log(`Switched to screen ${screenId}`);
        return true;
    }
    
    // Save current grid state to the current screen
    saveCurrentGridState() {
        const screen = this.screens.get(this.currentScreenId);
        if (!screen) return;
        
        const gridItems = document.querySelectorAll('.grid-item');
        const gridState = [];
        
        gridItems.forEach((item, index) => {
            const cellData = {
                index: index,
                productCode: item.dataset.productCode || null,
                specialButtonId: item.dataset.specialButtonId || null,
                numberButtonId: item.dataset.numberButtonId || null,
                pageButtonId: item.dataset.pageButtonId || null,
                screenButtonId: item.dataset.screenButtonId || null,
                buttonType: item.dataset.buttonType || null,
                innerHTML: item.innerHTML || ''
            };
            gridState.push(cellData);
        });
        
        screen.gridState = gridState;
        console.log(`Saved grid state for screen ${this.currentScreenId}`);
    }
    
    // Load grid state for a specific screen
    loadGridState(screenId) {
        const screen = this.screens.get(screenId);
        if (!screen) return;
        
        const gridItems = document.querySelectorAll('.grid-item');
        
        // Clear all grid items first
        gridItems.forEach(item => {
            item.innerHTML = '';
            item.style.backgroundColor = '';
            delete item.dataset.productCode;
            delete item.dataset.specialButtonId;
            delete item.dataset.numberButtonId;
            delete item.dataset.pageButtonId;
            delete item.dataset.screenButtonId;
            delete item.dataset.buttonType;
        });
        
        // Load saved state
        if (screen.gridState && screen.gridState.length > 0) {
            screen.gridState.forEach((cellData, index) => {
                if (cellData && index < gridItems.length) {
                    const gridItem = gridItems[index];
                    
                    // Restore data attributes
                    if (cellData.productCode) {
                        gridItem.dataset.productCode = cellData.productCode;
                    }
                    if (cellData.specialButtonId) {
                        gridItem.dataset.specialButtonId = cellData.specialButtonId;
                    }
                    if (cellData.numberButtonId) {
                        gridItem.dataset.numberButtonId = cellData.numberButtonId;
                    }
                    if (cellData.pageButtonId) {
                        gridItem.dataset.pageButtonId = cellData.pageButtonId;
                    }
                    if (cellData.screenButtonId) {
                        gridItem.dataset.screenButtonId = cellData.screenButtonId;
                    }
                    if (cellData.buttonType) {
                        gridItem.dataset.buttonType = cellData.buttonType;
                    }
                    
                    // Restore visual content
                    if (cellData.innerHTML) {
                        gridItem.innerHTML = cellData.innerHTML;
                    }
                }
            });
        }
        
        console.log(`Loaded grid state for screen ${screenId}`);
    }
    
    // Render the screen list in the UI
    renderScreenList() {
        const container = document.getElementById('screen-list-container');
        if (!container) return;
        
        const screensArray = Array.from(this.screens.values()).sort((a, b) => a.id - b.id);
        
        container.innerHTML = screensArray.map(screen => {
            const isActive = screen.id === this.currentScreenId;
            
            return `
                <div class="screen-list-item" data-screen-id="${screen.id}" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    margin-bottom: 4px;
                    background: ${isActive ? '#e3f2fd' : '#f8f9fa'};
                    border: 1px solid ${isActive ? '#2196f3' : '#dee2e6'};
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        flex: 1;
                    ">
                        <div style="
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: ${isActive ? '#2196f3' : '#6c757d'};
                            margin-right: 8px;
                        "></div>
                        <span style="
                            font-weight: ${isActive ? 'bold' : 'normal'};
                            color: ${isActive ? '#1976d2' : '#333'};
                        ">
                            ${screen.name}
                        </span>
                        ${isActive ? '<span style="margin-left: 8px; color: #2196f3; font-size: 11px;">(Active)</span>' : ''}
                    </div>
                    ${!screen.isDefault ? `
                        <button class="delete-screen-btn" data-screen-id="${screen.id}" style="
                            padding: 4px 8px;
                            background: #dc3545;
                            color: white;
                            border: none;
                            border-radius: 3px;
                            font-size: 11px;
                            cursor: pointer;
                            margin-left: 8px;
                        ">Delete</button>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Add event listeners for screen switching and deletion
        container.querySelectorAll('.screen-list-item').forEach(item => {
            const screenId = parseInt(item.dataset.screenId);
            
            item.addEventListener('click', (e) => {
                // Don't switch if clicking delete button
                if (e.target.classList.contains('delete-screen-btn')) return;
                
                this.switchToScreen(screenId);
            });
            
            // Hover effects
            item.addEventListener('mouseenter', function() {
                if (screenId !== screenManager.currentScreenId) {
                    this.style.background = '#e9ecef';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (screenId !== screenManager.currentScreenId) {
                    this.style.background = '#f8f9fa';
                }
            });
        });
        
        // Add event listeners for delete buttons
        container.querySelectorAll('.delete-screen-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const screenId = parseInt(btn.dataset.screenId);
                
                if (confirm(`Are you sure you want to delete Screen ${screenId}?`)) {
                    this.deleteScreen(screenId);
                }
            });
        });
    }
    
    // Get current screen info
    getCurrentScreen() {
        return this.screens.get(this.currentScreenId);
    }
    
    // Get all screens
    getAllScreens() {
        return Array.from(this.screens.values());
    }
    
    // Export screen data for saving/loading
    exportScreenData() {
        this.saveCurrentGridState(); // Save current state first
        
        const screenData = {};
        this.screens.forEach((screen, id) => {
            screenData[id] = {
                id: screen.id,
                name: screen.name,
                gridState: screen.gridState,
                isDefault: screen.isDefault,
                createdAt: screen.createdAt
            };
        });
        
        return {
            screens: screenData,
            currentScreenId: this.currentScreenId,
            nextScreenId: this.nextScreenId
        };
    }
    
    // Import screen data from saved state
    importScreenData(data) {
        if (!data || !data.screens) return false;
        
        this.screens.clear();
        
        Object.values(data.screens).forEach(screenData => {
            this.screens.set(screenData.id, {
                id: screenData.id,
                name: screenData.name,
                gridState: screenData.gridState || new Array(90).fill(null),
                isDefault: screenData.isDefault || false,
                createdAt: new Date(screenData.createdAt)
            });
        });
        
        this.currentScreenId = data.currentScreenId || 301;
        this.nextScreenId = data.nextScreenId || 302;
        
        this.renderScreenList();
        this.loadGridState(this.currentScreenId);
        
        return true;
    }
}

// Global screen manager instance
let screenManager = null;

// Initialize screen manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing screen manager...');
    screenManager = new ScreenManager();
    
    // Make sure it's globally accessible
    window.screenManager = screenManager;
    
    // Integrate with existing product selector
    if (window.initializeProductSelector) {
        window.initializeProductSelector();
    }
    
    console.log('Screen manager initialized with', screenManager.getAllScreens().length, 'screens');
    console.log('Available screens:', screenManager.getAllScreens().map(s => s.id));
});

// Ensure it's available for immediate access (will be null until DOM loads)
window.screenManager = screenManager;
