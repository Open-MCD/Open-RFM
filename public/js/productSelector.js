// Product Selector functionality
let productsData = [];
let currentGridPosition = null;

// Special buttons data based on screen.xml structure
const specialButtons = [
    // COD Lanes
    { id: 'cod1', title: 'COD\n1', bitmap: 'G1_COD1.png', workflow: 'WF_ButtonCOD', params: { COD: '1' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'cod2', title: 'COD\n2', bitmap: 'G1_COD2.png', workflow: 'WF_ButtonCOD', params: { COD: '2' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    
    // Multi Order & Recall Functions
    { id: 'multiorder', title: 'Multi\nOrder', bitmap: 'G1_MLTORDOFF.png', workflow: 'WF_MultiOrder', colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'imagerecall', title: 'Image\nRecall', bitmap: 'G1_IMRCL.png', workflow: 'WF_DoRecallByPreview', colors: { bgup: 'SILVER', textup: 'BLACK' } },
    { id: 'recallbynumber', title: 'Recall\nBy\nNumber', bitmap: 'RecallNum.png', workflow: 'WF_DoRecallByNumber', colors: { bgup: 'WHITE', textup: 'BLACK' } },
    
    // System Functions
    { id: 'grill', title: 'Grill', bitmap: 'G1_GRLL.png', workflow: 'WF_DoGrillStart', colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'manager', title: 'Manager\nMenu', bitmap: 'R1_MGR.png', workflow: 'WF_ShowManagerMenu', colors: { bgup: 'ROYALBLUE', textup: 'SNOW' } },
    { id: 'mymcdonalds', title: 'Loyalty\nOffers', bitmap: 'MyMcD_Rewards_Revised_r1.png', workflow: 'WF_ShowMobileRecallScreen', colors: { bgup: 'LIGHTRED', textup: 'BRIGHTWHITE' } },
    { id: 'specialfunctions', title: 'Special\nFunctions', bitmap: '', workflow: 'WF_ShowScreen', params: { ScreenNumber: '201' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    
    // Order Modifiers
    { id: 'clearchoice', title: 'Clear\nChoice', bitmap: 'Modifiers_ClearChoice.png', workflow: 'WF_DoClearChoiceEx', colors: { bgup: 'DARKRED', textup: 'WHITE' } },
    { id: 'sidechoice', title: 'Side\nChoice', bitmap: 'Modifiers_SideChoice.png', workflow: 'WF_ShowFloatScreenEx', params: { ScreenNumber: '652' }, colors: { bgup: 'GREEN', textup: 'WHITE' } },
    { id: 'voidline', title: 'Void\nLine', bitmap: 'Modifiers_VoidLine.png', workflow: 'WF_DoVoidLine', colors: { bgup: 'DARKRED', textup: 'WHITE' } },
    { id: 'alacarte', title: 'Ala Carte\nShow Prices', bitmap: '', workflow: 'WF_ShowScreen', params: { ScreenNumber: '304' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'takeouttotal', title: 'Take Out\nTotal', bitmap: '', workflow: 'WF_TakeOutTotal', colors: { bgup: 'WHITE', textup: 'BLACK' } },
    
    // Number Buttons
    { id: 'num0', title: '0', bitmap: '0.png', workflow: 'WF_DoQuantum', params: { Quantity: '0' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num1', title: '1', bitmap: '1.png', workflow: 'WF_DoQuantum', params: { Quantity: '1' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num2', title: '2', bitmap: '2.png', workflow: 'WF_DoQuantum', params: { Quantity: '2' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num3', title: '3', bitmap: '3.png', workflow: 'WF_DoQuantum', params: { Quantity: '3' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num4', title: '4', bitmap: '4.png', workflow: 'WF_DoQuantum', params: { Quantity: '4' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num5', title: '5', bitmap: '5.png', workflow: 'WF_DoQuantum', params: { Quantity: '5' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num6', title: '6', bitmap: '6.png', workflow: 'WF_DoQuantum', params: { Quantity: '6' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num7', title: '7', bitmap: '7.png', workflow: 'WF_DoQuantum', params: { Quantity: '7' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num8', title: '8', bitmap: '8.png', workflow: 'WF_DoQuantum', params: { Quantity: '8' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    { id: 'num9', title: '9', bitmap: '9.png', workflow: 'WF_DoQuantum', params: { Quantity: '9' }, colors: { bgup: 'WHITE', textup: 'BLACK' } },
    
    // Size Buttons
    { id: 'sizexs', title: 'XS', bitmap: '', workflow: 'WF_SizeSelection', params: { Size: '0' }, colors: { bgup: 'GOLD', textup: 'BLACK' } },
    { id: 'sizes', title: 'Small', bitmap: 'Y1_SMLL.png', workflow: 'WF_SizeSelection', params: { Size: '1' }, colors: { bgup: 'GOLD', textup: 'BLACK' } },
    { id: 'sizem', title: 'Medium', bitmap: 'Y1_MEDM.png', workflow: 'WF_SizeSelection', params: { Size: '2' }, colors: { bgup: 'GOLD', textup: 'BLACK' } },
    { id: 'sizel', title: 'Large', bitmap: 'Y1_LARGE.png', workflow: 'WF_SizeSelection', params: { Size: '3' }, colors: { bgup: 'GOLD', textup: 'BLACK' } },
    { id: 'sizexl', title: 'XL', bitmap: '', workflow: 'WF_SizeSelection', params: { Size: '4' }, colors: { bgup: 'GOLD', textup: 'BLACK' } },
    { id: 'sizesr', title: 'SR', bitmap: '', workflow: 'WF_SizeSelection', params: { Size: '5' }, colors: { bgup: 'GOLD', textup: 'BLACK' } }
];

// Load products data from JSON
async function loadProductsData() {
    try {
        const response = await fetch('/products.json');
        const data = await response.json();
        productsData = data.products || [];
        console.log(`Loaded ${productsData.length} products`);
        initializeGrid();
    } catch (error) {
        console.error('Error loading products data:', error);
    }
}

// Initialize grid with click handlers
function initializeGrid() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach((item, index) => {
        item.addEventListener('click', () => openProductSelector(index));
        item.style.cursor = 'pointer';
        
        // Add some visual indication that items are clickable
        item.innerHTML = `<div style="font-size: 10px; color: #666; text-align: center;">Click to<br>select product</div>`;
    });
}

// Open product selector popup
function openProductSelector(gridIndex) {
    // Remove any existing overlay first
    closeProductSelector();
    
    // Set the grid position AFTER closing any existing popup
    currentGridPosition = gridIndex;
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'product-selector-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        width: 90%;
        height: 90%;
        max-width: 1000px;
        max-height: 800px;
        border: 2px solid #333;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;
    
    // Create header with search
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid #ccc;
        background: #f5f5f5;
    `;
    
    header.innerHTML = `
        <h2 style="margin: 0 0 15px 0; font-family: Arial, sans-serif;">Select Item for Grid Position ${gridIndex + 1}</h2>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
            <button id="products-tab" class="tab-button active" style="
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
                border-radius: 4px;
            ">Products</button>
            <button id="special-tab" class="tab-button" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
                border-radius: 4px;
            ">Special Buttons</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="text" id="product-search" placeholder="Search products..." style="
                flex: 1;
                padding: 10px;
                border: 1px solid #ccc;
                font-size: 16px;
                font-family: Arial, sans-serif;
            ">
            <button id="close-selector-btn" style="
                padding: 10px 20px;
                background: #dc3545;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
            ">Close</button>
        </div>
    `;
    
    // Create products list container
    const productsContainer = document.createElement('div');
    productsContainer.id = 'products-container';
    productsContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    `;
    
    popup.appendChild(header);
    popup.appendChild(productsContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const searchInput = document.getElementById('product-search');
    const closeBtn = document.getElementById('close-selector-btn');
    const productsTab = document.getElementById('products-tab');
    const specialTab = document.getElementById('special-tab');
    
    let currentTab = 'products';
    
    // Tab functionality
    productsTab.addEventListener('click', function() {
        currentTab = 'products';
        productsTab.classList.add('active');
        specialTab.classList.remove('active');
        productsTab.style.backgroundColor = '#007bff';
        specialTab.style.backgroundColor = '#6c757d';
        searchInput.style.display = 'block';
        renderCurrentTab();
    });
    
    specialTab.addEventListener('click', function() {
        currentTab = 'special';
        specialTab.classList.add('active');
        productsTab.classList.remove('active');
        specialTab.style.backgroundColor = '#007bff';
        productsTab.style.backgroundColor = '#6c757d';
        searchInput.style.display = 'none';
        renderCurrentTab();
    });
    
    function renderCurrentTab() {
        if (currentTab === 'products') {
            renderProductsList(searchInput.value);
        } else {
            renderSpecialButtonsList();
        }
    }

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        if (currentTab === 'products') {
            renderProductsList(e.target.value);
        }
    });
    
    // Close button functionality
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeProductSelector();
    });
    
    // Close on overlay click (but not popup content)
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeProductSelector();
        }
    });
    
    // Prevent popup content clicks from closing
    popup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Render initial products list
    renderCurrentTab();
    
    // Focus search input
    setTimeout(() => searchInput.focus(), 100);
}

// Render special buttons list
function renderSpecialButtonsList() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    // Create special buttons grid
    const specialButtonsHtml = specialButtons.map(button => {
        const imageUrl = button.bitmap ? `/KVS-Images/${button.bitmap}` : null;
        const imageHtml = imageUrl 
            ? `<img src="${imageUrl}" alt="${button.title}" style="
                width: 100%;
                height: 80px;
                object-fit: cover;
                border-radius: 4px;
                margin-bottom: 5px;
            " onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '';
        
        const placeholderHtml = `
            <div style="
                width: 100%;
                height: 80px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                display: ${imageUrl ? 'none' : 'flex'};
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6c757d;
                text-align: center;
                border-radius: 4px;
                margin-bottom: 5px;
            ">
                Special Button
            </div>
        `;
        
        // Convert colors from screen.xml format to CSS
        const bgColor = convertPOSColor(button.colors.bgup);
        const textColor = convertPOSColor(button.colors.textup);
        
        return `
            <div class="special-button-card" data-button-id="${button.id}" style="
                border: 2px solid #333;
                padding: 10px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
                background: ${bgColor};
                color: ${textColor};
                text-align: center;
                font-weight: bold;
                font-family: Arial, sans-serif;
            ">
                ${imageHtml}
                ${placeholderHtml}
                <div style="font-size: 12px; line-height: 1.2;">
                    ${button.title.replace(/\\n/g, '<br>')}
                </div>
                <div style="margin-top: 8px;">
                    <button class="select-special-btn" style="
                        padding: 6px 12px;
                        background: #28a745;
                        color: white;
                        border: none;
                        cursor: pointer;
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                        border-radius: 3px;
                    ">Select Button</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
            ${specialButtonsHtml}
        </div>
    `;
    
    // Add event listeners to special button cards
    const specialCards = container.querySelectorAll('.special-button-card');
    specialCards.forEach(card => {
        const buttonId = card.dataset.buttonId;
        
        // Card hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Select button functionality
        const selectBtn = card.querySelector('.select-special-btn');
        if (selectBtn) {
            selectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Special button selected:', buttonId);
                selectSpecialButton(buttonId);
            });
        }
    });
}

// Convert POS color names to CSS colors
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
        'DARKBLUE': '#00008B'
    };
    return colorMap[posColor] || '#FFFFFF';
}

// Render products list
function renderProductsList(searchTerm = '') {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    // Filter products based on search term
    const filteredProducts = productsData.filter(product => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            (product.shortName && product.shortName.toLowerCase().includes(term)) ||
            (product.longName && product.longName.toLowerCase().includes(term)) ||
            (product.csoName && product.csoName.toLowerCase().includes(term)) ||
            (product.productCode && product.productCode.toString().toLowerCase().includes(term))
        );
    });
    
    // Create products grid
    const productsHtml = filteredProducts.map(product => {
        // Determine the image URL - use imageName if available, otherwise show placeholder
        const imageUrl = product.imageName 
            ? `/NP6-Images/${product.imageName}` 
            : null;
        
        const imageHtml = imageUrl 
            ? `<img src="${imageUrl}" alt="${product.longName || product.shortName || 'Product'}" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
            " onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '';
        
        const placeholderHtml = `
            <div style="
                width: 100%;
                height: 100%;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                display: ${imageUrl ? 'none' : 'flex'};
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6c757d;
                text-align: center;
                border-radius: 4px;
            ">
                ${imageUrl ? 'Image not found' : 'No Image'}<br>
                <small>${product.productCode}</small>
            </div>
        `;
        
        return `
            <div class="product-card" data-product-code="${product.productCode}" style="
                border: 1px solid #ddd;
                padding: 15px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
                background: white;
            ">
                <div style="
                    width: 100%;
                    height: 100px;
                    position: relative;
                    margin-bottom: 10px;
                    overflow: hidden;
                ">
                    ${imageHtml}
                    ${placeholderHtml}
                </div>
                <h4 style="margin: 0 0 5px 0; font-size: 14px; font-family: Arial, sans-serif;">
                    ${product.longName || product.shortName || 'Unnamed Product'}
                </h4>
                <p style="margin: 0; font-size: 12px; color: #666; font-family: Arial, sans-serif;">
                    ${product.shortName || ''}<br>
                    Code: ${product.productCode}
                </p>
                <div style="margin-top: 10px; text-align: center;">
                    <button class="select-product-btn" style="
                        padding: 8px 16px;
                        background: #28a745;
                        color: white;
                        border: none;
                        cursor: pointer;
                        font-family: Arial, sans-serif;
                        width: 100%;
                        transition: background-color 0.2s;
                    ">Select Product</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
            ${productsHtml}
        </div>
        ${filteredProducts.length === 0 ? '<p style="text-align: center; color: #666; font-family: Arial, sans-serif; margin-top: 50px;">No products found matching your search.</p>' : ''}
    `;
    
    // Add event listeners to product cards and buttons
    const productCards = container.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productCode = card.dataset.productCode;
        
        // Card hover effects
        card.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f0f0f0';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Select button functionality
        const selectBtn = card.querySelector('.select-product-btn');
        if (selectBtn) {
            selectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                selectProduct(productCode);
            });
            
            selectBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#218838';
            });
            
            selectBtn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#28a745';
            });
        }
    });
}

// Select a special button for the current grid position
function selectSpecialButton(buttonId) {
    const button = specialButtons.find(b => b.id === buttonId);
    if (!button || currentGridPosition === null) return;
    
    // Update grid item
    const gridItems = document.querySelectorAll('.grid-item');
    const gridItem = gridItems[currentGridPosition];
    
    if (gridItem) {
        // Create image element if bitmap exists
        const imageUrl = button.bitmap ? `/KVS-Images/${button.bitmap}` : null;
        const bgColor = convertPOSColor(button.colors.bgup);
        const textColor = convertPOSColor(button.colors.textup);
        
        if (imageUrl) {
            // Show image with minimal text
            gridItem.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    background: ${bgColor}; 
                    color: ${textColor}; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center;
                    text-align: center;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    font-size: 8px;
                ">
                    <img src="${imageUrl}" alt="${button.title}" style="
                        max-width: 90%;
                        max-height: 70%;
                        object-fit: contain;
                        margin-bottom: 2px;
                    " onerror="this.style.display='none';">
                    <div style="line-height: 1;">${button.title.replace(/\\n/g, '<br>')}</div>
                </div>
            `;
        } else {
            // Show text only
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
                ">
                    ${button.title.replace(/\\n/g, '<br>')}
                </div>
            `;
        }
        
        // Store special button data on the grid item
        gridItem.dataset.specialButtonId = buttonId;
        gridItem.dataset.buttonType = 'special';
    }
    
    closeProductSelector();
}

// Select a product for the current grid position
function selectProduct(productCode) {
    const product = productsData.find(p => p.productCode === productCode);
    if (!product || currentGridPosition === null) return;
    
    // Update grid item
    const gridItems = document.querySelectorAll('.grid-item');
    const gridItem = gridItems[currentGridPosition];
    
    if (gridItem) {
        // Create image element if imageName exists
        const imageUrl = product.imageName ? `/NP6-Images/${product.imageName}` : null;
        
        if (imageUrl) {
            // Show only the product image, filling the entire grid cell
            gridItem.innerHTML = `
                <img src="${imageUrl}" alt="${product.shortName || 'Product'}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                " onerror="this.style.display='none'; this.parentElement.style.backgroundColor='#f8f8f8';">
            `;
        } else {
            // If no image, show a subtle background color
            gridItem.innerHTML = '';
            gridItem.style.backgroundColor = '#f8f8f8';
        }
        
        // Store product data on the grid item
        gridItem.dataset.productCode = productCode;
        gridItem.dataset.buttonType = 'product';
    }
    
    closeProductSelector();
}

// Close product selector popup
function closeProductSelector() {
    const overlay = document.getElementById('product-selector-overlay');
    if (overlay) {
        overlay.remove();
    }
    currentGridPosition = null;
}

// Initialize product selector when DOM is ready
function initializeProductSelector() {
    loadProductsData();
}

// Export for global access
window.loadProductsData = loadProductsData;
window.initializeGrid = initializeGrid;
window.openProductSelector = openProductSelector;
window.closeProductSelector = closeProductSelector;
window.selectProduct = selectProduct;
window.initializeProductSelector = initializeProductSelector;
