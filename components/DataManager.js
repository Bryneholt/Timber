// Data Manager Component for handling scraped material data

import { MaterialScraper } from '../js/scraper.js';
import { COMPANIES } from '../data/companies.js';
import { SCRAPED_MATERIALS, getMaterials, getCompanyMaterials, searchMaterials } from '../data/scraped_materials.js';

export class DataManager {
    /**
     * Render the data management interface
     * @returns {string} - HTML string for the data manager
     */
    static renderDataManager() {
        return `
            <div class="data-manager">
                <h3>Material Data Management</h3>
                
                <div class="scraping-section">
                    <h4>Material Data</h4>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        Material data is automatically scraped and updated. You can also manually import scraped data.
                    </div>
                    
                    <div class="data-status">
                        <h5>Available Materials:</h5>
                        <div id="materials-summary"></div>
                    </div>
                    
                    <div class="scraping-controls">
                        <div class="flex">
                            <div class="form-group">
                                <label for="scrape-company">Företag:</label>
                                <select id="scrape-company" class="company-select">
                                    ${this.renderCompanyOptions()}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="scrape-category">Kategori:</label>
                                <select id="scrape-category" class="category-select">
                                    <option value="">Välj företag först...</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="scraping-actions">
                            <button id="load-materials-btn">
                                <i class="fas fa-download"></i> Ladda Material Data
                            </button>
                            <button id="import-data-btn" class="secondary">
                                <i class="fas fa-upload"></i> Importera Manuell Data
                            </button>
                        </div>
                    </div>
                    
                    <div id="script-output" class="script-output" style="display: none;">
                        <h5>Scraping Script:</h5>
                        <div class="script-container">
                            <pre id="generated-script"></pre>
                            <button id="copy-script-btn" class="small">
                                <i class="fas fa-copy"></i> Kopiera Script
                            </button>
                        </div>
                        <div class="script-instructions">
                            <h6>Instruktioner:</h6>
                            <ol>
                                <li>Gå till företagets webbplats</li>
                                <li>Öppna Developer Tools (F12)</li>
                                <li>Gå till Console-fliken</li>
                                <li>Klistra in scriptet och tryck Enter</li>
                                <li>Kopiera resultatet och importera här</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <div class="import-section">
                    <h4>Importera Data</h4>
                    <div class="form-group">
                        <label for="scraped-data-input">Scraped Data (JSON):</label>
                        <textarea id="scraped-data-input" rows="10" placeholder="Klistra in JSON-data här..."></textarea>
                    </div>
                    <button id="process-data-btn" class="secondary">
                        <i class="fas fa-cogs"></i> Bearbeta Data
                    </button>
                </div>
                
                <div class="data-preview" id="data-preview" style="display: none;">
                    <h4>Förhandsvisning av Data</h4>
                    <div id="preview-content"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render company options for scraping
     * @returns {string} - HTML string for company options
     */
    static renderCompanyOptions() {
        let html = '<option value="">Välj företag...</option>';
        
        Object.values(COMPANIES).forEach(company => {
            html += `
                <option value="${company.id}">
                    ${company.logo} ${company.name}
                </option>
            `;
        });
        
        return html;
    }

    /**
     * Render category options for a company
     * @param {string} companyId - Company ID
     * @returns {string} - HTML string for category options
     */
    static renderCategoryOptions(companyId) {
        const company = COMPANIES[companyId.toUpperCase()];
        if (!company) return '<option value="">Inga kategorier tillgängliga</option>';
        
        let html = '<option value="">Välj kategori...</option>';
        
        Object.entries(company.categories).forEach(([key, category]) => {
            html += `
                <option value="${key}">
                    ${category.name}
                </option>
            `;
        });
        
        return html;
    }

    /**
     * Generate scraping script for selected company and category
     * @param {string} companyId - Company ID
     * @param {string} categoryId - Category ID
     * @returns {string} - Generated JavaScript code
     */
    static generateScrapingScript(companyId, categoryId) {
        try {
            return MaterialScraper.generateScrapingScript(companyId, categoryId);
        } catch (error) {
            console.error('Error generating script:', error);
            return `// Error: ${error.message}`;
        }
    }

    /**
     * Process imported scraped data
     * @param {string} jsonData - JSON string of scraped data
     * @returns {Object} - Processed data
     */
    static processScrapedData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.company || !data.category || !Array.isArray(data.materials)) {
                throw new Error('Invalid data structure');
            }
            
            // Process materials
            const processedMaterials = data.materials.map(material => ({
                ...material,
                id: this.generateMaterialId(material),
                processedAt: new Date().toISOString()
            }));
            
            return {
                ...data,
                materials: processedMaterials,
                processedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error processing data:', error);
            throw new Error(`Invalid JSON data: ${error.message}`);
        }
    }

    /**
     * Generate unique ID for material
     * @param {Object} material - Material object
     * @returns {string} - Unique ID
     */
    static generateMaterialId(material) {
        const base = `${material.company}-${material.category}-${material.name}`;
        return base.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    /**
     * Render data preview
     * @param {Object} data - Processed data
     * @returns {string} - HTML string for data preview
     */
    static renderDataPreview(data) {
        let html = `
            <div class="data-summary">
                <div class="summary-item">
                    <strong>Företag:</strong> ${data.company}
                </div>
                <div class="summary-item">
                    <strong>Kategori:</strong> ${data.category}
                </div>
                <div class="summary-item">
                    <strong>Antal produkter:</strong> ${data.materials.length}
                </div>
                <div class="summary-item">
                    <strong>Skrapad:</strong> ${new Date(data.timestamp).toLocaleString('sv-SE')}
                </div>
            </div>
        `;
        
        if (data.materials.length > 0) {
            html += `
                <div class="materials-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Namn</th>
                                <th>Dimension</th>
                                <th>Pris</th>
                                <th>Åtgärder</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            data.materials.forEach(material => {
                html += `
                    <tr>
                        <td>${material.name}</td>
                        <td>${material.dimension || 'N/A'}</td>
                        <td>${material.price} kr</td>
                        <td>
                            <button class="small" onclick="dataManager.addToStock('${material.id}')">
                                <i class="fas fa-plus"></i> Lägg till
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Add material to stock lengths
     * @param {Object} material - Material to add
     * @param {Object} app - Main application instance
     */
    static addToStock(material, app) {
        if (!material.dimension) {
            alert('Materialet har ingen dimension specificerad');
            return;
        }
        
        // Extract length from dimension (e.g., "45x95" -> 95mm)
        const dimensionMatch = material.dimension.match(/(\d+)x(\d+)/);
        if (!dimensionMatch) {
            alert('Kunde inte extrahera längd från dimension');
            return;
        }
        
        const length = parseInt(dimensionMatch[2]);
        const price = material.price;
        
        // Add to stock lengths
        if (!app.lagerLangder[material.dimension]) {
            app.lagerLangder[material.dimension] = [];
        }
        
        app.lagerLangder[material.dimension].push({
            langd: length,
            pris: price,
            source: material.company,
            name: material.name
        });
        
        // Sort by length
        app.lagerLangder[material.dimension].sort((a, b) => a.langd - b.langd);
        
        // Update UI
        app.updateLagerList();
        app.saveToStorage();
        
        alert(`Material tillagt: ${material.name} (${material.dimension})`);
    }

    /**
     * Render materials summary
     * @returns {string} - HTML string for materials summary
     */
    static renderMaterialsSummary() {
        let html = '<div class="materials-overview">';
        
        Object.entries(SCRAPED_MATERIALS).forEach(([companyId, categories]) => {
            const company = COMPANIES[companyId.toUpperCase()];
            if (!company) return;
            
            html += `
                <div class="company-materials">
                    <h6>${company.logo} ${company.name}</h6>
                    <div class="category-list">
            `;
            
            Object.entries(categories).forEach(([categoryId, materials]) => {
                const category = company.categories[categoryId];
                if (!category) return;
                
                html += `
                    <div class="category-item">
                        <span class="category-name">${category.name}</span>
                        <span class="material-count">${materials.length} produkter</span>
                        <button class="small" onclick="dataManager.loadMaterials('${companyId}', '${categoryId}')">
                            <i class="fas fa-plus"></i> Lägg till
                        </button>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Load materials for a specific company and category
     * @param {string} companyId - Company ID
     * @param {string} categoryId - Category ID
     * @param {Object} app - Main application instance
     */
    static loadMaterials(companyId, categoryId, app) {
        const materials = getMaterials(companyId, categoryId);
        
        if (materials.length === 0) {
            alert('Inga material hittades för denna kategori');
            return;
        }
        
        let addedCount = 0;
        
        materials.forEach(material => {
            if (material.dimension) {
                // Extract length from dimension (e.g., "45x95" -> 95mm)
                const dimensionMatch = material.dimension.match(/(\d+)x(\d+)/);
                if (dimensionMatch) {
                    const length = parseInt(dimensionMatch[2]);
                    const price = material.price;
                    
                    // Add to stock lengths
                    if (!app.lagerLangder[material.dimension]) {
                        app.lagerLangder[material.dimension] = [];
                    }
                    
                    // Check if material already exists
                    const exists = app.lagerLangder[material.dimension].some(
                        item => item.langd === length && item.name === material.name
                    );
                    
                    if (!exists) {
                        app.lagerLangder[material.dimension].push({
                            langd: length,
                            pris: price,
                            source: material.company,
                            name: material.name
                        });
                        addedCount++;
                    }
                }
            }
        });
        
        // Sort by length
        Object.keys(app.lagerLangder).forEach(dimension => {
            app.lagerLangder[dimension].sort((a, b) => a.langd - b.langd);
        });
        
        // Update UI
        app.updateLagerList();
        app.saveToStorage();
        
        alert(`${addedCount} material tillagda från ${COMPANIES[companyId.toUpperCase()].name} - ${COMPANIES[companyId.toUpperCase()].categories[categoryId].name}`);
    }

    /**
     * Export scraped data
     * @param {Object} data - Data to export
     * @param {string} filename - Filename for export
     */
    static exportData(data, filename = 'scraped-materials.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}
