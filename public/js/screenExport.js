// Screen Export functionality - Export configured grid as screen.xml

// Function to export all screens as screen.xml
function exportScreenXML() {
    // Check if screen manager is available
    if (!window.screenManager) {
        console.warn('Screen manager not available, exporting current screen only');
        return exportSingleScreen();
    }
    
    // Save current grid state before exporting
    window.screenManager.saveCurrentGridState();
    
    const allScreens = window.screenManager.getAllScreens();
    console.log('Exporting screens:', allScreens.map(s => ({id: s.id, name: s.name})));
    
    if (!allScreens || allScreens.length === 0) {
        console.warn('No screens found in screen manager, falling back to single screen export');
        return exportSingleScreen();
    }
    
    const timestamp = new Date().toISOString();
    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Screens version="1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="/RFM2/RFM2PackageConf/PackageXSD/2.1/screen-db.xsd">
`;

    // Export each screen
    allScreens.forEach(screen => {
        console.log(`Exporting screen ${screen.id} with ${screen.gridState ? screen.gridState.filter(cell => cell).length : 0} items`);
        xmlContent += exportScreenData(screen);
    });
    
    xmlContent += `</Screens>`;
    
    console.log(`Total XML length: ${xmlContent.length} characters`);
    return xmlContent;
}

// Function to export a single screen's data
function exportScreenData(screen) {
    const screenNumber = screen.id;
    const screenTitle = screen.name || `Screen ${screenNumber}`;
    
    let xmlContent = `    <Screen number="${screenNumber}" timeout="false" type="1000" title="${screenTitle}" bgimage="BckGround01.png">
        <Action type="onactivate" workflow="DoNothing"></Action>
        <Action type="oncomplete" workflow="WF_ShowPrice">
            <Parameter name="floatScreen" value="false" />
        </Action>
`;

    let buttonNumber = 1;
    
    // Process each grid cell in the screen
    if (screen.gridState && screen.gridState.length > 0) {
        screen.gridState.forEach((cellData, index) => {
            if (!cellData) return;
            
            const productCode = cellData.productCode;
            const specialButtonId = cellData.specialButtonId;
            const buttonType = cellData.buttonType;
            
            if (productCode && buttonType !== 'special') {
                // Regular product button
                const product = productsData.find(p => p.productCode === productCode);
                if (product) {
                    const title = (product.displayTitle || product.shortName || 'Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const bitmap = product.screenBitmap || product.imageName || '';
                    
                    const styling = product.buttonStyling || {};
                    const textup = styling.textup || 'BLACK';
                    const textdn = styling.textdn || 'WHITE';
                    const bgup = styling.bgup || 'WHITE';
                    const bgdn = styling.bgdn || 'BLACK';
                    const outageModeButtonDisabled = styling.outageModeButtonDisabled || 'false';
                    
                    xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="0" keyshift="0" bitmap="${bitmap}"
            bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}" bgdn="${bgdn}" v="1" h="1"
            productCode="${productCode}" outageModeButtonDisabled="${outageModeButtonDisabled}">
            <Action type="onclick" workflow="WF_DoSale">
                <Parameter name="ProductCode" value="${productCode}" />
            </Action>
            <Language code="en_US" name="English" parent="en">
                <title>${title}</title>
                <bitmap>${bitmap}</bitmap>
            </Language>
        </Button>
`;
                }
            } else if (specialButtonId && buttonType === 'special') {
                // Special button
                const button = specialButtons.find(b => b.id === specialButtonId);
                if (button) {
                    const title = button.title.replace(/\\n/g, '\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const bitmap = button.bitmap || '';
                    const bgup = button.bgup || 'WHITE';
                    const textup = button.textup || 'BLACK';
                    const bgdn = button.bgdn || 'BLACK';
                    const textdn = button.textdn || 'WHITE';
                    const keyscan = button.keyscan || '1';
                    const keyshift = button.keyshift || '1';
                    const outageModeButtonDisabled = button.outageModeButtonDisabled || 'true';
                    const v = button.v || '1';
                    const h = button.h || '1';
                    
                    // Build all actions XML from the actions array
                    let actionsXML = '';
                    
                    if (button.actions && Array.isArray(button.actions)) {
                        button.actions.forEach(action => {
                            let actionParams = '';
                            if (action.params) {
                                Object.keys(action.params).forEach(key => {
                                    actionParams += `                <Parameter name="${key}" value="${action.params[key]}" />
`;
                                });
                            }
                            actionsXML += `            <Action type="${action.type}" workflow="${action.workflow}">
${actionParams}            </Action>
`;
                        });
                    }
                    
                    xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="${keyscan}" keyshift="${keyshift}"
            bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}"
            bgdn="${bgdn}" v="${v}" h="${h}" outageModeButtonDisabled="${outageModeButtonDisabled}">
${actionsXML}            <Language code="en_US" name="English" parent="en">
                <title>${title}</title>
                <bitmap>${bitmap}</bitmap>
            </Language>
        </Button>
`;
                }
            }
            
            buttonNumber++;
        });
    }
    
    xmlContent += `    </Screen>
`;
    
    return xmlContent;
}

// Fallback function to export current screen only (for backwards compatibility)
function exportSingleScreen() {
    const gridItems = document.querySelectorAll('.grid-item');
    const screenNumber = 301; // Base screen number
    const timestamp = new Date().toISOString();
    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Screens version="1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="/RFM2/RFM2PackageConf/PackageXSD/2.1/screen-db.xsd">
    <Screen number="${screenNumber}" timeout="false" type="1000" title="Custom Screen" bgimage="BckGround01.png">
        <Action type="onactivate" workflow="DoNothing"></Action>
        <Action type="oncomplete" workflow="WF_ShowPrice">
            <Parameter name="floatScreen" value="false" />
        </Action>
`;

    let buttonNumber = 1;
    
    gridItems.forEach((item, index) => {
        const productCode = item.dataset.productCode;
        const specialButtonId = item.dataset.specialButtonId;
        const buttonType = item.dataset.buttonType;
        
        if (productCode && buttonType !== 'special') {
            // Regular product button
            const product = productsData.find(p => p.productCode === productCode);
            if (product) {
                // Use the displayTitle from screen.xml if available (preserves formatting), otherwise use shortName
                const title = (product.displayTitle || product.shortName || 'Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                // Use screenBitmap from screen.xml if available, otherwise fall back to imageName
                const bitmap = product.screenBitmap || product.imageName || '';
                
                // Use button styling from screen.xml if available, otherwise use defaults
                const styling = product.buttonStyling || {};
                const textup = styling.textup || 'BLACK';
                const textdn = styling.textdn || 'WHITE';
                const bgup = styling.bgup || 'WHITE';
                const bgdn = styling.bgdn || 'BLACK';
                const outageModeButtonDisabled = styling.outageModeButtonDisabled || 'false';
                
                xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="0" keyshift="0" bitmap="${bitmap}"
            bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}" bgdn="${bgdn}" v="1" h="1"
            productCode="${productCode}" outageModeButtonDisabled="${outageModeButtonDisabled}">
            <Action type="onclick" workflow="WF_DoSale">
                <Parameter name="ProductCode" value="${productCode}" />
            </Action>
            <Language code="en_US" name="English" parent="en">
                <title>${title}</title>
                <bitmap>${bitmap}</bitmap>
            </Language>
        </Button>
`;
            }
        } else if (specialButtonId && buttonType === 'special') {
            // Special button
            const button = specialButtons.find(b => b.id === specialButtonId);
            if (button) {
                const title = button.title.replace(/\n/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const bitmap = button.bitmap || '';
                const bgup = button.bgup || 'WHITE';
                const textup = button.textup || 'BLACK';
                const bgdn = button.bgdn || 'BLACK';
                const textdn = button.textdn || 'WHITE';
                const keyscan = button.keyscan || '1';
                const keyshift = button.keyshift || '1';
                const outageModeButtonDisabled = button.outageModeButtonDisabled || 'true';
                const v = button.v || '1';
                const h = button.h || '1';
                
                // Build all actions XML
                let actionsXML = '';
                
                // Add onactivate action if present
                if (button.onActivate) {
                    let onActivateParams = '';
                    if (button.onActivate.params) {
                        Object.keys(button.onActivate.params).forEach(key => {
                            onActivateParams += `                <Parameter name="${key}" value="${button.onActivate.params[key]}" />
`;
                        });
                    }
                    actionsXML += `            <Action type="onactivate" workflow="${button.onActivate.workflow}">
${onActivateParams}            </Action>
`;
                }
                
                // Add onclick action
                let onClickParams = '';
                if (button.params) {
                    Object.keys(button.params).forEach(key => {
                        onClickParams += `                <Parameter name="${key}" value="${button.params[key]}" />
`;
                    });
                }
                actionsXML += `            <Action type="onclick" workflow="${button.workflow}">
${onClickParams}            </Action>`;
                
                xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="${keyscan}" keyshift="${keyshift}"
            bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}"
            bgdn="${bgdn}" v="${v}" h="${h}" outageModeButtonDisabled="${outageModeButtonDisabled}">
${actionsXML}
            <Language code="en_US" name="English" parent="en">
                <title>${title}</title>
                <bitmap>${bitmap}</bitmap>
            </Language>
        </Button>
`;
            }
        }
        
        buttonNumber++;
    });
    
    xmlContent += `    </Screen>
</Screens>`;
    
    return xmlContent;
}

// Function to download the XML file
function downloadScreenXML() {
    // Check if screen manager is ready, if not, wait and retry
    if (!window.screenManager) {
        console.log('Screen manager not yet available, waiting...');
        
        // Try multiple times with increasing delays
        let attempts = 0;
        const maxAttempts = 10;
        
        const waitForScreenManager = () => {
            attempts++;
            console.log(`Attempt ${attempts} - Screen manager available:`, !!window.screenManager);
            
            if (window.screenManager) {
                performXMLExport();
            } else if (attempts < maxAttempts) {
                setTimeout(waitForScreenManager, 200 * attempts); // Increasing delay
            } else {
                alert('Screen manager is not initialized. Please refresh the page and try again.');
            }
        };
        
        waitForScreenManager();
        return;
    }
    
    performXMLExport();
}

function performXMLExport() {
    try {
        console.log('Starting XML export...');
        console.log('Screen manager available:', !!window.screenManager);
        
        if (window.screenManager) {
            const screens = window.screenManager.getAllScreens();
            console.log('Available screens:', screens.map(s => ({id: s.id, name: s.name, itemCount: s.gridState ? s.gridState.filter(cell => cell).length : 0})));
        }
        
        const xmlContent = exportScreenXML();
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `screen_config_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        // Get screen count for feedback
        const screenCount = window.screenManager ? window.screenManager.getAllScreens().length : 1;
        
        console.log(`Screen XML exported successfully (${screenCount} screen${screenCount > 1 ? 's' : ''})`);
        alert(`Screen configuration exported successfully!\n\n${screenCount} screen${screenCount > 1 ? 's' : ''} included in export.`);
    } catch (error) {
        console.error('Error exporting screen XML:', error);
        alert('Error exporting screen configuration: ' + error.message);
    }
}

// Function to get current configuration summary
function getConfigurationSummary() {
    if (window.screenManager) {
        // Get summary for all screens
        const allScreens = window.screenManager.getAllScreens();
        let totalProducts = 0;
        let totalSpecialButtons = 0;
        let totalEmpty = 0;
        let totalCells = 0;
        
        allScreens.forEach(screen => {
            if (screen.gridState && screen.gridState.length > 0) {
                screen.gridState.forEach(cellData => {
                    totalCells++;
                    if (cellData) {
                        if (cellData.productCode && cellData.buttonType !== 'special') {
                            totalProducts++;
                        } else if (cellData.specialButtonId && cellData.buttonType === 'special') {
                            totalSpecialButtons++;
                        } else {
                            totalEmpty++;
                        }
                    } else {
                        totalEmpty++;
                    }
                });
            } else {
                totalCells += 90; // Empty screen
                totalEmpty += 90;
            }
        });
        
        return {
            screens: allScreens.length,
            total: totalCells,
            products: totalProducts,
            specialButtons: totalSpecialButtons,
            empty: totalEmpty
        };
    } else {
        // Fallback to current screen only
        const gridItems = document.querySelectorAll('.grid-item');
        let productCount = 0;
        let specialButtonCount = 0;
        let emptyCount = 0;
        
        gridItems.forEach(item => {
            if (item.dataset.productCode && item.dataset.buttonType !== 'special') {
                productCount++;
            } else if (item.dataset.specialButtonId && item.dataset.buttonType === 'special') {
                specialButtonCount++;
            } else {
                emptyCount++;
            }
        });
        
        return {
            screens: 1,
            total: gridItems.length,
            products: productCount,
            specialButtons: specialButtonCount,
            empty: emptyCount
        };
    }
}

// Export functions for global access
window.exportScreenXML = exportScreenXML;
window.downloadScreenXML = downloadScreenXML;
window.getConfigurationSummary = getConfigurationSummary;
