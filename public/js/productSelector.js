// Product Selector functionality
let productsData = [];
let currentGridPosition = null;

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
        <h2 style="margin: 0 0 15px 0; font-family: Arial, sans-serif;">Select Product for Grid Position ${gridIndex + 1}</h2>
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
    
    // Search functionality
    searchInput.addEventListener('input', function(e) {
        renderProductsList(e.target.value);
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
    renderProductsList();
    
    // Focus search input
    setTimeout(() => searchInput.focus(), 100);
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
                console.log('Select button clicked for product:', productCode);
                selectProduct(productCode);
            });
            
            selectBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#218838';
            });
            
            selectBtn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#28a745';
            });
        } else {
            console.error('Select button not found for product:', productCode);
        }
    });
}

// Select a product for the current grid position
function selectProduct(productCode) {
    console.log('selectProduct called with productCode:', productCode);
    console.log('currentGridPosition:', currentGridPosition);
    console.log('productsData length:', productsData.length);
    
    const product = productsData.find(p => p.productCode === productCode);
    if (!product || currentGridPosition === null) {
        console.error('Product not found or no grid position selected:', { product, currentGridPosition });
        return;
    }
    
    console.log('Found product:', product);
    
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
        
        console.log('Grid item updated successfully');
    } else {
        console.error('Grid item not found at position:', currentGridPosition);
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
