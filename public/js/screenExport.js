// Screen Export functionality - Export configured grid as screen.xml

// Global XML helper functions
function escapeXML(str) {
    if (!str) return str;
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapeXMLAttribute(str) {
    if (!str) return str;
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// XML formatter using js-beautify library
function formatXML(xmlString) {
    try {
        // Use js-beautify's HTML formatter which handles XML well
        if (typeof html_beautify !== 'undefined') {
            return html_beautify(xmlString, {
                indent_size: 4,
                indent_char: ' ',
                max_preserve_newlines: 1,
                preserve_newlines: true,
                keep_array_indentation: false,
                break_chained_methods: false,
                indent_scripts: 'keep',
                brace_style: 'collapse',
                space_before_conditional: true,
                unescape_strings: false,
                jslint_happy: false,
                end_with_newline: false,
                wrap_line_length: 0,
                indent_inner_html: true,
                comma_first: false,
                e4x: true,
                indent_empty_lines: false
            });
        } else {
            console.warn('js-beautify not loaded, using original XML');
            return xmlString;
        }
    } catch (error) {
        console.error('Error formatting XML with js-beautify:', error);
        return xmlString; // Return original if formatting fails
    }
}

// Function to export all screens to XML format
async function exportScreenXML() {
    // Ensure products data is loaded
    if (!window.productsData || window.productsData.length === 0) {
        console.log('Loading products data for export...');
        try {
            const response = await fetch('/products.json');
            const data = await response.json();
            window.productsData = data.products || [];
            window.specialButtons = data.specialButtons || [];
            window.numberButtons = data.numberButtons || [];
            window.screenButtons = data.screenButtons || [];
            console.log(`Loaded ${window.productsData.length} products, ${window.specialButtons.length} special buttons, ${window.numberButtons.length} number buttons, ${window.screenButtons.length} screen buttons for export`);
        } catch (error) {
            console.error('Error loading products data for export:', error);
        }
    }
    
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
    
    // Format the XML for pretty printing
    const formattedXML = formatXML(xmlContent);
    console.log('XML formatted for pretty printing');
    
    return formattedXML;
}

// Function to export a single screen's data
function exportScreenData(screen) {
    const screenNumber = screen.id;
    let screenTitle = screen.name || `Screen ${screenNumber}`;
    
    // Use original screen attributes if available (for imported screens)
    let screenAttribs = '';
    if (screen.originalAttributes) {
        const attrs = screen.originalAttributes;
        screenAttribs = `number="${escapeXMLAttribute(attrs.number)}" timeout="${escapeXMLAttribute(attrs.timeout)}" type="${escapeXMLAttribute(attrs.type)}" title="${escapeXMLAttribute(attrs.title)}" bgimage="${escapeXMLAttribute(attrs.bgimage)}"`;
        screenTitle = attrs.title; // Use original title for consistency
    } else {
        // Default attributes for manually created screens
        screenAttribs = `number="${screenNumber}" timeout="false" type="1000" title="${escapeXMLAttribute(screenTitle)}" bgimage="BckGround01.png"`;
    }
    
    let xmlContent = `<Screen ${screenAttribs}>
`;

    // Add screen-level actions
    if (screen.originalActions && screen.originalActions.length > 0) {
        screen.originalActions.forEach(action => {
            let actionParams = '';
            if (action.params) {
                Object.keys(action.params).forEach(key => {
                    actionParams += `<Parameter name="${escapeXMLAttribute(key)}" value="${escapeXMLAttribute(action.params[key])}" />
`;
                });
            }
            xmlContent += `<Action type="${escapeXMLAttribute(action.type)}" workflow="${escapeXMLAttribute(action.workflow)}">
${actionParams}</Action>
`;
        });
    } else {
        // Default actions for manually created screens
        xmlContent += `<Action type="onactivate" workflow="DoNothing"></Action>
<Action type="oncomplete" workflow="WF_ShowPrice">
<Parameter name="floatScreen" value="false" />
</Action>
`;
    }

    // Always use gridState to ensure current modifications are preserved
    // Don't use allButtons as it contains original imported data, not current state
    
    // Process each grid cell in the screen
    if (screen.gridState && screen.gridState.length > 0) {
        screen.gridState.forEach((cellData, index) => {
            if (!cellData) return;
            
            // Button number should be the grid position + 1 (1-indexed)
            const buttonNumber = index + 1;
            
            // If we have original XML, use it directly for perfect preservation
            if (cellData.originalXML) {
                // Update the button number in the original XML to maintain proper grid positioning
                let originalXML = cellData.originalXML;
                originalXML = originalXML.replace(/number="\d+"/, `number="${buttonNumber}"`);
                
                // Just clean up extra whitespace but preserve line structure
                const cleanedXML = originalXML
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line)
                    .join('\n');
                
                xmlContent += cleanedXML + '\n';
                return;
            }
            
            // Fallback to manual generation for buttons without original XML
            const productCode = cellData.productCode;
            const specialButtonId = cellData.specialButtonId;
            const numberButtonId = cellData.numberButtonId;
            const screenButtonId = cellData.screenButtonId;
            const buttonType = cellData.buttonType;
            
            if (productCode && buttonType !== 'special') {
                // Regular product button - search in all available product arrays
                let product = null;
                
                // First try window.productsData (main array)
                if (window.productsData) {
                    product = window.productsData.find(p => p.productCode === productCode);
                }
                
                // Fallback to window.products if available
                if (!product && window.products) {
                    product = window.products.find(p => p.code === productCode || p.productCode === productCode);
                }
                
                if (product) {
                    // Use the correct property names for the products.json structure
                    const title = escapeXMLAttribute(product.displayTitle || product.csoName || product.longName || product.shortName || `Product ${productCode}`);
                    const bitmap = escapeXMLAttribute(product.screenBitmap || product.imageName || product.image || 'default.png');
                    
                    // Use actual product button styling if available
                    const buttonStyling = product.buttonStyling || {};
                    const textup = buttonStyling.textup || 'BLACK';
                    const textdn = buttonStyling.textdn || 'WHITE';
                    const bgup = buttonStyling.bgup || 'WHITE';
                    const bgdn = buttonStyling.bgdn || 'BLACK';
                    const outageModeDisabled = buttonStyling.outageModeButtonDisabled || 'false';
                    
                    xmlContent += `<Button number="${buttonNumber}" category="1" title="${title}" keyscan="0" keyshift="0" bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}" bgdn="${bgdn}" v="1" h="1" productCode="${escapeXMLAttribute(productCode)}" outageModeButtonDisabled="${outageModeDisabled}">
<Action type="onclick" workflow="WF_DoSale">
<Parameter name="ProductCode" value="${escapeXMLAttribute(productCode)}" />
</Action>
<Language code="en_US" name="English" parent="en">
<title>${escapeXML(product.displayTitle || product.csoName || product.longName || product.shortName || `Product ${productCode}`)}</title>
<bitmap>${escapeXML(product.screenBitmap || product.imageName || product.image || 'default.png')}</bitmap>
</Language>
</Button>
`;
                } else {
                    // Product not found in any database - create button with basic info
                    console.warn(`Product ${productCode} not found in products database`);
                    const title = escapeXMLAttribute(`Product ${productCode}`);
                    
                    xmlContent += `<Button number="${buttonNumber}" category="1" title="${title}" keyscan="0" keyshift="0" bitmap="default.png" bitmapdn="" textup="BLACK" textdn="WHITE" bgup="WHITE" bgdn="BLACK" v="1" h="1" productCode="${escapeXMLAttribute(productCode)}" outageModeButtonDisabled="false">
<Action type="onclick" workflow="WF_DoSale">
<Parameter name="ProductCode" value="${escapeXMLAttribute(productCode)}" />
</Action>
<Language code="en_US" name="English" parent="en">
<title>${escapeXML(`Product ${productCode}`)}</title>
<bitmap>default.png</bitmap>
</Language>
</Button>
`;
                }
            } else if (buttonType === 'special' || specialButtonId) {
                // Special button
                const buttonId = specialButtonId || cellData.specialButtonId;
                const button = window.specialButtons ? window.specialButtons.find(b => b.id === buttonId) : null;
                if (button) {
                    const title = escapeXMLAttribute(button.title.replace(/\\n/g, '\n'));
                    const keyscan = escapeXMLAttribute(button.keyscan || '0');
                    const keyshift = escapeXMLAttribute(button.keyshift || '0');
                    const bitmap = escapeXMLAttribute(button.bitmap || '');
                    const textup = button.textup || 'BLACK';
                    const textdn = button.textdn || 'WHITE';
                    const bgup = button.bgup || 'WHITE';
                    const bgdn = button.bgdn || 'BLACK';
                    const v = button.v || '1';
                    const h = button.h || '1';
                    const outageModeDisabled = button.outageModeButtonDisabled || 'false';
                    
                    let buttonXML = `<Button number="${buttonNumber}" category="1" title="${title}" keyscan="${keyscan}" keyshift="${keyshift}" bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}" bgdn="${bgdn}" v="${v}" h="${h}" outageModeButtonDisabled="${outageModeDisabled}">`;
                    
                    // Add actions if they exist
                    if (button.actions && button.actions.length > 0) {
                        for (const action of button.actions) {
                            buttonXML += `\n<Action type="${action.type}" workflow="${action.workflow}">`;
                            if (action.params) {
                                for (const [paramName, paramValue] of Object.entries(action.params)) {
                                    buttonXML += `\n<Parameter name="${escapeXMLAttribute(paramName)}" value="${escapeXMLAttribute(paramValue)}" />`;
                                }
                            }
                            buttonXML += `\n</Action>`;
                        }
                    }
                    
                    buttonXML += `\n<Language code="en_US" name="English" parent="en">
<title>${escapeXML(button.title.replace(/\\n/g, '\n'))}</title>
<bitmap>${escapeXML(button.bitmap || '')}</bitmap>
</Language>
</Button>
`;
                    xmlContent += buttonXML;
                }
            } else if (buttonType === 'number' || cellData.numberButtonId) {
                // Number button
                const numberButtonId = cellData.numberButtonId;
                if (numberButtonId && window.numberButtons) {
                    const numberButton = window.numberButtons.find(b => b.id === numberButtonId);
                    if (numberButton) {
                        const title = escapeXMLAttribute(numberButton.title || '');
                        const keyscan = escapeXMLAttribute(numberButton.keyscan || '0');
                        const keyshift = escapeXMLAttribute(numberButton.keyshift || '0');
                        const bitmap = escapeXMLAttribute(numberButton.bitmap || '');
                        const textup = numberButton.textup || 'BLACK';
                        const textdn = numberButton.textdn || 'WHITE';
                        const bgup = numberButton.bgup || 'WHITE';
                        const bgdn = numberButton.bgdn || 'BLACK';
                        const v = numberButton.v || '1';
                        const h = numberButton.h || '1';
                        const outageModeDisabled = numberButton.outageModeButtonDisabled || 'false';
                        
                        let buttonXML = `<Button number="${buttonNumber}" category="1" title="${title}" keyscan="${keyscan}" keyshift="${keyshift}" bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}" bgdn="${bgdn}" v="${v}" h="${h}" outageModeButtonDisabled="${outageModeDisabled}">`;
                        
                        // Add actions if they exist
                        if (numberButton.actions && numberButton.actions.length > 0) {
                            for (const action of numberButton.actions) {
                                buttonXML += `\n<Action type="${action.type}" workflow="${action.workflow}">`;
                                if (action.params) {
                                    for (const [paramName, paramValue] of Object.entries(action.params)) {
                                        buttonXML += `\n<Parameter name="${escapeXMLAttribute(paramName)}" value="${escapeXMLAttribute(paramValue)}" />`;
                                    }
                                }
                                buttonXML += `\n</Action>`;
                            }
                        }
                        
                        buttonXML += `\n<Language code="en_US" name="English" parent="en">
<title>${escapeXML(numberButton.title || '')}</title>
<bitmap>${escapeXML(numberButton.bitmap || '')}</bitmap>
</Language>
</Button>
`;
                        xmlContent += buttonXML;
                    }
                }
            } else if (buttonType === 'screen' || cellData.screenButtonId) {
                // Screen button
                const screenButtonId = cellData.screenButtonId;
                const customScreenNumber = cellData.customScreenNumber || '301';
                
                // Try to get the actual screen button for better title and styling
                let button = null;
                if (screenButtonId && window.screenButtons) {
                    button = window.screenButtons.find(b => b.id === screenButtonId);
                }
                
                const title = button ? escapeXMLAttribute(button.title.replace(/\\n/g, '\n')) : escapeXMLAttribute(`Screen ${customScreenNumber}`);
                const bitmap = button ? escapeXMLAttribute(button.bitmap || '') : '';
                const textup = button ? (button.textup || 'BLACK') : 'BLACK';
                const textdn = button ? (button.textdn || 'WHITE') : 'WHITE';
                const bgup = button ? (button.bgup || 'WHITE') : 'WHITE';
                const bgdn = button ? (button.bgdn || 'BLACK') : 'BLACK';
                const v = button ? (button.v || '1') : '1';
                const h = button ? (button.h || '1') : '1';
                const keyscan = button ? (button.keyscan || '0') : '0';
                const keyshift = button ? (button.keyshift || '0') : '0';
                const outageModeDisabled = button ? (button.outageModeButtonDisabled || 'false') : 'false';
                
                let buttonXML = `<Button number="${buttonNumber}" category="1" title="${title}" keyscan="${keyscan}" keyshift="${keyshift}" bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}" bgdn="${bgdn}" v="${v}" h="${h}" outageModeButtonDisabled="${outageModeDisabled}">`;
                
                // Add actions - prioritize the actual button actions if available, otherwise use screen navigation
                if (button && button.actions && button.actions.length > 0) {
                    for (const action of button.actions) {
                        buttonXML += `\n<Action type="${action.type}" workflow="${action.workflow}">`;
                        if (action.params) {
                            for (const [paramName, paramValue] of Object.entries(action.params)) {
                                // If this is a ScreenNumber parameter and we have a custom screen number, use it
                                const finalValue = (paramName === 'ScreenNumber' && customScreenNumber) ? customScreenNumber : paramValue;
                                buttonXML += `\n<Parameter name="${escapeXMLAttribute(paramName)}" value="${escapeXMLAttribute(finalValue)}" />`;
                            }
                        }
                        buttonXML += `\n</Action>`;
                    }
                } else {
                    // Default screen navigation action
                    buttonXML += `\n<Action type="onclick" workflow="WF_ShowScreen">
<Parameter name="ScreenNumber" value="${escapeXMLAttribute(customScreenNumber)}" />
</Action>`;
                }
                
                buttonXML += `\n<Language code="en_US" name="English" parent="en">
<title>${escapeXML(button ? button.title.replace(/\\n/g, '\n') : `Screen ${customScreenNumber}`)}</title>
<bitmap>${escapeXML(bitmap)}</bitmap>
</Language>
</Button>
`;
                xmlContent += buttonXML;
            }
        });
    }
    
    xmlContent += `</Screen>
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
            // Special button - using old format for backward compatibility in single screen export
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
                
                // Build actions XML - check for new format first, then fall back to old format
                let actionsXML = '';
                
                if (button.actions && Array.isArray(button.actions)) {
                    // New format
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
                } else {
                    // Old format fallback
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
                    
                    let onClickParams = '';
                    if (button.params) {
                        Object.keys(button.params).forEach(key => {
                            onClickParams += `                <Parameter name="${key}" value="${button.params[key]}" />
`;
                        });
                    }
                    actionsXML += `            <Action type="onclick" workflow="${button.workflow}">
${onClickParams}            </Action>
`;
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
        } else if (item.dataset.numberButtonId && buttonType === 'number') {
            // Number button
            const numberButton = numberButtons.find(b => b.id === item.dataset.numberButtonId);
            if (numberButton) {
                const title = numberButton.title || '';
                const bitmap = numberButton.bitmap || '';
                
                xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="1" keyshift="1" bitmap="${bitmap}"
            bitmapdn="" textup="BLACK" textdn="WHITE" bgup="WHITE" bgdn="BLACK" v="1" h="1"
            outageModeButtonDisabled="true">
            <Action type="onclick" workflow="WF_DoQuantum">
                <Parameter name="Quantity" value="${numberButton.actions[0].params.Quantity}" />
            </Action>
            <Language code="en_US" name="English" parent="en">
                <title>${title}</title>
                <bitmap>${bitmap}</bitmap>
            </Language>
        </Button>
`;
            }
        } else if (item.dataset.screenButtonId && buttonType === 'screen') {
            // Screen button
            const screenButton = screenButtons.find(b => b.id === item.dataset.screenButtonId);
            if (screenButton) {
                const title = screenButton.title || '';
                const bitmap = screenButton.bitmap || '';
                
                // Use custom screen number if available
                const screenNumber = item.dataset.customScreenNumber || screenButton.actions[0].params[Object.keys(screenButton.actions[0].params)[0]];
                
                xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="0" keyshift="0" bitmap="${bitmap}"
            bitmapdn="" textup="BRIGHTWHITE" textdn="WHITE" bgup="DARKBLUE" bgdn="BLACK" v="1" h="1"
            outageModeButtonDisabled="false">
            <Action type="onclick" workflow="${screenButton.actions[0].workflow}">
                <Parameter name="${Object.keys(screenButton.actions[0].params)[0]}" value="${screenNumber}" />
            </Action>
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
    
    xmlContent += `</Screen>
</Screens>`;
    
    // Format the XML for pretty printing
    const formattedXML = formatXML(xmlContent);
    
    return formattedXML;
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
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Starting XML export...');
            console.log('Screen manager available:', !!window.screenManager);
            
            if (window.screenManager) {
                const screens = window.screenManager.getAllScreens();
                console.log('Available screens:', screens.map(s => ({id: s.id, name: s.name, itemCount: s.gridState ? s.gridState.filter(cell => cell).length : 0})));
            }
        
        const xmlContent = await exportScreenXML();
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
        resolve();
    } catch (error) {
        console.error('Error exporting screen XML:', error);
        alert('Error exporting screen configuration: ' + error.message);
        reject(error);
    }
    });
}

// Function to get current configuration summary
function getConfigurationSummary() {
    if (window.screenManager) {
        // Get summary for all screens
        const allScreens = window.screenManager.getAllScreens();
        let totalProducts = 0;
        let totalSpecialButtons = 0;
        let totalNumberButtons = 0;
        let totalScreenButtons = 0;
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
                        } else if (cellData.numberButtonId && cellData.buttonType === 'number') {
                            totalNumberButtons++;
                        } else if (cellData.screenButtonId && cellData.buttonType === 'screen') {
                            totalScreenButtons++;
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
            numberButtons: totalNumberButtons,
            screenButtons: totalScreenButtons,
            empty: totalEmpty
        };
    } else {
        // Fallback to current screen only
        const gridItems = document.querySelectorAll('.grid-item');
        let productCount = 0;
        let specialButtonCount = 0;
        let numberButtonCount = 0;
        let screenButtonCount = 0;
        let emptyCount = 0;
        
        gridItems.forEach(item => {
            if (item.dataset.productCode && item.dataset.buttonType !== 'special') {
                productCount++;
            } else if (item.dataset.specialButtonId && item.dataset.buttonType === 'special') {
                specialButtonCount++;
            } else if (item.dataset.numberButtonId && item.dataset.buttonType === 'number') {
                numberButtonCount++;
            } else if (item.dataset.screenButtonId && item.dataset.buttonType === 'screen') {
                screenButtonCount++;
            } else {
                emptyCount++;
            }
        });
        
        return {
            screens: 1,
            total: gridItems.length,
            products: productCount,
            specialButtons: specialButtonCount,
            numberButtons: numberButtonCount,
            screenButtons: screenButtonCount,
            empty: emptyCount
        };
    }
}

// Export functions for global access
window.exportScreenXML = exportScreenXML;
window.downloadScreenXML = downloadScreenXML;
window.getConfigurationSummary = getConfigurationSummary;
