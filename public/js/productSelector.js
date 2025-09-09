// Product Selector functionality
let productsData = [];
let specialButtons = [];
let numberButtons = [];
let pageButtons = []; // Keep for backward compatibility  
let screenButtons = [];
let currentGridPosition = null;

// Function to load all data from products.json
async function loadProductsData() {
    try {
        const response = await fetch('/products.json');
        const data = await response.json();
        productsData = data.products || [];
        specialButtons = data.specialButtons || [];
        numberButtons = data.numberButtons || [];
        pageButtons = data.pageButtons || []; // Keep for backward compatibility
        screenButtons = data.screenButtons || [];
        
        console.log(`Loaded ${productsData.length} products, ${specialButtons.length} special buttons, ${numberButtons.length} number buttons, ${screenButtons.length} screen buttons`);
        initializeGrid();
    } catch (error) {
        console.error('Error loading products data:', error);
    }
}

// Function to load special buttons data from screen.xml  
async function loadSpecialButtonsFromScreen() {
    try {
        const response = await fetch('/products.json');
        const data = await response.json();
        
        // Curated list of important special buttons from screen.xml
        const curatedSpecialButtons = [];
        
        // Find specific buttons by title patterns
        if (data.specialButtons) {
            // Eat In Total button
            const eatInButton = data.specialButtons.find(btn => 
                btn.title && btn.title.includes('Eat') && btn.title.includes('In') && btn.title.includes('Total')
            );
            if (eatInButton) {
                curatedSpecialButtons.push({
                    id: 'eat_in_total',
                    title: 'Eat\\nIn\\nTotal',
                    bitmap: eatInButton.bitmap,
                    colors: {
                        bgup: eatInButton.bgup,
                        textup: eatInButton.textup,
                        bgdn: eatInButton.bgdn,
                        textdn: eatInButton.textdn
                    },
                    workflow: 'WF_DoTotalBySaleType',
                    params: { SaleType: '0', ScreenNumber: '53' },
                    onActivate: {
                        workflow: 'WF_OnActivate_EatInTotal',
                        params: { POD: 'DRIVE_THRU', ButtonNumber: '0' }
                    },
                    keyscan: eatInButton.keyscan,
                    keyshift: eatInButton.keyshift,
                    outageModeButtonDisabled: eatInButton.outageModeButtonDisabled
                });
            }
            
            // Menu navigation buttons
            const menuButtons = [
                { pattern: /Lunch.*Lunch2/, id: 'lunch_menu', screenNumber: '301' },
                { pattern: /Dessert.*Dessert2/, id: 'dessert_menu', screenNumber: '307' },
                { pattern: /Value Menu.*Salads/, id: 'value_salads', screenNumber: '306' },
                { pattern: /HpyMeal.*B-Parties/, id: 'happy_meal', screenNumber: '305' },
                { pattern: /Breakfst.*Breakfst2/, id: 'breakfast_menu', screenNumber: '302' }
            ];
            
            menuButtons.forEach(menuBtn => {
                const foundButton = data.specialButtons.find(btn => 
                    btn.title && menuBtn.pattern.test(btn.title)
                );
                if (foundButton) {
                    curatedSpecialButtons.push({
                        id: menuBtn.id,
                        title: foundButton.title.replace(/\\\\/g, ''),
                        bitmap: foundButton.bitmap,
                        colors: {
                            bgup: foundButton.bgup,
                            textup: foundButton.textup,
                            bgdn: foundButton.bgdn,
                            textdn: foundButton.textdn
                        },
                        workflow: 'WF_ShowScreen',
                        params: { ScreenNumber: menuBtn.screenNumber },
                        keyscan: foundButton.keyscan,
                        keyshift: foundButton.keyshift,
                        outageModeButtonDisabled: foundButton.outageModeButtonDisabled
                    });
                }
            });
            
            // Navigation buttons
            const navButtons = [
                { pattern: /^Back$/, id: 'back_button' },
                { pattern: /Main Lunch/, id: 'main_lunch' },
                { pattern: /Click for Tag 1 - 60/, id: 'tag_1_60' },
                { pattern: /Click for Tag 61 - 120/, id: 'tag_61_120' }
            ];
            
            navButtons.forEach(navBtn => {
                const foundButton = data.specialButtons.find(btn => 
                    btn.title && navBtn.pattern.test(btn.title)
                );
                if (foundButton) {
                    const actions = foundButton.actions || [];
                    const clickAction = actions.find(a => a.type === 'onclick') || {};
                    
                    curatedSpecialButtons.push({
                        id: navBtn.id,
                        title: foundButton.title.replace(/\\\\/g, ''),
                        bitmap: foundButton.bitmap,
                        colors: {
                            bgup: foundButton.bgup,
                            textup: foundButton.textup,
                            bgdn: foundButton.bgdn,
                            textdn: foundButton.textdn
                        },
                        workflow: clickAction.workflow || 'DoNothing',
                        params: clickAction.params || {},
                        keyscan: foundButton.keyscan,
                        keyshift: foundButton.keyshift,
                        outageModeButtonDisabled: foundButton.outageModeButtonDisabled,
                        v: foundButton.v,
                        h: foundButton.h
                    });
                }
            });
        }
        
        return curatedSpecialButtons;
    } catch (error) {
        console.error('Error loading special buttons from screen.xml:', error);
        return [];
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
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
            <button id="products-tab" class="tab-button active" style="
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
                border-radius: 4px;
            ">Products</button>
            <button id="numbers-tab" class="tab-button" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
                border-radius: 4px;
            ">Numbers</button>
            <button id="special-tab" class="tab-button" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
                border-radius: 4px;
            ">Special Buttons</button>
            <button id="pages-tab" class="tab-button" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                cursor: pointer;
                font-family: Arial, sans-serif;
                border-radius: 4px;
            ">Screen</button>
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
    const numbersTab = document.getElementById('numbers-tab');
    const specialTab = document.getElementById('special-tab');
    const pagesTab = document.getElementById('pages-tab');
    
    let currentTab = 'products';
    
    // Tab functionality
    function setActiveTab(tabName) {
        // Reset all tabs
        [productsTab, numbersTab, specialTab, pagesTab].forEach(tab => {
            tab.classList.remove('active');
            tab.style.backgroundColor = '#6c757d';
        });
        
        // Set active tab
        currentTab = tabName;
        const activeTab = document.getElementById(`${tabName}-tab`);
        activeTab.classList.add('active');
        activeTab.style.backgroundColor = '#007bff';
        
        // Show/hide search based on tab - now show for all tabs
        searchInput.style.display = 'block';
        
        // Update placeholder text based on current tab
        const placeholders = {
            'products': 'Search products...',
            'numbers': 'Search number buttons...',
            'special': 'Search special buttons...',
            'pages': 'Search screen buttons...'
        };
        searchInput.placeholder = placeholders[tabName] || 'Search...';
        
        // Clear search when switching tabs
        searchInput.value = '';
        
        renderCurrentTab();
    }
    
    productsTab.addEventListener('click', () => setActiveTab('products'));
    numbersTab.addEventListener('click', () => setActiveTab('numbers'));
    specialTab.addEventListener('click', () => setActiveTab('special'));
    pagesTab.addEventListener('click', () => setActiveTab('pages'));
    
    function renderCurrentTab() {
        const searchTerm = searchInput.value;
        if (currentTab === 'products') {
            renderProductsList(searchTerm);
        } else if (currentTab === 'numbers') {
            renderNumberButtonsList(searchTerm);
        } else if (currentTab === 'special') {
            renderSpecialButtonsList(searchTerm);
        } else if (currentTab === 'pages') {
            renderPageButtonsList(searchTerm);
        }
    }

    // Search functionality - now works for all tabs
    searchInput.addEventListener('input', function(e) {
        renderCurrentTab();
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
function renderSpecialButtonsList(searchTerm = '') {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    // Filter special buttons based on search term
    const filteredButtons = specialButtons.filter(button => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            (button.title && button.title.toLowerCase().includes(term)) ||
            (button.id && button.id.toLowerCase().includes(term))
        );
    });
    
    // Create special buttons grid
    const specialButtonsHtml = filteredButtons.map(button => {
        const imageUrl = button.bitmap ? `/NP6-Images/${button.bitmap}` : null;
        const imageHtml = imageUrl 
            ? `<img src="${imageUrl}" alt="${button.title}" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                margin-bottom: 5px;
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
                margin-bottom: 5px;
            ">
                Special Button
            </div>
        `;
        
        // Convert colors from screen.xml format to CSS
        const bgColor = convertPOSColor(button.bgup || 'WHITE');
        const textColor = convertPOSColor(button.textup || 'BLACK');
        
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
                <div style="
                    width: 100%;
                    height: 0;
                    padding-bottom: 75%;
                    position: relative;
                    margin-bottom: 10px;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    ">
                        ${imageHtml}
                        ${placeholderHtml}
                    </div>
                </div>
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
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 15px;">
            ${specialButtonsHtml}
        </div>
        ${filteredButtons.length === 0 ? '<p style="text-align: center; color: #666; font-family: Arial, sans-serif; margin-top: 50px;">No special buttons found matching your search.</p>' : ''}
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

// Render number buttons list
function renderNumberButtonsList(searchTerm = '') {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    // Filter number buttons based on search term
    const filteredButtons = numberButtons.filter(button => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            (button.title && button.title.toLowerCase().includes(term)) ||
            (button.id && button.id.toLowerCase().includes(term))
        );
    });
    
    renderButtonCategory(filteredButtons, container, 'number', searchTerm);
}

// Render page buttons list  
function renderPageButtonsList(searchTerm = '') {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    // Use screen buttons instead of page buttons
    const buttonsToFilter = screenButtons.length > 0 ? screenButtons : pageButtons; // Fallback for compatibility
    
    // Filter screen buttons based on search term
    const filteredButtons = buttonsToFilter.filter(button => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            (button.title && button.title.toLowerCase().includes(term)) ||
            (button.id && button.id.toLowerCase().includes(term))
        );
    });
    
    renderButtonCategory(filteredButtons, container, 'screen', searchTerm);
}

// Generic function to render any button category
function renderButtonCategory(buttons, container, buttonType, searchTerm = '') {
    // Create buttons grid
    const buttonsHtml = buttons.map(button => {
        const imageUrl = button.bitmap ? `/NP6-Images/${button.bitmap}` : null;
        const imageHtml = imageUrl 
            ? `<img src="${imageUrl}" alt="${button.title}" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                margin-bottom: 5px;
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
                margin-bottom: 5px;
            ">
                ${buttonType} Button
            </div>
        `;
        
        // Convert colors from screen.xml format to CSS
        const bgColor = convertPOSColor(button.colors?.bgup || button.bgup || 'WHITE');
        const textColor = convertPOSColor(button.colors?.textup || button.textup || 'BLACK');
        
        return `
            <div class="${buttonType}-button-card" data-button-id="${button.id}" style="
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
                <div style="
                    width: 100%;
                    height: 0;
                    padding-bottom: 75%;
                    position: relative;
                    margin-bottom: 10px;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    ">
                        ${imageHtml}
                        ${placeholderHtml}
                    </div>
                </div>
                <div style="font-size: 12px; line-height: 1.2;">
                    ${button.title.replace(/\\n/g, '<br>')}
                </div>
                <div style="margin-top: 8px;">
                    <button class="select-${buttonType}-btn" style="
                        padding: 6px 12px;
                        background: #28a745;
                        color: white;
                        border: none;
                        cursor: pointer;
                        border-radius: 3px;
                        font-size: 11px;
                    ">Select</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 15px;
        ">
            ${buttonsHtml}
        </div>
        ${buttons.length === 0 ? `<p style="text-align: center; color: #666; font-family: Arial, sans-serif; margin-top: 50px;">No ${buttonType} buttons found matching your search.</p>` : ''}
    `;
    
    // Add event listeners for button selection
    const buttonCards = container.querySelectorAll(`.${buttonType}-button-card`);
    buttonCards.forEach(card => {
        const buttonId = card.getAttribute('data-button-id');
        
        // Hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Select button functionality
        const selectBtn = card.querySelector(`.select-${buttonType}-btn`);
        if (selectBtn) {
            selectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`${buttonType} button selected:`, buttonId);
                selectSpecialButton(buttonId);
            });
        }
    });
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
                    height: 0;
                    padding-bottom: 75%;
                    position: relative;
                    margin-bottom: 10px;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    ">
                        ${imageHtml}
                        ${placeholderHtml}
                    </div>
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
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 15px;">
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
    // Search for button across all categories
    let button = specialButtons.find(b => b.id === buttonId);
    if (!button) button = numberButtons.find(b => b.id === buttonId);
    if (!button) button = screenButtons.find(b => b.id === buttonId);
    if (!button) button = pageButtons.find(b => b.id === buttonId); // Fallback for compatibility
    
    if (!button || currentGridPosition === null) return;
    
    // Update grid item
    const gridItems = document.querySelectorAll('.grid-item');
    const gridItem = gridItems[currentGridPosition];
    
    if (gridItem) {
        // Create image element if bitmap exists
        const imageUrl = button.bitmap ? `/NP6-Images/${button.bitmap}` : null;
        const bgColor = convertPOSColor(button.bgup || button.colors?.bgup || 'WHITE');
        const textColor = convertPOSColor(button.textup || button.colors?.textup || 'BLACK');
        
        if (imageUrl) {
            // Show only the image, filling the entire grid cell
            gridItem.innerHTML = `
                <img src="${imageUrl}" alt="${button.title}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                " onerror="this.style.display='none'; this.parentElement.style.backgroundColor='#f8f8f8';">
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
        
        // Store button data on the grid item with correct type
        let buttonType = 'special'; // default
        if (specialButtons.find(b => b.id === buttonId)) {
            buttonType = 'special';
            gridItem.dataset.specialButtonId = buttonId;
        } else if (numberButtons.find(b => b.id === buttonId)) {
            buttonType = 'number';
            gridItem.dataset.numberButtonId = buttonId;
        } else if (screenButtons.find(b => b.id === buttonId)) {
            buttonType = 'screen';
            gridItem.dataset.screenButtonId = buttonId;
        } else if (pageButtons.find(b => b.id === buttonId)) {
            buttonType = 'page';
            gridItem.dataset.pageButtonId = buttonId;
        }
        
        gridItem.dataset.buttonType = buttonType;
        
        // For screen buttons, extract and set the default screen number
        if (buttonType === 'screen') {
            // Find the default screen number from the button's actions
            let defaultScreenNumber = null;
            if (button.actions && button.actions.length > 0) {
                const showScreenAction = button.actions.find(action => 
                    action.workflow === 'WF_ShowScreen' || action.workflow === 'WF_ShowFloatScreen'
                );
                if (showScreenAction && showScreenAction.params && showScreenAction.params.ScreenNumber) {
                    defaultScreenNumber = showScreenAction.params.ScreenNumber;
                }
            }
            
            // Set the custom screen number to the default value
            if (defaultScreenNumber) {
                gridItem.dataset.customScreenNumber = defaultScreenNumber;
                console.log(`Set default screen number ${defaultScreenNumber} for screen button ${buttonId}`);
                
                // Create the go-to button with the default screen number
                updateGoToButton(gridItem, defaultScreenNumber);
            }
        }
        
        // Add delete button overlay for all button types
        addDeleteButtonToGridItem(gridItem);
        
        // Add edit button overlay for screen buttons
        if (buttonType === 'screen') {
            addEditButtonToGridItem(gridItem, buttonId);
        }
        
        // Save to screen manager if available
        if (window.screenManager) {
            window.screenManager.saveCurrentGridState();
        }
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
        
        // Add delete button overlay for products
        addDeleteButtonToGridItem(gridItem);
        
        // Save to screen manager if available
        if (window.screenManager) {
            window.screenManager.saveCurrentGridState();
        }
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

// Function to update or create the go-to button for a screen button
function updateGoToButton(gridItem, targetScreenNumber) {
    // Remove existing go-to button
    const existingGoToBtn = gridItem.querySelector('.grid-goto-btn');
    if (existingGoToBtn) {
        existingGoToBtn.remove();
    }
    
    // Create new go-to button if we have a valid screen number
    if (targetScreenNumber) {
        const goToButton = document.createElement('button');
        goToButton.className = 'grid-goto-btn';
        goToButton.innerHTML = '➤';
        goToButton.title = `Go to Screen ${targetScreenNumber}`;
        goToButton.style.cssText = `
            position: absolute;
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
            background: #28a745;
            color: white;
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

        goToButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            goToScreen(targetScreenNumber);
        });

        // Add hover effects
        goToButton.addEventListener('mouseenter', () => {
            goToButton.style.background = '#218838';
            goToButton.style.transform = 'scale(1.1)';
        });

        goToButton.addEventListener('mouseleave', () => {
            goToButton.style.background = '#28a745';
            goToButton.style.transform = 'scale(1)';
        });
        
        // Ensure grid item has relative positioning
        gridItem.style.position = 'relative';
        
        // Add the button
        gridItem.appendChild(goToButton);
    }
}

// Function to add delete button overlay to any filled grid item
function addDeleteButtonToGridItem(gridItem) {
    // Remove any existing delete button first
    const existingDeleteBtn = gridItem.querySelector('.grid-delete-btn');
    if (existingDeleteBtn) {
        existingDeleteBtn.remove();
    }
    
    // Create delete button overlay (bottom-right)
    const deleteButton = document.createElement('button');
    deleteButton.className = 'grid-delete-btn';
    deleteButton.innerHTML = '🗑️';
    deleteButton.title = 'Delete item';
    deleteButton.style.cssText = `
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        background: #dc3545;
        color: white;
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
    
    deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteGridItem(gridItem);
    });
    
    // Add hover effects for delete button
    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = '#c82333';
        deleteButton.style.transform = 'scale(1.1)';
    });
    
    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = '#dc3545';
        deleteButton.style.transform = 'scale(1)';
    });
    
    // Ensure the grid item has relative positioning
    gridItem.style.position = 'relative';
    
    // Add delete button to the grid item
    gridItem.appendChild(deleteButton);
}

// Function to delete a grid item
function deleteGridItem(gridItem) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    // Clear all data attributes
    delete gridItem.dataset.productCode;
    delete gridItem.dataset.specialButtonId;
    delete gridItem.dataset.numberButtonId;
    delete gridItem.dataset.screenButtonId;
    delete gridItem.dataset.pageButtonId;
    delete gridItem.dataset.buttonType;
    delete gridItem.dataset.customScreenNumber;
    
    // Clear the grid item content and styling
    gridItem.innerHTML = `<div style="font-size: 10px; color: #666; text-align: center;">Click to<br>select product</div>`;
    gridItem.style.backgroundColor = '';
    gridItem.style.position = '';
    
    // Save to screen manager if available
    if (window.screenManager) {
        window.screenManager.saveCurrentGridState();
    }
    
    console.log('Grid item deleted');
}

// Function to add edit button overlay to grid item for screen buttons
function addEditButtonToGridItem(gridItem, buttonId) {
    // Remove any existing edit and go-to buttons first
    const existingEditBtn = gridItem.querySelector('.grid-edit-btn');
    const existingGoToBtn = gridItem.querySelector('.grid-goto-btn');
    if (existingEditBtn) {
        existingEditBtn.remove();
    }
    if (existingGoToBtn) {
        existingGoToBtn.remove();
    }
    
    // Get the screen number from the grid item data
    const targetScreenNumber = gridItem.dataset.customScreenNumber;
    
    // Create "Go To" button only if we have a valid screen number
    if (targetScreenNumber) {
        // Create "Go To" button (top-left)
        const goToButton = document.createElement('button');
        goToButton.className = 'grid-goto-btn';
        goToButton.innerHTML = '➤';
        goToButton.title = `Go to Screen ${targetScreenNumber}`;
        goToButton.style.cssText = `
            position: absolute;
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
            background: #28a745;
            color: white;
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

        goToButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            goToScreen(targetScreenNumber);
        });

        // Add hover effects for go-to button
        goToButton.addEventListener('mouseenter', () => {
            goToButton.style.background = '#218838';
            goToButton.style.transform = 'scale(1.1)';
        });

        goToButton.addEventListener('mouseleave', () => {
            goToButton.style.background = '#28a745';
            goToButton.style.transform = 'scale(1)';
        });
        
        // Add the go-to button to the grid item
        gridItem.appendChild(goToButton);
    }
    
    // Create edit button overlay (top-right) - always create this for screen buttons
    const editButton = document.createElement('button');
    editButton.className = 'grid-edit-btn';
    editButton.innerHTML = '✏️';
    editButton.title = 'Edit screen number';
    editButton.style.cssText = `
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        background: #007bff;
        color: white;
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
        editPlacedScreenButtonScreenNumber(buttonId, gridItem);
    });
    
    // Add hover effects for edit button
    editButton.addEventListener('mouseenter', () => {
        editButton.style.background = '#0056b3';
        editButton.style.transform = 'scale(1.1)';
    });
    
    editButton.addEventListener('mouseleave', () => {
        editButton.style.background = '#007bff';
        editButton.style.transform = 'scale(1)';
    });
    
    // Ensure the grid item has relative positioning
    gridItem.style.position = 'relative';
    
    // Add the edit button (always)
    gridItem.appendChild(editButton);
}

// Function to navigate to a specific screen
function goToScreen(screenNumber) {
    if (!window.screenManager) {
        showNotificationMessage('Screen manager not available', '#dc3545');
        return;
    }
    
    const targetScreenId = parseInt(screenNumber);
    
    // Check if the screen exists
    if (window.screenManager.screens.has(targetScreenId)) {
        // Switch to the target screen
        window.screenManager.switchToScreen(targetScreenId);
        
        // Scroll to the screen in the list
        window.screenManager.scrollToScreenInList(targetScreenId);
        
        showNotificationMessage(`Switched to Screen ${targetScreenId}`, '#28a745');
    } else {
        // Show error message
        showNotificationMessage(`No screen with ID ${targetScreenId} found`, '#dc3545');
    }
}

// Function to show notification messages (similar to import success messages)
function showNotificationMessage(message, backgroundColor) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10001;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Function to edit screen button's ScreenNumber for a placed button in the grid
function editPlacedScreenButtonScreenNumber(buttonId, gridItem) {
    // Find the screen button - search in the global window.screenButtons first, then fallback to local
    let screenButton = window.screenButtons ? window.screenButtons.find(b => b.id === buttonId) : null;
    if (!screenButton) {
        screenButton = screenButtons.find(b => b.id === buttonId);
    }
    
    if (!screenButton) {
        alert('Screen button not found!');
        return;
    }
    
    // Find the current ScreenNumber value
    let currentScreenNumber = '';
    if (screenButton.actions && screenButton.actions.length > 0) {
        const showScreenAction = screenButton.actions.find(action => 
            action.workflow === 'WF_ShowScreen' || action.workflow === 'WF_ShowFloatScreen'
        );
        if (showScreenAction && showScreenAction.params && showScreenAction.params.ScreenNumber) {
            currentScreenNumber = showScreenAction.params.ScreenNumber;
        }
    }
    
    // Create modal for editing
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
                Button: <strong>${screenButton.title.replace(/\\n/g, ' ')}</strong>
            </p>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Screen Number:</label>
                <input type="number" id="placed-screen-number-input" value="${currentScreenNumber}" 
                    style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                    "
                    min="1"
                    max="999"
                    placeholder="Enter screen number (e.g., 306)"
                >
            </div>
            <div style="text-align: right; gap: 10px; display: flex; justify-content: flex-end;">
                <button id="cancel-placed-edit" style="
                    padding: 8px 16px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Cancel</button>
                <button id="save-placed-edit" style="
                    padding: 8px 16px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus the input
    const input = document.getElementById('placed-screen-number-input');
    input.focus();
    input.select();
    
    // Handle cancel
    document.getElementById('cancel-placed-edit').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle save
    document.getElementById('save-placed-edit').addEventListener('click', () => {
        const newScreenNumber = input.value.trim();
        
        // Validate input
        if (!newScreenNumber) {
            alert('Please enter a screen number.');
            return;
        }
        
        const screenNum = parseInt(newScreenNumber);
        if (isNaN(screenNum) || screenNum < 1 || screenNum > 999) {
            alert('Please enter a valid screen number between 1 and 999.');
            return;
        }
        
        // Update the screen button's ScreenNumber
        updatePlacedScreenButtonScreenNumber(buttonId, newScreenNumber, gridItem);
        
        document.body.removeChild(modal);
    });
    
    // Handle Enter key
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('save-placed-edit').click();
        }
    });
    
    // Handle Escape key
    modal.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('cancel-placed-edit').click();
        }
    });
}

// Function to update screen button's ScreenNumber parameter for placed button
function updatePlacedScreenButtonScreenNumber(buttonId, newScreenNumber, gridItem) {
    // Find and update the screen button - search in global window.screenButtons first, then fallback to local
    let screenButton = window.screenButtons ? window.screenButtons.find(b => b.id === buttonId) : null;
    if (!screenButton) {
        screenButton = screenButtons.find(b => b.id === buttonId);
    }
    
    if (!screenButton) {
        alert('Screen button not found!');
        return;
    }
    
    // Update the ScreenNumber in the actions array
    if (screenButton.actions && screenButton.actions.length > 0) {
        const showScreenAction = screenButton.actions.find(action => 
            action.workflow === 'WF_ShowScreen' || action.workflow === 'WF_ShowFloatScreen'
        );
        if (showScreenAction && showScreenAction.params) {
            showScreenAction.params.ScreenNumber = newScreenNumber;
            console.log(`Updated placed screen button ${buttonId} ScreenNumber to: ${newScreenNumber}`);
            
            // Store the custom screen number on the grid item
            gridItem.dataset.customScreenNumber = newScreenNumber;
            
            // Update just the go-to button with the new screen number
            updateGoToButton(gridItem, newScreenNumber);
            
            // Save to screen manager if available
            if (window.screenManager) {
                window.screenManager.saveCurrentGridState();
            }
            
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
            successMsg.textContent = `Screen number updated to ${newScreenNumber}`;
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                if (document.body.contains(successMsg)) {
                    document.body.removeChild(successMsg);
                }
            }, 3000);
        } else {
            alert('Could not find ScreenNumber parameter to update.');
        }
    } else {
        alert('No actions found for this screen button.');
    }
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
window.addEditButtonToGridItem = addEditButtonToGridItem;
window.addDeleteButtonToGridItem = addDeleteButtonToGridItem;
window.deleteGridItem = deleteGridItem;
window.editPlacedScreenButtonScreenNumber = editPlacedScreenButtonScreenNumber;
window.updatePlacedScreenButtonScreenNumber = updatePlacedScreenButtonScreenNumber;
window.updateGoToButton = updateGoToButton;

// Export arrays for access by other modules
window.screenButtons = screenButtons;
window.specialButtons = specialButtons;
window.numberButtons = numberButtons;
