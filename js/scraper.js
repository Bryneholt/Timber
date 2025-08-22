// Web scraping utility for fetching material data from company websites

import { COMPANIES } from '../data/companies.js';

/**
 * Web scraping utility class for fetching material data
 */
export class MaterialScraper {
    /**
     * Scrape material data from a company website
     * @param {string} companyId - Company ID
     * @param {string} categoryId - Category ID
     * @returns {Promise<Object>} - Scraped data
     */
    static async scrapeMaterialData(companyId, categoryId) {
        const company = COMPANIES[companyId.toUpperCase()];
        if (!company) {
            throw new Error(`Company ${companyId} not found`);
        }

        const category = company.categories[categoryId];
        if (!category) {
            throw new Error(`Category ${categoryId} not found for company ${companyId}`);
        }

        try {
            const response = await fetch(category.url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            return this.parseMaterialData(html, companyId, categoryId);
        } catch (error) {
            console.error('Error scraping data:', error);
            throw error;
        }
    }

    /**
     * Parse material data from HTML
     * @param {string} html - HTML content
     * @param {string} companyId - Company ID
     * @param {string} categoryId - Category ID
     * @returns {Object} - Parsed material data
     */
    static parseMaterialData(html, companyId, categoryId) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        switch (companyId) {
            case 'hornbach':
                return this.parseHornbachData(doc, categoryId);
            case 'bauhaus':
                return this.parseBauhausData(doc, categoryId);
            case 'byggmax':
                return this.parseByggmaxData(doc, categoryId);
            default:
                throw new Error(`No parser available for company ${companyId}`);
        }
    }

    /**
     * Parse Hornbach material data
     * @param {Document} doc - Parsed HTML document
     * @param {string} categoryId - Category ID
     * @returns {Object} - Parsed data
     */
    static parseHornbachData(doc, categoryId) {
        const materials = [];
        
        // Hornbach specific selectors
        const productSelectors = [
            '.product-tile',
            '.product-item',
            '[data-testid="product-tile"]'
        ];

        let products = [];
        for (const selector of productSelectors) {
            products = doc.querySelectorAll(selector);
            if (products.length > 0) break;
        }

        products.forEach(product => {
            try {
                const nameElement = product.querySelector('.product-name, .product-title, h3, h4');
                const priceElement = product.querySelector('.price, .product-price, [data-testid="price"]');
                const dimensionElement = product.querySelector('.dimension, .size, .product-specs');

                if (nameElement && priceElement) {
                    const name = nameElement.textContent.trim();
                    const price = this.extractPrice(priceElement.textContent);
                    const dimension = dimensionElement ? this.extractDimension(dimensionElement.textContent) : null;

                    if (price > 0) {
                        materials.push({
                            name: name,
                            price: price,
                            dimension: dimension,
                            category: categoryId,
                            company: 'hornbach'
                        });
                    }
                }
            } catch (error) {
                console.warn('Error parsing product:', error);
            }
        });

        return {
            company: 'hornbach',
            category: categoryId,
            materials: materials,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Parse Bauhaus material data
     * @param {Document} doc - Parsed HTML document
     * @param {string} categoryId - Category ID
     * @returns {Object} - Parsed data
     */
    static parseBauhausData(doc, categoryId) {
        const materials = [];
        
        // Bauhaus specific selectors
        const productSelectors = [
            '.product-card',
            '.product-item',
            '.product-tile'
        ];

        let products = [];
        for (const selector of productSelectors) {
            products = doc.querySelectorAll(selector);
            if (products.length > 0) break;
        }

        products.forEach(product => {
            try {
                const nameElement = product.querySelector('.product-name, .product-title, h3, h4');
                const priceElement = product.querySelector('.price, .product-price, .current-price');
                const dimensionElement = product.querySelector('.dimension, .size, .product-specs');

                if (nameElement && priceElement) {
                    const name = nameElement.textContent.trim();
                    const price = this.extractPrice(priceElement.textContent);
                    const dimension = dimensionElement ? this.extractDimension(dimensionElement.textContent) : null;

                    if (price > 0) {
                        materials.push({
                            name: name,
                            price: price,
                            dimension: dimension,
                            category: categoryId,
                            company: 'bauhaus'
                        });
                    }
                }
            } catch (error) {
                console.warn('Error parsing product:', error);
            }
        });

        return {
            company: 'bauhaus',
            category: categoryId,
            materials: materials,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Parse Byggmax material data
     * @param {Document} doc - Parsed HTML document
     * @param {string} categoryId - Category ID
     * @returns {Object} - Parsed data
     */
    static parseByggmaxData(doc, categoryId) {
        const materials = [];
        
        // Byggmax specific selectors
        const productSelectors = [
            '.product-card',
            '.product-item',
            '.product-tile',
            '.product'
        ];

        let products = [];
        for (const selector of productSelectors) {
            products = doc.querySelectorAll(selector);
            if (products.length > 0) break;
        }

        products.forEach(product => {
            try {
                const nameElement = product.querySelector('.product-name, .product-title, h3, h4, .name');
                const priceElement = product.querySelector('.price, .product-price, .current-price, .cost');
                const dimensionElement = product.querySelector('.dimension, .size, .product-specs, .specs');

                if (nameElement && priceElement) {
                    const name = nameElement.textContent.trim();
                    const price = this.extractPrice(priceElement.textContent);
                    const dimension = dimensionElement ? this.extractDimension(dimensionElement.textContent) : null;

                    if (price > 0) {
                        materials.push({
                            name: name,
                            price: price,
                            dimension: dimension,
                            category: categoryId,
                            company: 'byggmax'
                        });
                    }
                }
            } catch (error) {
                console.warn('Error parsing product:', error);
            }
        });

        return {
            company: 'byggmax',
            category: categoryId,
            materials: materials,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Extract price from text
     * @param {string} text - Text containing price
     * @returns {number} - Extracted price
     */
    static extractPrice(text) {
        if (!text) return 0;
        
        // Remove currency symbols and spaces, extract numbers
        const priceMatch = text.replace(/[^\d,.]/g, '').match(/(\d+[,\d]*)/);
        if (priceMatch) {
            const priceStr = priceMatch[1].replace(',', '.');
            return parseFloat(priceStr) || 0;
        }
        
        return 0;
    }

    /**
     * Extract dimension from text
     * @param {string} text - Text containing dimension
     * @returns {string|null} - Extracted dimension
     */
    static extractDimension(text) {
        if (!text) return null;
        
        // Look for dimension patterns like "45x95", "45x95mm", etc.
        const dimensionMatch = text.match(/(\d+)x(\d+)/i);
        if (dimensionMatch) {
            return `${dimensionMatch[1]}x${dimensionMatch[2]}`;
        }
        
        return null;
    }

    /**
     * Generate scraping script for manual execution
     * @param {string} companyId - Company ID
     * @param {string} categoryId - Category ID
     * @returns {string} - JavaScript code to run in browser console
     */
    static generateScrapingScript(companyId, categoryId) {
        const company = COMPANIES[companyId.toUpperCase()];
        const category = company?.categories[categoryId];
        
        if (!company || !category) {
            throw new Error(`Company or category not found`);
        }

        return `
// Scraping script for ${company.name} - ${category.name}
// Run this in the browser console on ${category.url}

(function() {
    const materials = [];
    const categoryId = '${categoryId}';
    const companyId = '${companyId}';
    
    // Selectors for ${company.name}
    const productSelectors = ${JSON.stringify(this.getProductSelectors(companyId))};
    
    let products = [];
    for (const selector of productSelectors) {
        products = document.querySelectorAll(selector);
        if (products.length > 0) break;
    }
    
    console.log('Found', products.length, 'products');
    
    products.forEach((product, index) => {
        try {
            const nameElement = product.querySelector('.product-name, .product-title, h3, h4, .name');
            const priceElement = product.querySelector('.price, .product-price, .current-price, .cost');
            const dimensionElement = product.querySelector('.dimension, .size, .product-specs, .specs');
            
            if (nameElement && priceElement) {
                const name = nameElement.textContent.trim();
                const priceText = priceElement.textContent.trim();
                const price = extractPrice(priceText);
                const dimension = dimensionElement ? extractDimension(dimensionElement.textContent) : null;
                
                if (price > 0) {
                    materials.push({
                        name: name,
                        price: price,
                        dimension: dimension,
                        category: categoryId,
                        company: companyId
                    });
                }
            }
        } catch (error) {
            console.warn('Error parsing product', index, error);
        }
    });
    
    function extractPrice(text) {
        if (!text) return 0;
        const priceMatch = text.replace(/[^\\d,.]/g, '').match(/(\\d+[,\\d]*)/);
        if (priceMatch) {
            const priceStr = priceMatch[1].replace(',', '.');
            return parseFloat(priceStr) || 0;
        }
        return 0;
    }
    
    function extractDimension(text) {
        if (!text) return null;
        const dimensionMatch = text.match(/(\\d+)x(\\d+)/i);
        if (dimensionMatch) {
            return dimensionMatch[1] + 'x' + dimensionMatch[2];
        }
        return null;
    }
    
    const result = {
        company: companyId,
        category: categoryId,
        materials: materials,
        timestamp: new Date().toISOString()
    };
    
    console.log('Scraped data:', result);
    console.log('Copy this data and use it in the application');
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
        .then(() => console.log('Data copied to clipboard'))
        .catch(err => console.log('Could not copy to clipboard:', err));
        
    return result;
})();
        `;
    }

    /**
     * Get product selectors for a company
     * @param {string} companyId - Company ID
     * @returns {Array} - Array of CSS selectors
     */
    static getProductSelectors(companyId) {
        const selectors = {
            hornbach: ['.product-tile', '.product-item', '[data-testid="product-tile"]'],
            bauhaus: ['.product-card', '.product-item', '.product-tile'],
            byggmax: ['.product-card', '.product-item', '.product-tile', '.product']
        };
        
        return selectors[companyId] || ['.product', '.item', '.card'];
    }
}
