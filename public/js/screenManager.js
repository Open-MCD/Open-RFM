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
            name: isDefault ? `Start Screen ${screenId}` : `Screen ${screenId}`,
            gridState: gridState,
            isDefault: isDefault,
            createdAt: new Date()
        });
        
        console.log(`Created screen ${screenId}`);
        return true;
    }
    
    // Add a new screen with auto-generated ID
    addNewScreen() {
        // Show modal to get screen number
        this.showAddScreenModal();
    }
    
    // Show modal for adding new screen with custom number
    showAddScreenModal() {
        // Find next available screen ID as default
        let suggestedId = this.nextScreenId;
        while (this.screens.has(suggestedId)) {
            suggestedId++;
        }
        
        // Create modal for screen number input
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333;">Add New Screen</h3>
                <p style="margin: 0 0 15px 0; color: #666;">
                    Enter a screen number for the new screen. Screen 301 is reserved for the main screen.
                </p>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Screen Number:</label>
                    <input type="number" id="new-screen-number-input" value="${suggestedId}" 
                        style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                        "
                        min="1"
                        max="999"
                        placeholder="Enter screen number (e.g., 302)"
                    >
                    <small style="color: #666; margin-top: 5px; display: block;">
                        Must be between 1-999 (301 is reserved for start screen)
                    </small>
                </div>
                <div style="text-align: right; gap: 10px; display: flex; justify-content: flex-end;">
                    <button id="cancel-add-screen" style="
                        padding: 8px 16px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button id="create-new-screen" style="
                        padding: 8px 16px;
                        background: #28a745;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Create Screen</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus the input
        const input = document.getElementById('new-screen-number-input');
        input.focus();
        input.select();
        
        // Handle cancel
        document.getElementById('cancel-add-screen').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Handle create
        document.getElementById('create-new-screen').addEventListener('click', () => {
            const screenNumber = input.value.trim();
            
            // Validate input
            if (!screenNumber) {
                alert('Please enter a screen number.');
                return;
            }
            
            const screenNum = parseInt(screenNumber);
            if (isNaN(screenNum)) {
                alert('Please enter a valid number.');
                return;
            }
            
            if (screenNum === 301) {
                alert('Screen 301 is reserved for the start screen. Please choose a different number.');
                return;
            }
            
            if (screenNum < 1 || screenNum > 999) {
                alert('Screen number must be between 1 and 999.');
                return;
            }
            
            if (this.screens.has(screenNum)) {
                alert(`Screen ${screenNum} already exists. Please choose a different number.`);
                return;
            }
            
            // Create the screen with custom number
            if (this.createScreen(screenNum)) {
                // Update nextScreenId if needed
                if (screenNum >= this.nextScreenId) {
                    this.nextScreenId = screenNum + 1;
                }
                
                this.renderScreenList();
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 4px;
                    z-index: 10001;
                    font-family: Arial, sans-serif;
                `;
                successMsg.textContent = `Screen ${screenNum} created successfully`;
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    if (document.body.contains(successMsg)) {
                        document.body.removeChild(successMsg);
                    }
                }, 3000);
            }
            
            document.body.removeChild(modal);
        });
        
        // Handle Enter key
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('create-new-screen').click();
            }
        });
        
        // Handle Escape key
        modal.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('cancel-add-screen').click();
            }
        });
    }
    
    // Show modal for editing existing screen number
    showEditScreenNumberModal(currentScreenId) {
        const screen = this.screens.get(currentScreenId);
        if (!screen || screen.isDefault) {
            alert('Cannot edit the default screen number (301).');
            return;
        }
        
        // Create modal for screen number editing
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333;">Edit Screen Number</h3>
                <p style="margin: 0 0 15px 0; color: #666;">
                    Change the screen number for "${screen.name}". Screen 301 is reserved for the start screen.
                </p>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">New Screen Number:</label>
                    <input type="number" id="edit-screen-number-input" value="${currentScreenId}" 
                        style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                        "
                        min="1"
                        max="999"
                        placeholder="Enter new screen number"
                    >
                    <small style="color: #666; margin-top: 5px; display: block;">
                        Must be between 1-999 (301 is reserved for start screen)
                    </small>
                </div>
                <div style="text-align: right; gap: 10px; display: flex; justify-content: flex-end;">
                    <button id="cancel-edit-screen-number" style="
                        padding: 8px 16px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button id="save-edit-screen-number" style="
                        padding: 8px 16px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Update Number</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus the input
        const input = document.getElementById('edit-screen-number-input');
        input.focus();
        input.select();
        
        // Handle cancel
        document.getElementById('cancel-edit-screen-number').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Handle save
        document.getElementById('save-edit-screen-number').addEventListener('click', () => {
            const newScreenNumber = input.value.trim();
            
            // Validate input
            if (!newScreenNumber) {
                alert('Please enter a screen number.');
                return;
            }
            
            const newScreenNum = parseInt(newScreenNumber);
            if (isNaN(newScreenNum)) {
                alert('Please enter a valid number.');
                return;
            }
            
            if (newScreenNum === 301) {
                alert('Screen 301 is reserved for the start screen. Please choose a different number.');
                return;
            }
            
            if (newScreenNum < 1 || newScreenNum > 999) {
                alert('Screen number must be between 1 and 999.');
                return;
            }
            
            if (newScreenNum === currentScreenId) {
                alert('The screen number is already set to this value.');
                document.body.removeChild(modal);
                return;
            }
            
            if (this.screens.has(newScreenNum)) {
                alert(`Screen ${newScreenNum} already exists. Please choose a different number.`);
                return;
            }
            
            // Update the screen number
            if (this.updateScreenNumber(currentScreenId, newScreenNum)) {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #007bff;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 4px;
                    z-index: 10001;
                    font-family: Arial, sans-serif;
                `;
                successMsg.textContent = `Screen number updated to ${newScreenNum}`;
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    if (document.body.contains(successMsg)) {
                        document.body.removeChild(successMsg);
                    }
                }, 3000);
            }
            
            document.body.removeChild(modal);
        });
        
        // Handle Enter key
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('save-edit-screen-number').click();
            }
        });
        
        // Handle Escape key
        modal.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('cancel-edit-screen-number').click();
            }
        });
    }
    
    // Show modal for editing screen name
    showEditScreenNameModal(screenId) {
        const screen = this.screens.get(screenId);
        if (!screen) {
            alert('Screen not found.');
            return;
        }
        
        // Create modal for screen name editing
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333;">Edit Screen Name</h3>
                <p style="margin: 0 0 15px 0; color: #666;">
                    Change the display name for Screen ${screenId}. This will be used as the title in exports.
                </p>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Screen Name:</label>
                    <input type="text" id="edit-screen-name-input" value="${screen.name}" 
                        style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                        "
                        placeholder="Enter screen name"
                        maxlength="40"
                    >
                    <small style="color: #666; margin-top: 5px; display: block;">
                        This name will appear in the screen list and XML exports (max 40 characters)
                    </small>
                </div>
                <div style="text-align: right; gap: 10px; display: flex; justify-content: flex-end;">
                    <button id="cancel-edit-screen-name" style="
                        padding: 8px 16px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button id="save-edit-screen-name" style="
                        padding: 8px 16px;
                        background: #17a2b8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Update Name</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus the input
        const input = document.getElementById('edit-screen-name-input');
        input.focus();
        input.select();
        
        // Handle cancel
        document.getElementById('cancel-edit-screen-name').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Handle save
        document.getElementById('save-edit-screen-name').addEventListener('click', () => {
            const newScreenName = input.value.trim();
            
            // Validate input
            if (!newScreenName) {
                alert('Please enter a screen name.');
                return;
            }
            
            if (newScreenName.length > 40) {
                alert('Screen name must be 40 characters or less.');
                return;
            }
            
            if (newScreenName === screen.name) {
                alert('The screen name is already set to this value.');
                document.body.removeChild(modal);
                return;
            }
            
            // Update the screen name
            if (this.updateScreenName(screenId, newScreenName)) {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #17a2b8;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 4px;
                    z-index: 10001;
                    font-family: Arial, sans-serif;
                `;
                successMsg.textContent = `Screen name updated to "${newScreenName}"`;
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    if (document.body.contains(successMsg)) {
                        document.body.removeChild(successMsg);
                    }
                }, 3000);
            }
            
            document.body.removeChild(modal);
        });
        
        // Handle Enter key
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('save-edit-screen-name').click();
            }
        });
        
        // Handle Escape key
        modal.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('cancel-edit-screen-name').click();
            }
        });
    }
    
    // Update screen number (change screen ID)
    updateScreenNumber(oldScreenId, newScreenId) {
        const screen = this.screens.get(oldScreenId);
        if (!screen || screen.isDefault) {
            console.error(`Cannot update screen number for screen ${oldScreenId}`);
            return false;
        }
        
        if (this.screens.has(newScreenId)) {
            console.error(`Screen ${newScreenId} already exists`);
            return false;
        }
        
        // Save current grid state before changing screen
        this.saveCurrentGridState();
        
        // Remove old screen entry
        this.screens.delete(oldScreenId);
        
        // Update screen data with new ID
        screen.id = newScreenId;
        screen.name = screen.name.replace(`Screen ${oldScreenId}`, `Screen ${newScreenId}`);
        
        // Add with new ID
        this.screens.set(newScreenId, screen);
        
        // Update current screen ID if this was the active screen
        if (this.currentScreenId === oldScreenId) {
            this.currentScreenId = newScreenId;
        }
        
        // Update nextScreenId if needed
        if (newScreenId >= this.nextScreenId) {
            this.nextScreenId = newScreenId + 1;
        }
        
        // Re-render screen list
        this.renderScreenList();
        
        console.log(`Screen ${oldScreenId} updated to ${newScreenId}`);
        return true;
    }
    
    // Update screen name (change display name)
    updateScreenName(screenId, newName) {
        const screen = this.screens.get(screenId);
        if (!screen) {
            console.error(`Cannot update screen name for screen ${screenId} - screen not found`);
            return false;
        }
        
        if (!newName || newName.trim() === '') {
            console.error('Screen name cannot be empty');
            return false;
        }
        
        // Update the screen name
        screen.name = newName.trim();
        
        // Re-render screen list to show updated name
        this.renderScreenList();
        
        console.log(`Screen ${screenId} name updated to "${newName}"`);
        return true;
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
                customScreenNumber: item.dataset.customScreenNumber || null,
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
            item.style.position = '';
            delete item.dataset.productCode;
            delete item.dataset.specialButtonId;
            delete item.dataset.numberButtonId;
            delete item.dataset.pageButtonId;
            delete item.dataset.screenButtonId;
            delete item.dataset.buttonType;
            delete item.dataset.customScreenNumber;
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
                    if (cellData.customScreenNumber) {
                        gridItem.dataset.customScreenNumber = cellData.customScreenNumber;
                    }
                    
                    // Restore visual content
                    if (cellData.innerHTML) {
                        gridItem.innerHTML = cellData.innerHTML;
                    }
                    
                    // Add delete button for all filled items
                    if (cellData.buttonType && window.addDeleteButtonToGridItem) {
                        window.addDeleteButtonToGridItem(gridItem);
                    }
                    
                    // Restore edit button for screen buttons
                    if (cellData.buttonType === 'screen' && cellData.screenButtonId && window.addEditButtonToGridItem) {
                        window.addEditButtonToGridItem(gridItem, cellData.screenButtonId);
                    }
                }
            });
        }
        
        // Add placeholder text to empty cells
        gridItems.forEach(item => {
            if (!item.innerHTML.trim()) {
                item.innerHTML = `<div style="font-size: 10px; color: #666; text-align: center;">Click to<br>select product</div>`;
            }
        });
        
        console.log(`Loaded grid state for screen ${screenId}`);
    }
    
    // Render the screen list in the UI
    renderScreenList() {
        const container = document.getElementById('screen-list-container');
        if (!container) return;
        
        const screensArray = Array.from(this.screens.values());
        
        // Sort screens with start screen (301) always first, then others by ID
        screensArray.sort((a, b) => {
            // Start screen (301) always goes first
            if (a.id === 301) return -1;
            if (b.id === 301) return 1;
            // All other screens sorted by ID
            return a.id - b.id;
        });
        
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
                    <div style="display: flex; gap: 4px; align-items: center;">
                        ${!screen.isDefault ? `
                            <button class="edit-screen-name-btn" data-screen-id="${screen.id}" style="
                                padding: 4px 8px;
                                background: #17a2b8;
                                color: white;
                                border: none;
                                border-radius: 3px;
                                font-size: 11px;
                                cursor: pointer;
                            ">Edit Name</button>
                            <button class="edit-screen-number-btn" data-screen-id="${screen.id}" style="
                                padding: 4px 8px;
                                background: #007bff;
                                color: white;
                                border: none;
                                border-radius: 3px;
                                font-size: 11px;
                                cursor: pointer;
                            ">Edit #</button>
                            <button class="delete-screen-btn" data-screen-id="${screen.id}" style="
                                padding: 4px 8px;
                                background: #dc3545;
                                color: white;
                                border: none;
                                border-radius: 3px;
                                font-size: 11px;
                                cursor: pointer;
                            ">Delete</button>
                        ` : `
                            <button class="edit-screen-name-btn" data-screen-id="${screen.id}" style="
                                padding: 4px 8px;
                                background: #17a2b8;
                                color: white;
                                border: none;
                                border-radius: 3px;
                                font-size: 11px;
                                cursor: pointer;
                            ">Edit Name</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners for screen switching and deletion
        container.querySelectorAll('.screen-list-item').forEach(item => {
            const screenId = parseInt(item.dataset.screenId);
            
            item.addEventListener('click', (e) => {
                // Don't switch if clicking delete button, edit button, or edit name button
                if (e.target.classList.contains('delete-screen-btn') || 
                    e.target.classList.contains('edit-screen-number-btn') ||
                    e.target.classList.contains('edit-screen-name-btn')) return;
                
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
        
        // Add event listeners for edit screen number buttons
        container.querySelectorAll('.edit-screen-number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const screenId = parseInt(btn.dataset.screenId);
                this.showEditScreenNumberModal(screenId);
            });
        });
        
        // Add event listeners for edit screen name buttons
        container.querySelectorAll('.edit-screen-name-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const screenId = parseInt(btn.dataset.screenId);
                this.showEditScreenNameModal(screenId);
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
