const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// File paths
const xmlDir = path.join(__dirname, '..', 'XML');
const outputPath = path.join(__dirname, '..', 'public', 'products.json');

const namesDbPath = path.join(xmlDir, 'names-db.xml');
const productDbPath = path.join(xmlDir, 'product-db.xml');
const storeDbPath = path.join(xmlDir, 'store-db.xml');

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

// Convert XML data to consolidated JSON
async function generateProductsJson() {
    console.log('Starting XML to JSON conversion...');
    
    // Parse all XML files
    const [namesDb, productDb, storeDb] = await Promise.all([
        parseXmlFile(namesDbPath),
        parseXmlFile(productDbPath),
        parseXmlFile(storeDbPath)
    ]);

    if (!namesDb || !productDb || !storeDb) {
        console.error('Failed to parse one or more XML files');
        return;
    }

    console.log('XML files parsed successfully');
    
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

                // Add any additional product attributes
                Object.keys(product).forEach(key => {
                    if (!productObj.hasOwnProperty(key) && 
                        !['ProductCode', 'Secondary', 'FamilyGroup', 'DayPartCode', 
                          'DummyProduct', 'ContainerVM', 'CSOHasLimitedTimeDiscount',
                          'DisplayOrder', 'DisplayWaste', 'Upsizable', 'SalesType',
                          'Distribution', 'Price', 'Nutrition', 'Allergens'].includes(key)) {
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
            version: '1.0'
        },
        store: storeInfo,
        products: products
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
