// Screen Export functionality - Export configured grid as screen.xml

// Function to export the current grid configuration as screen.xml
function exportScreenXML() {
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
                const bgup = button.colors.bgup;
                const textup = button.colors.textup;
                const bgdn = button.colors.bgdn || 'BLACK';
                const textdn = button.colors.textdn || 'WHITE';
                
                // Build parameters string
                let parametersXML = '';
                if (button.params) {
                    Object.keys(button.params).forEach(key => {
                        parametersXML += `                <Parameter name="${key}" value="${button.params[key]}" />
`;
                    });
                }
                
                xmlContent += `        <Button number="${buttonNumber}" category="1" title="${title}" keyscan="1" keyshift="1"
            bitmap="${bitmap}" bitmapdn="" textup="${textup}" textdn="${textdn}" bgup="${bgup}"
            bgdn="${bgdn}" v="1" h="1" outageModeButtonDisabled="true">
            <Action type="onclick" workflow="${button.workflow}">
${parametersXML}            </Action>
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
    try {
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
        
        console.log('Screen XML exported successfully');
        alert('Screen configuration exported successfully!');
    } catch (error) {
        console.error('Error exporting screen XML:', error);
        alert('Error exporting screen configuration: ' + error.message);
    }
}

// Function to get current configuration summary
function getConfigurationSummary() {
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
        total: gridItems.length,
        products: productCount,
        specialButtons: specialButtonCount,
        empty: emptyCount
    };
}

// Export functions for global access
window.exportScreenXML = exportScreenXML;
window.downloadScreenXML = downloadScreenXML;
window.getConfigurationSummary = getConfigurationSummary;
