// Custom Button Creator
// This module handles creating custom buttons with user-defined properties

// Function to open custom button creator
function openCustomButtonCreator() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'custom-button-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        width: 90%;
        height: 90%;
        max-width: 800px;
        max-height: 700px;
        border: 2px solid #333;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 8px;
    `;
    
    modal.innerHTML = `
        <div style="
            padding: 20px;
            border-bottom: 1px solid #ccc;
            background: #f8f9fa;
        ">
            <h2 style="margin: 0 0 15px 0; font-family: Arial, sans-serif; color: #333;">Create Custom Button</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">Design a custom button with your own dimensions, image, title, and actions.</p>
        </div>
        
        <div style="
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        ">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <!-- Basic Properties -->
                <div>
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Basic Properties</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Title: <span style="color: red;">*</span></label>
                        <input type="text" id="custom-title" placeholder="Button Title" maxlength="20" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                        " value="">
                        <small id="title-validation" style="color: #666; font-size: 11px;">Max 20 characters (required)</small>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Image Name: <span style="color: red;">*</span></label>
                        <input type="text" id="custom-image" placeholder="Double_Quarter_Cheese_Deluxe.png" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                        " value="Double_Quarter_Cheese_Deluxe.png">
                        <small id="image-validation" style="color: #666; font-size: 11px;">Image file name (required)</small>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Width (cells):</label>
                            <input type="number" id="custom-width" min="1" max="10" value="1" style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                            ">
                            <small id="width-validation" style="color: #666; font-size: 11px;">1-10 cells</small>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Height (cells):</label>
                            <input type="number" id="custom-height" min="1" max="9" value="1" style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                            ">
                            <small id="height-validation" style="color: #666; font-size: 11px;">1-9 cells</small>
                        </div>
                    </div>
                </div>
                
                <!-- Colors -->
                <div>
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Colors</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Background:</label>
                            <select id="custom-bg-color" style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                            ">
                                <option value="WHITE">White</option>
                                <option value="BLACK">Black</option>
                                <option value="SILVER">Silver</option>
                                <option value="GOLD">Gold</option>
                                <option value="ROYALBLUE">Royal Blue</option>
                                <option value="DARKRED">Dark Red</option>
                                <option value="GREEN">Green</option>
                                <option value="LIGHTRED">Light Red</option>
                                <option value="NAVAJOWHITE">Navajo White</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Text Color:</label>
                            <select id="custom-text-color" style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                            ">
                                <option value="BLACK">Black</option>
                                <option value="WHITE">White</option>
                                <option value="SILVER">Silver</option>
                                <option value="GOLD">Gold</option>
                                <option value="ROYALBLUE">Royal Blue</option>
                                <option value="DARKRED">Dark Red</option>
                                <option value="GREEN">Green</option>
                                <option value="LIGHTRED">Light Red</option>
                                <option value="NAVAJOWHITE">Navajo White</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Actions Section -->
            <div>
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Actions</h3>
                <div id="actions-container" style="margin-bottom: 15px;">
                    <!-- Actions will be added here dynamically -->
                </div>
                <button id="add-action-btn" style="
                    padding: 8px 16px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">+ Add Action</button>
            </div>
        </div>
        
        <div style="
            padding: 20px;
            border-top: 1px solid #ccc;
            background: #f8f9fa;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        ">
            <button id="cancel-custom-btn" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
            <button id="create-custom-btn" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: not-allowed;
                font-size: 14px;
            " disabled>Create Button</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Initialize actions and event handlers
    initializeCustomButtonCreator();
}

// Initialize custom button creator functionality
function initializeCustomButtonCreator() {
    let actionCounter = 0;
    
    // Add first action by default with sample data
    addCustomAction();
    
    // Add sample data to first action
    setTimeout(() => {
        const firstWorkflow = document.querySelector('.action-workflow');
        const firstParamName = document.querySelector('.param-name');
        const firstParamValue = document.querySelector('.param-value');
        
        if (firstWorkflow) firstWorkflow.value = 'WF_DoSale';
        if (firstParamName) firstParamName.value = 'ProductCode';
        if (firstParamValue) firstParamValue.value = '0';
    }, 100);
    
    // Add action button handler
    document.getElementById('add-action-btn').addEventListener('click', addCustomAction);
    
    // Cancel button handler
    document.getElementById('cancel-custom-btn').addEventListener('click', () => {
        document.getElementById('custom-button-overlay').remove();
    });
    
    // Create button handler
    document.getElementById('create-custom-btn').addEventListener('click', createCustomButton);
    
    // Close on overlay click
    document.getElementById('custom-button-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
    
    // Add real-time validation
    setupRealTimeValidation();
    
    function setupRealTimeValidation() {
        // Title validation
        const titleInput = document.getElementById('custom-title');
        const titleValidation = document.getElementById('title-validation');
        
        titleInput.addEventListener('input', function() {
            const value = this.value.trim();
            const length = value.length;
            
            if (length === 0) {
                this.style.borderColor = '#dc3545';
                titleValidation.style.color = '#dc3545';
                titleValidation.textContent = 'Title is required';
            } else if (length > 20) {
                this.style.borderColor = '#dc3545';
                titleValidation.style.color = '#dc3545';
                titleValidation.textContent = `Too long! ${length}/20 characters`;
            } else {
                this.style.borderColor = '#28a745';
                titleValidation.style.color = '#28a745';
                titleValidation.textContent = `Good! ${length}/20 characters`;
            }
        });
        
        // Image name validation
        const imageInput = document.getElementById('custom-image');
        const imageValidation = document.getElementById('image-validation');
        
        imageInput.addEventListener('input', function() {
            const value = this.value.trim();
            
            if (value.length === 0) {
                this.style.borderColor = '#dc3545';
                imageValidation.style.color = '#dc3545';
                imageValidation.textContent = 'Image name is required';
            } else {
                this.style.borderColor = '#28a745';
                imageValidation.style.color = '#28a745';
                imageValidation.textContent = 'Image name provided ✓';
            }
        });
        
        // Width validation
        const widthInput = document.getElementById('custom-width');
        const widthValidation = document.getElementById('width-validation');
        
        widthInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 1 || value > 10) {
                this.style.borderColor = '#dc3545';
                widthValidation.style.color = '#dc3545';
                widthValidation.textContent = 'Must be 1-10 cells';
            } else {
                this.style.borderColor = '#28a745';
                widthValidation.style.color = '#28a745';
                widthValidation.textContent = `Width: ${value} cells ✓`;
            }
        });
        
        // Height validation
        const heightInput = document.getElementById('custom-height');
        const heightValidation = document.getElementById('height-validation');
        
        heightInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 1 || value > 9) {
                this.style.borderColor = '#dc3545';
                heightValidation.style.color = '#dc3545';
                heightValidation.textContent = 'Must be 1-9 cells';
            } else {
                this.style.borderColor = '#28a745';
                heightValidation.style.color = '#28a745';
                heightValidation.textContent = `Height: ${value} cells ✓`;
            }
        });
        
        // Trigger initial validation
        titleInput.dispatchEvent(new Event('input'));
        imageInput.dispatchEvent(new Event('input'));
        widthInput.dispatchEvent(new Event('input'));
        heightInput.dispatchEvent(new Event('input'));
        
        // Add validation check to all inputs
        [titleInput, imageInput, widthInput, heightInput].forEach(input => {
            input.addEventListener('input', checkOverallValidation);
        });
        
        function checkOverallValidation() {
            const createBtn = document.getElementById('create-custom-btn');
            const title = titleInput.value.trim();
            const image = imageInput.value.trim();
            const width = parseInt(widthInput.value);
            const height = parseInt(heightInput.value);
            
            const titleValid = title.length > 0 && title.length <= 20;
            const imageValid = image.length > 0;
            const widthValid = !isNaN(width) && width >= 1 && width <= 10;
            const heightValid = !isNaN(height) && height >= 1 && height <= 9;
            
            if (titleValid && imageValid && widthValid && heightValid) {
                createBtn.disabled = false;
                createBtn.style.background = '#007bff';
                createBtn.style.cursor = 'pointer';
            } else {
                createBtn.disabled = true;
                createBtn.style.background = '#6c757d';
                createBtn.style.cursor = 'not-allowed';
            }
        }
        
        // Initial validation check
        checkOverallValidation();
    }
    
    function addCustomAction() {
        actionCounter++;
        const actionsContainer = document.getElementById('actions-container');
        
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-item';
        actionDiv.dataset.actionId = actionCounter;
        actionDiv.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 10px;
            background: #f9f9f9;
        `;
        
        actionDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; font-size: 14px; color: #333;">Action ${actionCounter}</h4>
                <button class="remove-action-btn" data-action-id="${actionCounter}" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Workflow:</label>
                <input type="text" class="action-workflow" placeholder="e.g., WF_DoQuantum" style="
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    font-size: 13px;
                ">
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Parameters:</label>
                <div class="parameters-container">
                    <!-- Parameters will be added here -->
                </div>
                <button class="add-parameter-btn" data-action-id="${actionCounter}" style="
                    padding: 4px 8px;
                    background: #17a2b8;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-top: 5px;
                ">+ Add Parameter</button>
            </div>
        `;
        
        actionsContainer.appendChild(actionDiv);
        
        // Add event listeners
        actionDiv.querySelector('.remove-action-btn').addEventListener('click', function() {
            if (actionsContainer.children.length > 1) {
                actionDiv.remove();
            } else {
                alert('At least one action is required.');
            }
        });
        
        actionDiv.querySelector('.add-parameter-btn').addEventListener('click', function() {
            addParameter(actionDiv);
        });
        
        // Add first parameter by default for new actions
        addParameter(actionDiv);
    }
    
    function addParameter(actionDiv) {
        const parametersContainer = actionDiv.querySelector('.parameters-container');
        const parameterDiv = document.createElement('div');
        parameterDiv.className = 'parameter-item';
        parameterDiv.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 5px;
            margin-bottom: 5px;
            align-items: center;
        `;
        
        parameterDiv.innerHTML = `
            <input type="text" class="param-name" placeholder="Parameter name" style="
                padding: 4px;
                border: 1px solid #ccc;
                border-radius: 3px;
                font-size: 12px;
            ">
            <input type="text" class="param-value" placeholder="Parameter value" style="
                padding: 4px;
                border: 1px solid #ccc;
                border-radius: 3px;
                font-size: 12px;
            ">
            <button class="remove-parameter-btn" style="
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 3px;
                width: 18px;
                height: 18px;
                cursor: pointer;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        `;
        
        parametersContainer.appendChild(parameterDiv);
        
        // Remove parameter handler
        parameterDiv.querySelector('.remove-parameter-btn').addEventListener('click', function() {
            parameterDiv.remove();
        });
    }
}

// Function to create the custom button
function createCustomButton() {
    // Get basic properties
    const title = document.getElementById('custom-title').value.trim();
    const imageName = document.getElementById('custom-image').value.trim();
    const width = parseInt(document.getElementById('custom-width').value) || 1;
    const height = parseInt(document.getElementById('custom-height').value) || 1;
    const bgColor = document.getElementById('custom-bg-color').value;
    const textColor = document.getElementById('custom-text-color').value;
    
    // Final validation check (should not be needed due to button being disabled, but just in case)
    const titleValid = title.length > 0 && title.length <= 20;
    const imageValid = imageName.length > 0;
    const widthValid = width >= 1 && width <= 10;
    const heightValid = height >= 1 && height <= 9;
    
    if (!titleValid || !imageValid || !widthValid || !heightValid) {
        alert('Please fix all validation errors before creating the button.');
        return;
    }
    
    // Collect actions
    const actions = [];
    const actionItems = document.querySelectorAll('.action-item');
    
    actionItems.forEach(actionItem => {
        const workflow = actionItem.querySelector('.action-workflow').value.trim();
        if (!workflow) return;
        
        const parameters = {};
        const parameterItems = actionItem.querySelectorAll('.parameter-item');
        
        parameterItems.forEach(paramItem => {
            const name = paramItem.querySelector('.param-name').value.trim();
            const value = paramItem.querySelector('.param-value').value.trim();
            if (name && value) {
                parameters[name] = value;
            }
        });
        
        actions.push({
            type: 'onclick',
            workflow: workflow,
            params: parameters
        });
    });
    
    if (actions.length === 0) {
        alert('Please add at least one action with a workflow.');
        return;
    }
    
    // Create custom button object
    const customButtonId = `custom-${Date.now()}-${Math.random()}`;
    const customButton = {
        id: customButtonId,
        title: title,
        bitmap: imageName,
        bgup: bgColor,
        textup: textColor,
        bgdn: textColor, // Swap colors for down state
        textdn: bgColor,
        v: height,
        h: width,
        keyscan: '0',
        keyshift: '0',
        actions: actions,
        isCustom: true
    };
    
    // Close the modal
    document.getElementById('custom-button-overlay').remove();
    
    // Place the custom button
    placeCustomButton(customButton);
}

// Function to place a custom button on the grid
function placeCustomButton(customButton) {
    if (window.currentGridPosition === null) {
        alert('No grid position selected.');
        return;
    }
    
    // Clear any existing item at this position first (including spanning buttons)
    const gridItems = document.querySelectorAll('.grid-item');
    const targetGridItem = gridItems[window.currentGridPosition];
    
    if (targetGridItem && targetGridItem.dataset.buttonType) {
        // If there's an existing item, delete it completely (including spanned cells)
        if (window.deleteGridItemSilently) {
            window.deleteGridItemSilently(targetGridItem);
        }
    }
    
    const gridItem = gridItems[window.currentGridPosition];
    
    if (gridItem) {
        // Ensure this is placed as a custom spanning item by clearing any existing CSS
        gridItem.style.gridRow = '';
        gridItem.style.gridColumn = '';
        gridItem.style.zIndex = '';
        gridItem.style.display = '';
        
        // Create the button HTML
        const imageUrl = customButton.bitmap ? window.getImageUrl(customButton.bitmap) : null;
        const bgColor = convertPOSColor(customButton.bgup);
        const textColor = convertPOSColor(customButton.textup);
        
        if (imageUrl && customButton.bitmap) {
            // Show image button
            gridItem.innerHTML = `
                <img src="${imageUrl}" alt="${customButton.title}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: fill;
                " onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;padding:5px;font-size:10px;text-align:center;color:${textColor};background:${bgColor};display:flex;align-items:center;justify-content:center;height:100%;box-sizing:border-box;&quot;>${customButton.title}<br><small style=&quot;font-size:8px;&quot;>Image: ${customButton.bitmap}</small></div>';">
            `;
        } else {
            // Show text button with image name
            gridItem.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    background: ${bgColor}; 
                    color: ${textColor};
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    text-align: center;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    font-size: 9px;
                    line-height: 1.1;
                    padding: 4px;
                    box-sizing: border-box;
                    flex-direction: column;
                ">
                    <div>${customButton.title.replace(/\\n/g, '<br>')}</div>
                    <small style="font-size: 7px; margin-top: 2px; opacity: 0.8;">IMG: ${customButton.bitmap}</small>
                </div>
            `;
        }
        
        // Store custom button data
        gridItem.dataset.customButtonId = customButton.id;
        gridItem.dataset.buttonType = 'custom';
        
        // Add to global custom buttons array
        if (!window.customButtons) {
            window.customButtons = [];
        }
        window.customButtons.push(customButton);
        
        // Apply spanning if needed
        if (customButton.v > 1 || customButton.h > 1) {
            const gridIndex = window.currentGridPosition;
            const startRow = Math.floor(gridIndex / 10);
            const startCol = gridIndex % 10;
            
            // Apply CSS Grid spanning
            gridItem.style.gridRow = `${startRow + 1} / span ${customButton.v}`;
            gridItem.style.gridColumn = `${startCol + 1} / span ${customButton.h}`;
            gridItem.style.zIndex = '10';
            
            // Mark spanned cells
            if (window.screenManager && window.screenManager.screens.has(window.screenManager.currentScreenId)) {
                const screen = window.screenManager.screens.get(window.screenManager.currentScreenId);
                if (!screen.gridState) screen.gridState = new Array(90).fill(null);
                
                // Mark occupied cells
                for (let row = startRow; row < startRow + customButton.v && row < 9; row++) {
                    for (let col = startCol; col < startCol + customButton.h && col < 10; col++) {
                        const spanIndex = row * 10 + col;
                        if (spanIndex !== gridIndex && spanIndex < 90) {
                            if (spanIndex < gridItems.length) {
                                const spanItem = gridItems[spanIndex];
                                spanItem.style.display = 'none';
                                spanItem.dataset.isSpanned = 'true';
                                spanItem.dataset.parentIndex = gridIndex;
                                
                                // Mark in grid state
                                screen.gridState[spanIndex] = {
                                    isSpanned: true,
                                    parentIndex: gridIndex,
                                    buttonType: 'spanned'
                                };
                            }
                        }
                    }
                }
            }
        }
        
        // Store button data in grid state (for both spanning and non-spanning)
        if (window.screenManager && window.screenManager.screens.has(window.screenManager.currentScreenId)) {
            const screen = window.screenManager.screens.get(window.screenManager.currentScreenId);
            if (!screen.gridState) screen.gridState = new Array(90).fill(null);
            
            // Store main button data
            screen.gridState[window.currentGridPosition] = {
                index: window.currentGridPosition,
                customButtonId: customButton.id,
                buttonType: 'custom',
                v: customButton.v,
                h: customButton.h,
                innerHTML: gridItem.innerHTML
            };
            
            console.log('Stored custom button in grid state:', {
                position: window.currentGridPosition,
                customButtonId: customButton.id,
                gridState: screen.gridState[window.currentGridPosition]
            });
        }
        
        // Add delete button overlay
        if (window.addDeleteButtonToGridItem) {
            window.addDeleteButtonToGridItem(gridItem);
        }
        
        // Add edit button overlay for custom buttons
        addEditButtonToCustomButton(gridItem, customButton.id);
        
        // Save to screen manager
        if (window.screenManager) {
            window.screenManager.saveCurrentGridState();
        }
        
        console.log('Custom button created:', customButton);
    }
}

// Function to add edit button to custom buttons
function addEditButtonToCustomButton(gridItem, customButtonId) {
    // Remove any existing edit button
    const existingEditBtn = gridItem.querySelector('.grid-edit-btn');
    if (existingEditBtn) {
        existingEditBtn.remove();
    }
    
    // Create edit button overlay
    const editButton = document.createElement('button');
    editButton.className = 'grid-edit-btn';
    editButton.innerHTML = '✏️';
    editButton.title = 'Edit custom button';
    editButton.style.cssText = `
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #ffc107;
        color: #212529;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    `;
    
    editButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editCustomButton(customButtonId, gridItem);
    });
    
    // Add hover effects
    editButton.addEventListener('mouseenter', () => {
        editButton.style.background = '#e0a800';
        editButton.style.transform = 'scale(1.1)';
    });
    
    editButton.addEventListener('mouseleave', () => {
        editButton.style.background = '#ffc107';
        editButton.style.transform = 'scale(1)';
    });
    
    // Ensure the grid item has relative positioning
    gridItem.style.position = 'relative';
    
    gridItem.appendChild(editButton);
}

// Function to edit an existing custom button
function editCustomButton(customButtonId, gridItem) {
    const customButton = window.customButtons ? window.customButtons.find(b => b.id === customButtonId) : null;
    
    if (!customButton) {
        alert('Custom button not found!');
        return;
    }
    
    // Calculate and set the current grid position
    const gridItems = document.querySelectorAll('.grid-item');
    const gridIndex = Array.from(gridItems).indexOf(gridItem);
    
    if (gridIndex === -1) {
        alert('Could not determine grid position for this button!');
        return;
    }
    
    // Set the current grid position so createCustomButton can find it
    window.currentGridPosition = gridIndex;
    
    // Store the grid item for later use
    window.editingCustomButtonGridItem = gridItem;
    window.editingCustomButtonId = customButtonId;
    
    // Open custom button creator with existing data
    openCustomButtonCreator();
    
    // Populate the form with existing data
    setTimeout(() => {
        document.getElementById('custom-title').value = customButton.title;
        document.getElementById('custom-image').value = customButton.bitmap || '';
        document.getElementById('custom-width').value = customButton.h || 1;
        document.getElementById('custom-height').value = customButton.v || 1;
        document.getElementById('custom-bg-color').value = customButton.bgup || 'WHITE';
        document.getElementById('custom-text-color').value = customButton.textup || 'BLACK';
        
        // Clear existing actions and populate with button's actions
        const actionsContainer = document.getElementById('actions-container');
        actionsContainer.innerHTML = '';
        
        // Reinitialize with existing actions
        customButton.actions.forEach((action, index) => {
            // Trigger add action
            document.getElementById('add-action-btn').click();
            
            // Populate action data
            setTimeout(() => {
                const actionItems = actionsContainer.querySelectorAll('.action-item');
                const currentActionItem = actionItems[index];
                
                if (currentActionItem) {
                    const workflowInput = currentActionItem.querySelector('.action-workflow');
                    if (workflowInput) workflowInput.value = action.workflow;
                    
                    // Clear existing parameters and add new ones
                    const parametersContainer = currentActionItem.querySelector('.parameters-container');
                    parametersContainer.innerHTML = '';
                    
                    Object.entries(action.params || {}).forEach(([name, value]) => {
                        currentActionItem.querySelector('.add-parameter-btn').click();
                        
                        setTimeout(() => {
                            const paramItems = parametersContainer.querySelectorAll('.parameter-item');
                            const lastParamItem = paramItems[paramItems.length - 1];
                            if (lastParamItem) {
                                lastParamItem.querySelector('.param-name').value = name;
                                lastParamItem.querySelector('.param-value').value = value;
                            }
                        }, 50);
                    });
                }
            }, 100);
        });
        
        // Change button text to "Update"
        const createBtn = document.getElementById('create-custom-btn');
        if (createBtn) {
            createBtn.textContent = 'Update Button';
        }
        
        // Trigger validation for all form fields to check the pre-filled data
        setTimeout(() => {
            const titleInput = document.getElementById('custom-title');
            const imageInput = document.getElementById('custom-image');
            const widthInput = document.getElementById('custom-width');
            const heightInput = document.getElementById('custom-height');
            
            // Trigger input events to run validation
            if (titleInput) titleInput.dispatchEvent(new Event('input'));
            if (imageInput) imageInput.dispatchEvent(new Event('input'));
            if (widthInput) widthInput.dispatchEvent(new Event('input'));
            if (heightInput) heightInput.dispatchEvent(new Event('input'));
        }, 100);
    }, 200);
}

// Convert POS color names to CSS colors (duplicate from productSelector.js)
function convertPOSColor(posColor) {
    const colorMap = {
        'WHITE': '#FFFFFF',
        'BLACK': '#000000',
        'SILVER': '#C0C0C0',
        'GOLD': '#FFD700',
        'ROYALBLUE': '#4169E1',
        'DARKRED': '#8B0000',
        'GREEN': '#008000',
        'LIGHTRED': '#FF6B6B',
        'BRIGHTWHITE': '#FFFFFF',
        'SNOW': '#FFFAFA',
        'LIGHTCYAN': '#E0FFFF',
        'DARKBLUE': '#00008B',
        'NAVAJOWHITE': '#FFDEAD'
    };
    return colorMap[posColor] || '#FFFFFF';
}

// Export functions for global access
window.openCustomButtonCreator = openCustomButtonCreator;
window.editCustomButton = editCustomButton;
window.addEditButtonToCustomButton = addEditButtonToCustomButton;
