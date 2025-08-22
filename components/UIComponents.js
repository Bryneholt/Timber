// UI Components for the Timber Calculator

import { formatPrice, formatLength, formatPercentage } from '../js/utils.js';

/**
 * UI Components class for rendering different parts of the application
 */
export class UIComponents {
    /**
     * Render the cutting visualization for a plank
     * @param {Array} planka - Array of pieces in the plank
     * @param {number} plankaLangd - Total plank length
     * @param {number} index - Plank index
     * @param {Array} artiklar - All articles for reference
     * @returns {string} - HTML string for the plank visualization
     */
    static renderPlankaVisualization(planka, plankaLangd, index, artiklar) {
        const segments = planka.map(bit => {
            const artikel = artiklar.find(a => a.id === bit.artikelId);
            return {
                langd: bit.langd,
                namn: artikel ? artikel.namn : ''
            };
        });
        
        // Calculate waste
        const utnyttjadLangd = segments.reduce((sum, segment) => sum + segment.langd, 0);
        const spillLangd = plankaLangd - utnyttjadLangd;
        
        let html = `
            <div class="planka">
                <div class="planka-info">Planka ${index + 1} - ${formatLength(plankaLangd)}</div>
                <div class="planka-segments">
        `;
        
        // Visualize pieces in the plank
        segments.forEach(segment => {
            const bredde = (segment.langd / plankaLangd) * 100;
            html += `
                <div class="segment virke" style="width: ${bredde}%;" title="${segment.namn}: ${segment.langd} mm">
                    ${segment.langd}
                </div>
            `;
        });
        
        // Visualize waste
        if (spillLangd > 0) {
            const spillBredde = (spillLangd / plankaLangd) * 100;
            html += `
                <div class="segment spill" style="width: ${spillBredde}%;" title="Spill: ${spillLangd} mm">
                    ${spillLangd}
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Render cutting results for a dimension
     * @param {string} dimension - Dimension name
     * @param {Object} resultat - Cutting result data
     * @param {Array} artiklar - All articles for reference
     * @returns {string} - HTML string for the dimension results
     */
    static renderDimensionResults(dimension, resultat, artiklar) {
        let html = `
            <div class="kapning-container">
                <h4>Dimension: ${dimension} <span class="badge badge-primary">${resultat.plankor.length} plankor</span></h4>
                <div class="summary-box">
                    <div class="summary-data">
                        <div class="summary-item">
                            <div class="summary-label">Lagerlängd</div>
                            <div class="summary-value">${formatLength(resultat.lagerLangd)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Pris per meter</div>
                            <div class="summary-value">${formatPrice(resultat.lagerPris)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Totalt spill</div>
                            <div class="summary-value">${formatLength(resultat.totalSpill)} (${formatPercentage(resultat.totalSpill, resultat.totalLangd)})</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total kostnad</div>
                            <div class="summary-value">${formatPrice(resultat.totalKostnad)}</div>
                        </div>
                    </div>
                </div>
        `;
        
        // Visualize each plank
        resultat.plankor.forEach((planka, index) => {
            html += this.renderPlankaVisualization(planka, resultat.lagerLangd, index, artiklar);
        });
        
        html += `</div>`;
        return html;
    }

    /**
     * Render overall summary statistics
     * @param {Object} stats - Overall statistics
     * @returns {string} - HTML string for the summary
     */
    static renderOverallSummary(stats) {
        return `
            <div class="summary-box">
                <h4>Sammanfattning</h4>
                <div class="summary-data">
                    <div class="summary-item">
                        <div class="summary-label">Totalt antal plankor</div>
                        <div class="summary-value">${stats.totalPlankor}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total kostnad</div>
                        <div class="summary-value">${formatPrice(stats.totalKostnad)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total längd</div>
                        <div class="summary-value">${formatLength(stats.totalLangd)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total spillmängd</div>
                        <div class="summary-value">${formatLength(stats.totalSpill)} (${formatPercentage(stats.totalSpill, stats.totalLangd)})</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render article table row
     * @param {Object} artikel - Article data
     * @returns {string} - HTML string for the table row
     */
    static renderArticleRow(artikel) {
        const totalLangd = (artikel.antal * artikel.langd) / 1000; // in meters
        
        return `
            <tr>
                <td>${artikel.namn}</td>
                <td>${artikel.antal} st</td>
                <td>${artikel.langd} mm</td>
                <td>${totalLangd.toFixed(2).replace('.', ',')} m</td>
                <td class="actions">
                    <button class="icon small" onclick="app.editArtikel(${artikel.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon small danger" onclick="app.deleteArtikel(${artikel.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Render stock length row
     * @param {Object} lager - Stock length data
     * @param {number} index - Index in the array
     * @param {string} dimension - Current dimension
     * @returns {string} - HTML string for the stock length row
     */
    static renderStockLengthRow(lager, index, dimension) {
        return `
            <div class="lager-row">
                <div class="form-group" style="flex: 3;">
                    <input type="number" value="${lager.langd}" min="1" class="lager-langd-edit" data-index="${index}">
                </div>
                <div class="form-group" style="flex: 2;">
                    <input type="number" value="${lager.pris}" min="0" step="0.01" class="lager-pris-edit" data-index="${index}">
                </div>
                <button type="button" class="danger" onclick="app.deleteLagerLangd('${dimension}', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    /**
     * Render project table row
     * @param {Object} projekt - Project data
     * @returns {string} - HTML string for the project row
     */
    static renderProjectRow(projekt) {
        const datumText = new Date(projekt.skapad).toLocaleDateString('sv-SE');
        
        return `
            <tr>
                <td>${projekt.namn}</td>
                <td>${datumText}</td>
                <td class="actions">
                    <button class="small" onclick="app.loadProjekt('${projekt.namn}')">
                        <i class="fas fa-folder-open"></i> Ladda
                    </button>
                    <button class="small danger" onclick="app.deleteProjekt('${projekt.namn}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Render error message
     * @param {string} message - Error message
     * @returns {string} - HTML string for the error
     */
    static renderError(message) {
        return `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> 
                ${message}
            </div>
        `;
    }

    /**
     * Render no results message
     * @returns {string} - HTML string for no results
     */
    static renderNoResults() {
        return `
            <div class="no-results">
                <i class="fas fa-calculator fa-3x"></i>
                <p>Lägg till artiklar och lagerlängder, sedan klicka på "Beräkna optimal kapning"</p>
            </div>
        `;
    }

    /**
     * Render loading spinner
     * @returns {string} - HTML string for the spinner
     */
    static renderSpinner() {
        return `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p>Beräknar optimal kapning...</p>
            </div>
        `;
    }

    /**
     * Render standard dimensions dropdown
     * @param {Array} dimensions - Array of standard dimensions
     * @returns {string} - HTML string for the dropdown
     */
    static renderStandardDimensionsDropdown(dimensions) {
        let html = '<option value="">Anpassad dimension...</option>';
        
        dimensions.forEach(dim => {
            html += `<option value="${dim.value}">${dim.label}</option>`;
        });
        
        return html;
    }

    /**
     * Render dimensions dropdown from scraped materials with categories
     * @param {Array} materials - Array of material objects with dimensions and names
     * @returns {string} - HTML string for the dropdown
     */
    static renderDimensionsFromMaterials(materials) {
        const categorizedDimensions = this.categorizeDimensions(materials);
        
        let html = '<option value="">Anpassad dimension...</option>';
        
        // Add each category as an optgroup
        Object.entries(categorizedDimensions).forEach(([category, dimensions]) => {
            if (dimensions.length > 0) {
                html += `<optgroup label="${category}">`;
                dimensions.sort().forEach(dim => {
                    html += `<option value="${dim}">${dim} mm</option>`;
                });
                html += '</optgroup>';
            }
        });
        
        return html;
    }

    /**
     * Categorize dimensions based on material names
     * @param {Array} materials - Array of material objects
     * @returns {Object} - Object with categories as keys and dimension arrays as values
     */
    static categorizeDimensions(materials) {
        const categories = {
            'Reglar': new Set(),
            'Trall': new Set(),
            'Panel': new Set(),
            'Råspont': new Set(),
            'Stolpar': new Set(),
            'Läkt': new Set(),
            'Foder/Sockel': new Set(),
            'Staket': new Set(),
            'Övrigt': new Set()
        };
        
        materials.forEach(material => {
            const name = material.name.toLowerCase();
            const dimension = material.dimension;
            let categoryFound = false;
            
            if (name.includes('regel')) {
                categories['Reglar'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('trall')) {
                categories['Trall'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('panel') || name.includes('ytterpanel')) {
                categories['Panel'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('råspont') || name.includes('spont')) {
                categories['Råspont'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('stolpe')) {
                categories['Stolpar'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('läkt') || name.includes('lakt')) {
                categories['Läkt'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('sockel') || name.includes('foder')) {
                categories['Foder/Sockel'].add(dimension);
                categoryFound = true;
            }
            if (name.includes('staket') || name.includes('glespanel')) {
                categories['Staket'].add(dimension);
                categoryFound = true;
            }
            
            if (!categoryFound) {
                categories['Övrigt'].add(dimension);
            }
        });
        
        // Convert Sets to Arrays
        Object.keys(categories).forEach(key => {
            categories[key] = Array.from(categories[key]);
        });
        
        return categories;
    }

    /**
     * Render optimization strategies dropdown
     * @param {Array} strategies - Array of optimization strategies
     * @returns {string} - HTML string for the dropdown
     */
    static renderOptimizationStrategiesDropdown(strategies) {
        let html = '';
        
        strategies.forEach(strategy => {
            html += `<option value="${strategy.value}">${strategy.label}</option>`;
        });
        
        return html;
    }

    /**
     * Render standard length buttons
     * @param {Array} lengths - Array of standard lengths
     * @returns {string} - HTML string for the buttons
     */
    static renderStandardLengthButtons(lengths) {
        let html = '';
        
        lengths.forEach(length => {
            html += `<button class="small" data-length="${length}">${length} mm</button>`;
        });
        
        return html;
    }

    /**
     * Create modal HTML
     * @param {string} id - Modal ID
     * @param {string} title - Modal title
     * @param {string} content - Modal content
     * @returns {string} - HTML string for the modal
     */
    static createModal(id, title, content) {
        return `
            <div class="modal" id="${id}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    ${content}
                </div>
            </div>
        `;
    }

    /**
     * Render edit article modal content
     * @param {Object} artikel - Article data to edit
     * @returns {string} - HTML string for the modal content
     */
    static renderEditArticleModalContent(artikel) {
        return `
            <form id="edit-form">
                <input type="hidden" id="edit-id" value="${artikel.id}">
                <div class="form-group">
                    <label for="edit-namn">Artikelnamn/Dimension:</label>
                    <input type="text" id="edit-namn" value="${artikel.namn}">
                </div>
                <div class="flex">
                    <div class="form-group">
                        <label for="edit-antal">Antal stycken:</label>
                        <input type="number" min="1" id="edit-antal" value="${artikel.antal}">
                    </div>
                    <div class="form-group">
                        <label for="edit-langd">Längd per styck (mm):</label>
                        <input type="number" min="1" id="edit-langd" value="${artikel.langd}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="secondary modal-close-btn">Avbryt</button>
                    <button type="submit">Spara ändringar</button>
                </div>
            </form>
        `;
    }
}
