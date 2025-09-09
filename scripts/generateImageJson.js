const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// File paths
const xmlDir = path.join(__dirname, '..', 'XML');
const outputPath = path.join(__dirname, '..', 'public', 'products.json');

const namesDbPath = path.join(xmlDir, 'names-db.xml');
const productDbPath = path.join(xmlDir, 'product-db.xml');
const storeDbPath = path.join(xmlDir, 'store-db.xml');
const screenDbPath = path.join(xmlDir, 'screen.xml');

// Parse XML to JavaScript object
async function parseXmlFile(filePath) {
    try {
        const xmlData = fs.readFileSync(filePath, 'utf8');
        const parser = new xml2js.Parser({ 
            explicitArray: false,
            mergeAttrs: true,
            trim: true
        });
        return await parser.parseStringPromise(xmlData);
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        return null;
    }
}

// Helper function to identify ingredients, components, and non-menu items
function isIngredientOrComponent(nameInfo, productCode) {
    const allNames = [
        nameInfo.shortName || '',
        nameInfo.longName || '',
        nameInfo.csoName || '',
        nameInfo.dtName || ''
    ].join(' ').toLowerCase();
    
    // Common ingredient/component patterns
    const excludePatterns = [
        // Ingredients
        'cheese', 'lettuce', 'tomato', 'onion', 'pickle', 'sauce', 'mayo', 'ketchup', 'mustard',
        'patty', 'bun', 'bacon strips', 'egg', 'syrup', 'butter', 'cream', 'milk',
        
        // Size/option selectors
        'select', 'choose', 'small', 'medium', 'large', 'extra large',
        'size', 'option', 'upgrade',
        
        // Service items
        'comment', 'note', 'special', 'request', 'instruction',
        'add', 'extra', 'no ', 'without', 'plain',
        
        // Packaging/containers
        'cup', 'lid', 'straw', 'napkin', 'bag', 'tray',
        
        // Non-food items
        'tag', 'label', 'code', 'id', 'reference'
    ];
    
    // Check if any exclude pattern matches
    const hasExcludePattern = excludePatterns.some(pattern => 
        allNames.includes(pattern)
    );
    
    // Additional checks for product codes that are typically ingredients
    const isIngredientCode = 
        // Very high product codes are often ingredients/modifiers
        parseInt(productCode) > 80000 ||
        // Very low codes might be basic ingredients
        (parseInt(productCode) < 200 && parseInt(productCode) > 100);
    
    return hasExcludePattern || isIngredientCode;
}

// Convert XML data to consolidated JSON
async function generateProductsJson() {
    console.log('Starting XML to JSON conversion...');
    
    // Parse all XML files
    const [namesDb, productDb, storeDb, screenDb] = await Promise.all([
        parseXmlFile(namesDbPath),
        parseXmlFile(productDbPath),
        parseXmlFile(storeDbPath),
        parseXmlFile(screenDbPath)
    ]);

    if (!namesDb || !productDb || !storeDb) {
        console.error('Failed to parse one or more XML files');
        return;
    }

    console.log('XML files parsed successfully');
    
    // Extract button styling from screen.xml
    const buttonStyling = new Map();
    const specialButtonsFromScreen = [];
    const numbersFromScreen = [];
    const pagesFromScreen = [];
    
    // Use Maps to track unique buttons and avoid duplicates
    const uniqueSpecialButtons = new Map();
    const uniqueNumberButtons = new Map();
    const uniquePageButtons = new Map();
    
    if (screenDb && screenDb.Screens && screenDb.Screens.Screen) {
        const screens = Array.isArray(screenDb.Screens.Screen) 
            ? screenDb.Screens.Screen 
            : [screenDb.Screens.Screen];
        
        screens.forEach(screen => {
            if (screen && screen.Button) {
                const buttons = Array.isArray(screen.Button) 
                    ? screen.Button 
                    : [screen.Button];
                
                buttons.forEach(button => {
                    // Filter out unwanted test/demo buttons early
                    const excludedButtons = [
                        '*tag*', 'ice', 'ford', 'bmw', 'chrysler', 'infinity', 'jeep', 
                        'audi', 'buick', 'toyota', 'tesla', 'honda', 'lexus', 
                        'volkswagon', 'dodge', 'nissan', 'subaru', 'lincon', 'lincoln', 'chevy'
                    ];
                    
                    const buttonTitleLower = (button.title || '').toLowerCase().replace(/\s+/g, '');
                    const shouldExclude = excludedButtons.some(excluded => 
                        buttonTitleLower.includes(excluded.toLowerCase())
                    );
                    
                    if (shouldExclude) {
                        return; // Skip this button entirely
                    }
                    
                    if (button && button.productCode) {
                        // Product buttons
                        const productCode = button.productCode.toString();
                        buttonStyling.set(productCode, {
                            textup: button.textup || 'BLACK',
                            textdn: button.textdn || 'WHITE',
                            bgup: button.bgup || 'WHITE',
                            bgdn: button.bgdn || 'BLACK',
                            title: button.title || '',
                            bitmap: button.bitmap || '',
                            outageModeButtonDisabled: button.outageModeButtonDisabled || 'false'
                        });
                    } else if (button && button.Action && !button.productCode) {
                        // Special buttons without productCode
                        const actions = Array.isArray(button.Action) ? button.Action : [button.Action];
                        
                        // Extract all actions and parameters
                        const extractedActions = actions.map(action => {
                            const params = {};
                            if (action.Parameter) {
                                const parameters = Array.isArray(action.Parameter) ? action.Parameter : [action.Parameter];
                                parameters.forEach(param => {
                                    if (param.name && param.value !== undefined) {
                                        params[param.name] = param.value;
                                    }
                                });
                            }
                            return {
                                type: action.type,
                                workflow: action.workflow,
                                params: params
                            };
                        });
                        
                        // Create unique key based on title, bitmap, and primary workflow
                        const primaryWorkflow = extractedActions.find(a => a.type === 'onclick')?.workflow || 
                                             extractedActions[0]?.workflow || '';
                        const uniqueKey = `${button.title || 'untitled'}_${button.bitmap || 'nobitmap'}_${primaryWorkflow}`;
                        
                        // Create special button object
                        const specialButton = {
                            id: uniqueKey.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase(),
                            screenNumber: screen.number,
                            buttonNumber: button.number,
                            title: button.title || '',
                            bitmap: button.bitmap || '',
                            keyscan: button.keyscan || '0',
                            keyshift: button.keyshift || '0',
                            textup: button.textup || 'BLACK',
                            textdn: button.textdn || 'WHITE',
                            bgup: button.bgup || 'WHITE',
                            bgdn: button.bgdn || 'BLACK',
                            v: button.v || '1',
                            h: button.h || '1',
                            outageModeButtonDisabled: button.outageModeButtonDisabled || 'false',
                            actions: extractedActions
                        };
                        
                        // Categorize the button and add to appropriate unique collection
                        const buttonTitle = (button.title || '').trim();
                        const isNumberButton = /^[0-9]$/.test(buttonTitle);
                        const hasShowScreenAction = extractedActions.some(action => 
                            action.workflow === 'WF_ShowScreen' && action.params.ScreenNumber
                        );
                        
                        if (isNumberButton) {
                            uniqueNumberButtons.set(uniqueKey, specialButton);
                        } else if (hasShowScreenAction) {
                            uniquePageButtons.set(uniqueKey, specialButton);
                        } else {
                            uniqueSpecialButtons.set(uniqueKey, specialButton);
                        }
                    }
                });
            }
        });
    }
    
    // Convert Maps to arrays
    specialButtonsFromScreen.push(...Array.from(uniqueSpecialButtons.values()));
    numbersFromScreen.push(...Array.from(uniqueNumberButtons.values()));
    pagesFromScreen.push(...Array.from(uniquePageButtons.values()));
    
    console.log(`Extracted styling for ${buttonStyling.size} products from screen.xml`);
    console.log(`Extracted ${specialButtonsFromScreen.length} unique special buttons from screen.xml`);
    console.log(`Extracted ${numbersFromScreen.length} unique number buttons from screen.xml`);
    console.log(`Extracted ${pagesFromScreen.length} unique page buttons from screen.xml`);
    
    // Create lookup map for product names (English only)
    const nameMap = new Map();
    
    // Handle names-db structure - filter for English only
    if (namesDb && namesDb.NamesDb && namesDb.NamesDb.Language) {
        // Language might be an array or single object
        const languages = Array.isArray(namesDb.NamesDb.Language) 
            ? namesDb.NamesDb.Language 
            : [namesDb.NamesDb.Language];
        
        // Filter for English language only
        const englishLanguages = languages.filter(lang => 
            lang && (lang.code === 'en_US' || lang.code === 'en' || lang.name === 'English')
        );
        
        console.log(`Found ${englishLanguages.length} English language section(s)`);
        
        englishLanguages.forEach(language => {
            if (language && language.ProductName) {
                const productNames = Array.isArray(language.ProductName) 
                    ? language.ProductName 
                    : [language.ProductName];
                
                productNames.forEach(item => {
                    if (item && item.ProductCode) {
                        nameMap.set(item.ProductCode.toString(), {
                            shortName: item.ShortName || '',
                            longName: item.LongName || '',
                            dtName: item.DTName || '',
                            csoName: item.CSOName || '',
                            csoSizeName: item.CSOSizeName || '',
                            csoGenericName: item.CSOGenericName || ''
                        });
                    }
                });
            }
        });
    }

    console.log(`Loaded ${nameMap.size} English product names`);

    // Process products from product-db
    const products = [];
    
    if (productDb.ProductDb && productDb.ProductDb.Product) {
        const productList = Array.isArray(productDb.ProductDb.Product) 
            ? productDb.ProductDb.Product 
            : [productDb.ProductDb.Product];

        productList.forEach(product => {
            if (product && product.ProductCode) {
                const productCode = product.ProductCode.toString();
                const nameInfo = nameMap.get(productCode) || {};

                // Filter out unwanted test/demo products early
                const excludedProducts = [
                    '*tag*', 'ice', 'ford', 'bmw', 'chrysler', 'infinity', 'jeep', 
                    'audi', 'buick', 'toyota', 'tesla', 'honda', 'lexus', 
                    'volkswagon', 'dodge', 'nissan', 'subaru', 'lincon', 'lincoln', 'chevy'
                ];
                
                const productName = (nameInfo.shortName || nameInfo.longName || nameInfo.csoName || '').toLowerCase().replace(/\s+/g, '');
                const shouldExcludeProduct = excludedProducts.some(excluded => 
                    productName.includes(excluded.toLowerCase())
                );
                
                if (shouldExcludeProduct) {
                    return; // Skip this product entirely
                }

                // Filter criteria for sellable products only
                const isActualProduct = 
                    // Must be salable
                    product.salable === 'true' &&
                    // Must have a meaningful product class (exclude COMMENT, SERVICE, etc.)
                    product.productClass && 
                    ['PRODUCT', 'VALUE_MEAL'].includes(product.productClass) &&
                    // Must have a product category that indicates food/beverage
                    product.productCategory && 
                    ['FOOD', 'BEVERAGE'].includes(product.productCategory) &&
                    // Must not be a secondary product (variations/sizes)
                    product.Secondary !== 'true' &&
                    // Must not be a dummy product
                    product.DummyProduct !== 'true' &&
                    // Must have some kind of name
                    (nameInfo.shortName || nameInfo.longName || nameInfo.csoName) &&
                    // Exclude items that look like ingredients/components
                    !isIngredientOrComponent(nameInfo, productCode) &&
                    // Must have an image (BitmapName) to be a real menu item
                    product.Presentation && product.Presentation.BitmapName;

                if (!isActualProduct) {
                    return; // Skip this product
                }

                // Build comprehensive product object
                const productObj = {
                    productCode: productCode,
                    ...nameInfo,
                    statusCode: product.statusCode || '',
                    productClass: product.productClass || '',
                    productCategory: product.productCategory || '',
                    salable: product.salable === 'true',
                    modified: product.modified === 'true',
                    secondary: product.Secondary === 'true',
                    familyGroup: product.FamilyGroup || '',
                    dayPartCode: product.DayPartCode || '',
                    dummyProduct: product.DummyProduct === 'true',
                    containerVM: product.ContainerVM === 'true',
                    csoHasLimitedTimeDiscount: product.CSOHasLimitedTimeDiscount === 'true',
                    displayOrder: parseInt(product.DisplayOrder) || 0,
                    displayWaste: product.DisplayWaste === 'true',
                    upsizable: product.Upsizable === 'true'
                };

                // Add button styling from screen.xml if available
                const styling = buttonStyling.get(productCode);
                if (styling) {
                    productObj.buttonStyling = styling;
                    // Use the title from screen.xml as it preserves newlines and proper formatting
                    if (styling.title) {
                        productObj.displayTitle = styling.title;
                    }
                    // Use the bitmap from screen.xml if available (might be different from product-db)
                    if (styling.bitmap) {
                        productObj.screenBitmap = styling.bitmap;
                    }
                }

                // Add sales type information
                if (product.SalesType) {
                    productObj.salesType = {
                        eatin: product.SalesType.eatin === 'true',
                        takeout: product.SalesType.takeout === 'true',
                        other: product.SalesType.other === 'true'
                    };
                }

                // Add distribution points
                if (product.Distribution && product.Distribution.Point) {
                    productObj.distributionPoints = Array.isArray(product.Distribution.Point) 
                        ? product.Distribution.Point 
                        : [product.Distribution.Point];
                }

                // Add price information if available
                if (product.Price) {
                    productObj.price = {
                        amount: parseFloat(product.Price.Amount) || 0,
                        currency: product.Price.Currency || 'USD'
                    };
                }

                // Add nutritional information if available
                if (product.Nutrition) {
                    productObj.nutrition = product.Nutrition;
                }

                // Add allergen information if available
                if (product.Allergens) {
                    productObj.allergens = product.Allergens;
                }

                // Add presentation/image information
                if (product.Presentation) {
                    productObj.presentation = {
                        bitmapName: product.Presentation.BitmapName || '',
                        grillBitmapName: product.Presentation.GrillBitmapName || '',
                        csoLargeImageName: product.Presentation.CSOLargeImageName || '',
                        csoSmallImageName: product.Presentation.CSOSmallImageName || '',
                        csoGrillImageName: product.Presentation.CSOGrillImageName || '',
                        csoDimensionImageName: product.Presentation.CSODimensionImageName || '',
                        csoCartImageName: product.Presentation.CSOCartImageName || ''
                    };
                    
                    // Add the primary image name for easy access
                    if (product.Presentation.BitmapName) {
                        productObj.imageName = product.Presentation.BitmapName;
                    }
                }

                // Add any additional product attributes
                Object.keys(product).forEach(key => {
                    if (!productObj.hasOwnProperty(key) && 
                        !['ProductCode', 'Secondary', 'FamilyGroup', 'DayPartCode', 
                          'DummyProduct', 'ContainerVM', 'CSOHasLimitedTimeDiscount',
                          'DisplayOrder', 'DisplayWaste', 'Upsizable', 'SalesType',
                          'Distribution', 'Price', 'Nutrition', 'Allergens', 'Presentation'].includes(key)) {
                        productObj[key] = product[key];
                    }
                });

                products.push(productObj);
            }
        });
    }

    console.log(`Processed ${products.length} products`);

    // Add store information
    const storeInfo = {};
    if (storeDb.Document && storeDb.Document.StoreDB && storeDb.Document.StoreDB.StoreProfile) {
        const storeProfile = storeDb.Document.StoreDB.StoreProfile;
        if (storeProfile.StoreDetails) {
            storeInfo.storeDetails = storeProfile.StoreDetails;
        }
    }

    // Create final JSON structure
    const finalJson = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalProducts: products.length,
            totalSpecialButtons: specialButtonsFromScreen.length,
            totalNumberButtons: numbersFromScreen.length,
            totalPageButtons: pagesFromScreen.length,
            version: '1.0'
        },
        store: storeInfo,
        products: products,
        specialButtons: specialButtonsFromScreen,
        numberButtons: numbersFromScreen,
        pageButtons: pagesFromScreen
    };

    // Write to file
    try {
        fs.writeFileSync(outputPath, JSON.stringify(finalJson, null, 2), 'utf8');
        console.log(`Successfully generated products.json with ${products.length} products`);
        console.log(`Output saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}

// Check if xml2js is available
try {
    require.resolve('xml2js');
} catch (e) {
    console.error('xml2js package is required. Please install it with: npm install xml2js');
    process.exit(1);
}

// Run the conversion
generateProductsJson().catch(console.error);
