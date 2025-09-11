// Screen Import functionality - Import screen.xml files

// Function to open import dialog
function openImportDialog() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xml';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            importScreenXML(file);
        }
        // Clean up
        document.body.removeChild(fileInput);
    });
    
    // Add to DOM and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();
}

// Function to import screen XML file
function importScreenXML(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const xmlContent = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            
            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Invalid XML file');
            }
            
            // Parse the XML and import screens
            parseAndImportScreens(xmlDoc);
            
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing file: ' + error.message + '\n\nPlease make sure the file is a valid screen.xml file.');
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
}

// Function to parse XML and import screens
function parseAndImportScreens(xmlDoc) {
    if (!window.screenManager) {
        alert('Screen manager not available. Please refresh the page and try again.');
        return;
    }
    
    const screens = xmlDoc.querySelectorAll('Screen');
    if (screens.length === 0) {
        alert('No screens found in the XML file.');
        return;
    }
    
    // Show import preview modal
    showImportPreviewModal(screens);
}

// Function to show import preview modal
function showImportPreviewModal(screens) {
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
    
    // Generate screen list for preview
    const screenList = Array.from(screens).map(screen => {
        const number = screen.getAttribute('number');
        const title = screen.getAttribute('title') || `Screen ${number}`;
        const buttonCount = screen.querySelectorAll('Button').length;
        const hasProductButtons = screen.querySelectorAll('Button[productCode]').length > 0;
        
        return {
            number: parseInt(number),
            title: title,
            buttonCount: buttonCount,
            hasProducts: hasProductButtons
        };
    }).sort((a, b) => a.number - b.number);
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <h3 style="margin: 0 0 15px 0; color: #333;">Import Screen Configuration</h3>
            <p style="margin: 0 0 15px 0; color: #666;">
                Found ${screens.length} screen(s) in the XML file. Select which screens to import:
            </p>
            
            <div style="margin-bottom: 15px; max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
                ${screenList.map(screen => `
                    <div style="
                        padding: 8px 12px;
                        border-bottom: 1px solid #eee;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <label style="display: flex; align-items: center; flex: 1; cursor: pointer;">
                            <input type="checkbox" class="screen-import-checkbox" 
                                value="${screen.number}" 
                                ${screen.number === 301 ? 'checked' : 'checked'}
                                style="margin-right: 8px;">
                            <div>
                                <div style="font-weight: bold; color: #333;">
                                    Screen ${screen.number}: ${screen.title}
                                </div>
                                <div style="font-size: 12px; color: #666;">
                                    ${screen.buttonCount} buttons${screen.hasProducts ? ', includes products' : ''}
                                </div>
                            </div>
                        </label>
                        ${window.screenManager.screens.has(screen.number) ? `
                            <span style="
                                background: #ffc107;
                                color: #856404;
                                padding: 2px 6px;
                                border-radius: 3px;
                                font-size: 11px;
                                margin-left: 8px;
                            ">Will Replace</span>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="import-preserve-existing" checked style="margin-right: 8px;">
                    <span style="color: #333;">Preserve existing screens not in import</span>
                </label>
                <small style="color: #666; margin-left: 24px; display: block; margin-top: 4px;">
                    If unchecked, all current screens will be cleared before import
                </small>
            </div>
            
            <div style="text-align: right; gap: 10px; display: flex; justify-content: flex-end;">
                <button id="cancel-import" style="
                    padding: 8px 16px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Cancel</button>
                <button id="proceed-import" style="
                    padding: 8px 16px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Import Selected</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle cancel
    document.getElementById('cancel-import').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle import
    document.getElementById('proceed-import').addEventListener('click', () => {
        const selectedScreens = Array.from(modal.querySelectorAll('.screen-import-checkbox:checked'))
            .map(cb => parseInt(cb.value));
        const preserveExisting = document.getElementById('import-preserve-existing').checked;
        
        if (selectedScreens.length === 0) {
            alert('Please select at least one screen to import.');
            return;
        }
        
        document.body.removeChild(modal);
        
        // Proceed with import
        executeImport(screens, selectedScreens, preserveExisting);
    });
}

// Function to execute the import
function executeImport(screens, selectedScreenNumbers, preserveExisting) {
    try {
        // Save current grid state before import
        if (window.screenManager) {
            window.screenManager.saveCurrentGridState();
        }
        
        // Clear existing screens if not preserving
        if (!preserveExisting) {
            const screensToDelete = Array.from(window.screenManager.screens.keys())
                .filter(id => id !== 301); // Never delete the default screen
            
            screensToDelete.forEach(screenId => {
                window.screenManager.screens.delete(screenId);
            });
        }
        
        let importedCount = 0;
        let errorCount = 0;
        
        // Import selected screens
        Array.from(screens).forEach(screenElement => {
            const screenNumber = parseInt(screenElement.getAttribute('number'));
            
            if (!selectedScreenNumbers.includes(screenNumber)) {
                return; // Skip unselected screens
            }
            
            try {
                importSingleScreen(screenElement);
                importedCount++;
            } catch (error) {
                console.error(`Error importing screen ${screenNumber}:`, error);
                errorCount++;
            }
        });
        
        // Update UI
        if (window.screenManager) {
            window.screenManager.renderScreenList();
            window.screenManager.loadGridState(window.screenManager.currentScreenId);
        }
        
        // Show success message
        const message = `Import completed!\n\n` +
            `✅ Successfully imported: ${importedCount} screen(s)\n` +
            (errorCount > 0 ? `❌ Errors: ${errorCount} screen(s)\n` : '') +
            `\nNote: Product images may not display if not found in your system.`;
        
        alert(message);
        
    } catch (error) {
        console.error('Import execution error:', error);
        alert('Error during import: ' + error.message);
    }
}

// Function to import a single screen
function importSingleScreen(screenElement) {
    const screenNumber = parseInt(screenElement.getAttribute('number'));
    const screenTitle = screenElement.getAttribute('title') || `Screen ${screenNumber}`;
    const isDefault = screenNumber === 301;
    
    // Store the complete screen XML attributes and actions for export
    const screenAttribs = {
        number: screenElement.getAttribute('number'),
        timeout: screenElement.getAttribute('timeout') || 'false',
        type: screenElement.getAttribute('type') || '1000',
        title: screenElement.getAttribute('title') || `Screen ${screenNumber}`,
        bgimage: screenElement.getAttribute('bgimage') || 'BckGround01.png'
    };
    
    // Store screen-level actions
    const screenActions = Array.from(screenElement.querySelectorAll(':scope > Action')).map(action => {
        const actionData = {
            type: action.getAttribute('type'),
            workflow: action.getAttribute('workflow')
        };
        
        // Store parameters
        const params = {};
        action.querySelectorAll('Parameter').forEach(param => {
            params[param.getAttribute('name')] = param.getAttribute('value');
        });
        if (Object.keys(params).length > 0) {
            actionData.params = params;
        }
        
        return actionData;
    });
    
    // Create or update screen in screen manager
    if (window.screenManager.screens.has(screenNumber)) {
        // Update existing screen
        const existingScreen = window.screenManager.screens.get(screenNumber);
        existingScreen.name = screenTitle;
        existingScreen.gridState = new Array(90).fill(null); // Clear existing state
        existingScreen.originalAttributes = screenAttribs;
        existingScreen.originalActions = screenActions;
    } else {
        // Create new screen
        window.screenManager.createScreen(screenNumber, isDefault);
        const screen = window.screenManager.screens.get(screenNumber);
        screen.name = screenTitle;
        screen.originalAttributes = screenAttribs;
        screen.originalActions = screenActions;
    }
    
    // Parse buttons from the screen
    const buttons = screenElement.querySelectorAll('Button');
    const gridState = new Array(90).fill(null);
    const allButtons = []; // Store all buttons including those beyond grid
    
    buttons.forEach(button => {
        const buttonNumber = parseInt(button.getAttribute('number'));
        const gridIndex = buttonNumber - 1; // Convert to 0-based index
        const cellData = parseButtonData(button);
        
        // Store all buttons in the allButtons array
        allButtons.push({
            buttonNumber: buttonNumber,
            cellData: cellData
        });
        
        // Only add to gridState if it fits in the 9x10 grid (positions 1-90)
        if (gridIndex >= 0 && gridIndex < 90) {
            gridState[gridIndex] = cellData;
        }
    });
    
    // Update screen's grid state and store all buttons for export
    const screen = window.screenManager.screens.get(screenNumber);
    screen.gridState = gridState;
    screen.allButtons = allButtons; // Store all buttons including hidden ones
    
    // Update nextScreenId if needed
    if (screenNumber >= window.screenManager.nextScreenId) {
        window.screenManager.nextScreenId = screenNumber + 1;
    }
    
    // Log information about hidden buttons
    const hiddenButtons = allButtons.filter(btn => btn.buttonNumber > 90);
    if (hiddenButtons.length > 0) {
        console.log(`Screen ${screenNumber}: ${hiddenButtons.length} buttons beyond position 90 will be hidden but preserved for export`);
    }
}

// Function to parse button data from XML
function parseButtonData(buttonElement) {
    const title = buttonElement.getAttribute('title') || '';
    const bitmap = buttonElement.getAttribute('bitmap') || '';
    const productCode = buttonElement.getAttribute('productCode');
    
    // Store the complete original XML structure for export
    const originalXML = buttonElement.outerHTML;
    
    // Get the title from Language section if available, otherwise use main title
    let displayTitle = title;
    const languageElement = buttonElement.querySelector('Language[code="en_US"] title, Language title');
    if (languageElement) {
        displayTitle = languageElement.textContent || title;
    }
    
    // Check if it's a product button
    if (productCode) {
        return {
            index: parseInt(buttonElement.getAttribute('number')) - 1,
            productCode: productCode,
            buttonType: 'product',
            originalXML: originalXML,
            innerHTML: createProductButtonHTML(displayTitle, bitmap, productCode)
        };
    }
    
    // Check for screen navigation buttons
    const actions = buttonElement.querySelectorAll('Action[type="onclick"]');
    for (let action of actions) {
        const workflow = action.getAttribute('workflow');
        if (workflow === 'WF_ShowScreen') {
            const screenParam = action.querySelector('Parameter[name="ScreenNumber"]');
            if (screenParam) {
                const targetScreen = screenParam.getAttribute('value');
                const buttonId = `screen-${targetScreen}`;
                
                // Create screen button object and add to screenButtons array if not already exists
                if (window.screenButtons && !window.screenButtons.find(b => b.id === buttonId)) {
                    const screenButtonObj = {
                        id: buttonId,
                        title: displayTitle.replace(/\\n/g, '\\n'), // Ensure proper escaping
                        bitmap: bitmap,
                        bgup: buttonElement.getAttribute('bgup') || 'WHITE',
                        textup: buttonElement.getAttribute('textup') || 'BLACK',
                        bgdn: buttonElement.getAttribute('bgdn') || 'BLACK',
                        textdn: buttonElement.getAttribute('textdn') || 'WHITE',
                        keyscan: buttonElement.getAttribute('keyscan') || '0',
                        keyshift: buttonElement.getAttribute('keyshift') || '0',
                        actions: [{
                            type: 'onclick',
                            workflow: workflow,
                            params: {
                                ScreenNumber: targetScreen
                            }
                        }]
                    };
                    window.screenButtons.push(screenButtonObj);
                    console.log(`Added screen button ${buttonId} to screenButtons array`);
                } else {
                    console.log(`Screen button ${buttonId} already exists`);
                }
                
                return {
                    index: parseInt(buttonElement.getAttribute('number')) - 1,
                    screenButtonId: buttonId,
                    buttonType: 'screen',
                    customScreenNumber: targetScreen,
                    originalXML: originalXML,
                    innerHTML: createScreenButtonHTML(displayTitle, bitmap, targetScreen)
                };
            }
        }
    }
    
    // For other buttons, create a generic button representation
    return {
        index: parseInt(buttonElement.getAttribute('number')) - 1,
        specialButtonId: `imported-${Date.now()}-${Math.random()}`,
        buttonType: 'special',
        originalXML: originalXML,
        innerHTML: createGenericButtonHTML(displayTitle, bitmap)
    };
}

// Helper function to create product button HTML
function createProductButtonHTML(title, bitmap, productCode) {
    // Try to find product in the existing products list
    let product = null;
    if (window.products && Array.isArray(window.products)) {
        product = window.products.find(p => p.code === productCode);
    }
    
    const displayTitle = product ? (product.displayTitle || product.shortName) : title;
    const displayImage = product ? product.image : bitmap;
    
    if (displayImage) {
        // If we have an image, use the same format as working products but with fallback text
        return `<img src="${window.getImageUrl ? window.getImageUrl(displayImage) : `/US-NP6-Images/${displayImage}`}" alt="${displayTitle}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                " onerror="
                    this.style.display='none'; 
                    this.parentElement.style.backgroundColor='#f8f8f8';
                    this.parentElement.innerHTML='<div style=\\'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f8f8f8; color: #333; font-size: 10px; text-align: center; line-height: 1.2; padding: 4px; box-sizing: border-box;\\'>${displayTitle.replace(/\\n/g, '<br>')}</div>';
                ">`;
    } else {
        // If no image, show text directly
        return `<div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f8f8;
            color: #333;
            font-size: 10px;
            text-align: center;
            line-height: 1.2;
            padding: 4px;
            box-sizing: border-box;
        ">${displayTitle.replace(/\\n/g, '<br>')}</div>`;
    }
}

// Helper function to create screen button HTML
function createScreenButtonHTML(title, bitmap, targetScreen) {
    return `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #17a2b8, #138496);
            color: white;
            border-radius: 4px;
            padding: 4px;
            box-sizing: border-box;
            text-align: center;
        ">
            <div style="
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 2px;
            ">SCREEN</div>
            <div style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 2px;
            ">${targetScreen}</div>
            <div style="
                font-size: 8px;
                line-height: 1.1;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            ">
                ${title.replace(/\\n/g, '<br>')}
            </div>
        </div>
    `;
}

// Helper function to create generic button HTML
function createGenericButtonHTML(title, bitmap) {
    return `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #6c757d, #5a6268);
            color: white;
            border-radius: 4px;
            padding: 4px;
            box-sizing: border-box;
            text-align: center;
            position: relative;
        ">
            ${bitmap ? `
                <img src="${window.getImageUrl ? window.getImageUrl(bitmap) : `/US-NP6-Images/${bitmap}`}" 
                     alt="${title}" 
                     style="
                        width: 100%;
                        height: 100%;
                        object-fit: fill;
                        display: block;
                     "
                     onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                     ">
                <div style="
                    font-size: 9px;
                    line-height: 1.1;
                    overflow: hidden;
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    padding: 4px;
                    box-sizing: border-box;
                ">
                    ${title.replace(/\\n/g, '<br>')}
                </div>
            ` : `
                <div style="
                    font-size: 9px;
                    line-height: 1.1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                ">
                    ${title.replace(/\\n/g, '<br>')}
                </div>
            `}
        </div>
    `;
}

// Export functions for global access
window.openImportDialog = openImportDialog;
window.importScreenXML = importScreenXML;
