// Product Selector functionality
let productsData = [];
let specialButtons = [];
let numberButtons = [];
let pageButtons = [];
let currentGridPosition = null;

// Function to load all data from products.json
async function loadProductsData() {
    try {
        const response = await fetch('/products.json');
        const data = await response.json();
        productsData = data.products || [];
        specialButtons = data.specialButtons || [];
        numberButtons = data.numberButtons || [];
        pageButtons = data.pageButtons || [];
        
        console.log(`Loaded ${productsData.length} products, ${specialButtons.length} special buttons, ${numberButtons.length} number buttons, ${pageButtons.length} page buttons`);
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
            ">Pages</button>
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
            'pages': 'Search page buttons...'
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
    
    // Filter page buttons based on search term
    const filteredButtons = pageButtons.filter(button => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            (button.title && button.title.toLowerCase().includes(term)) ||
            (button.id && button.id.toLowerCase().includes(term))
        );
    });
    
    renderButtonCategory(filteredButtons, container, 'page', searchTerm);
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
    if (!button) button = pageButtons.find(b => b.id === buttonId);
    
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
