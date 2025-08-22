// Main application class for the Timber Calculator

import { CONFIG, MESSAGES } from '../data/config.js';
import { generateId, getDimensionFromArtikelnamn, validateArtikel, validateLagerLangd, showAlert, confirmDialog, formatLength, formatPrice, formatPercentage } from './utils.js';
import { UIComponents } from '../components/UIComponents.js';
import { calculateOverallStatistics } from './optimizer.js';
import { StorageService } from './storage.js';
import { getAvailableLengths } from '../data/scraped_materials.js';

/**
 * Main application class
 */
export class TimberCalculator {
    constructor() {
        this.artiklar = [];
        this.lagerLangder = {};
        this.lastId = 0;
        this.currentDimension = '';
        this.lastCalculationResults = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Dimension select
        document.getElementById('dimension-select').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('artikel-namn').value = e.target.value;
                this.populateAvailableLengths(e.target.value);
            }
        });
        
        // Article form
        document.getElementById('artikel-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addArtikel();
        });
        
        // Clear article form
        document.getElementById('clear-artikel-btn').addEventListener('click', () => {
            this.clearArticleForm();
        });
        
        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateOptimalCuts();
        });
        
        // Stock length form
        document.getElementById('lager-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLagerLangd();
        });
        
        // Dimension filter
        document.getElementById('dimension-filter').addEventListener('change', (e) => {
            this.currentDimension = e.target.value;
            this.updateLagerList();
        });
        
        // Standard lengths buttons
        document.querySelectorAll('#standard-lengths-container button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('lager-langd').value = btn.dataset.length;
            });
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Edit form
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedArtikel();
        });
        
        // Optimization strategy
        document.getElementById('optimization-strategy').addEventListener('change', () => {
            if (this.artiklar.length > 0) {
                this.calculateOptimalCuts();
            }
        });
        
        // Save project
        document.getElementById('save-projekt-btn').addEventListener('click', () => {
            this.saveProjekt();
        });
        
        // Export project
        document.getElementById('export-projekt-btn').addEventListener('click', () => {
            this.exportProjekt();
        });
        
        // Import project
        document.getElementById('import-projekt-btn').addEventListener('click', () => {
            this.importProjekt();
        });
        
        // Print buttons
        document.getElementById('print-shopping-btn').addEventListener('click', () => {
            this.printShoppingList();
        });
        
        document.getElementById('print-cutting-btn').addEventListener('click', () => {
            this.printCuttingGuide();
        });
    }

    /**
     * Switch to a specific tab
     * @param {string} tabId - Tab ID to switch to
     */
    switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-content`).classList.add('active');
    }

    /**
     * Add a new article
     */
    addArtikel() {
        const namn = document.getElementById('artikel-namn').value.trim();
        const antal = parseInt(document.getElementById('behov-antal').value);
        const langd = parseInt(document.getElementById('behov-langd').value);
        const spillMargin = parseInt(document.getElementById('spill-margin').value) || 0;
        
        const artikel = { namn, antal, langd, spillMargin };
        const validation = validateArtikel(artikel);
        
        if (!validation.isValid) {
            showAlert(validation.errors.join(', '), 'error');
            return;
        }
        
        const dimension = getDimensionFromArtikelnamn(namn);
        const adjustedLangd = langd + spillMargin; // Add spill to required length
        
        const newArtikel = {
            id: generateId(this.lastId),
            namn: namn,
            dimension: dimension,
            antal: antal,
            langd: adjustedLangd,
            originalLangd: langd,
            spillMargin: spillMargin
        };
        
        this.artiklar.push(newArtikel);
        this.lastId = newArtikel.id;
        
        // Create stock lengths for dimension if they don't exist
        if (!this.lagerLangder[dimension]) {
            this.lagerLangder[dimension] = [];
            this.initializeDefaultStockLengths(dimension);
            this.updateDimensionFilter();
        }
        
        this.clearArticleForm();
        this.updateArtikelList();
        this.saveToStorage();
        
        showAlert(MESSAGES.SUCCESS.ARTICLE_ADDED, 'success');
    }

    /**
     * Initialize default stock lengths for a dimension
     * @param {string} dimension - Dimension to initialize
     */
    initializeDefaultStockLengths(dimension) {
        const basePris = CONFIG.DEFAULT_PRICING[dimension] || 25.0;
        
        CONFIG.STANDARD_LENGTHS.forEach(langd => {
            this.lagerLangder[dimension].push({
                langd: langd,
                pris: basePris
            });
        });
    }

    /**
     * Clear the article form
     */
    clearArticleForm() {
        document.getElementById('artikel-namn').value = '';
        document.getElementById('behov-antal').value = '';
        document.getElementById('behov-langd').value = '';
        document.getElementById('spill-margin').value = '5'; // Reset to default
        document.getElementById('dimension-select').selectedIndex = 0;
    }

    /**
     * Populate available lengths for a given dimension
     */
    populateAvailableLengths(dimension) {
        try {
            const availableLengths = getAvailableLengths(dimension);
            const standardLengthsContainer = document.getElementById('standard-lengths-container');
            
            if (standardLengthsContainer && availableLengths.length > 0) {
                let html = '<h4>Tillgängliga längder för ' + dimension + ':</h4>';
                html += '<div class="standard-lengths">';
                
                availableLengths.forEach(length => {
                    html += `<button type="button" class="length-btn" data-length="${length}">${length} mm</button>`;
                });
                
                html += '</div>';
                standardLengthsContainer.innerHTML = html;
                
                // Add event listeners to length buttons
                standardLengthsContainer.querySelectorAll('.length-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.getElementById('behov-langd').value = btn.dataset.length;
                    });
                });
            }
        } catch (error) {
            console.log('Could not load available lengths:', error);
        }
    }

    /**
     * Update the article list display
     */
    updateArtikelList() {
        const tbody = document.getElementById('artikel-list');
        tbody.innerHTML = '';
        
        if (this.artiklar.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Inga artiklar tillagda än.</td></tr>';
            return;
        }
        
        this.artiklar.forEach(artikel => {
            tbody.innerHTML += UIComponents.renderArticleRow(artikel);
        });
    }

    /**
     * Edit an article
     * @param {number} id - Article ID
     */
    editArtikel(id) {
        const artikel = this.artiklar.find(a => a.id === id);
        if (!artikel) return;
        
        document.getElementById('edit-id').value = artikel.id;
        document.getElementById('edit-namn').value = artikel.namn;
        document.getElementById('edit-antal').value = artikel.antal;
        document.getElementById('edit-langd').value = artikel.originalLangd || artikel.langd;
        document.getElementById('edit-spill').value = artikel.spillMargin || 0;
        
        this.openModal('edit-modal');
    }

    /**
     * Save edited article
     */
    saveEditedArtikel() {
        const id = parseInt(document.getElementById('edit-id').value);
        const namn = document.getElementById('edit-namn').value.trim();
        const antal = parseInt(document.getElementById('edit-antal').value);
        const langd = parseInt(document.getElementById('edit-langd').value);
        const spillMargin = parseInt(document.getElementById('edit-spill').value) || 0;
        
        const artikel = { namn, antal, langd, spillMargin };
        const validation = validateArtikel(artikel);
        
        if (!validation.isValid) {
            showAlert(validation.errors.join(', '), 'error');
            return;
        }
        
        const index = this.artiklar.findIndex(a => a.id === id);
        if (index !== -1) {
            const dimension = getDimensionFromArtikelnamn(namn);
            const adjustedLangd = langd + spillMargin;
            
            this.artiklar[index] = {
                id: id,
                namn: namn,
                dimension: dimension,
                antal: antal,
                langd: adjustedLangd,
                originalLangd: langd,
                spillMargin: spillMargin
            };
            
            if (!this.lagerLangder[dimension]) {
                this.lagerLangder[dimension] = [];
                this.updateDimensionFilter();
            }
            
            this.updateArtikelList();
            this.saveToStorage();
            this.closeModal();
            
            showAlert(MESSAGES.SUCCESS.ARTICLE_UPDATED, 'success');
            
            // Update calculations if results are already shown
            if (document.querySelector('#result-container .kapning-container')) {
                this.calculateOptimalCuts();
            }
        }
    }

    /**
     * Delete an article
     * @param {number} id - Article ID
     */
    async deleteArtikel(id) {
        const confirmed = await confirmDialog(MESSAGES.CONFIRMATIONS.DELETE_ARTICLE);
        if (!confirmed) return;
        
        const index = this.artiklar.findIndex(a => a.id === id);
        if (index !== -1) {
            this.artiklar.splice(index, 1);
            this.updateArtikelList();
            this.saveToStorage();
            
            showAlert(MESSAGES.SUCCESS.ARTICLE_DELETED, 'success');
            
            // Update calculations if results are already shown
            if (document.querySelector('#result-container .kapning-container')) {
                this.calculateOptimalCuts();
            }
        }
    }

    /**
     * Add a new stock length
     */
    addLagerLangd() {
        const dimension = document.getElementById('dimension-filter').value;
        const langd = parseInt(document.getElementById('lager-langd').value);
        const pris = parseFloat(document.getElementById('lager-pris').value);
        
        if (!dimension) {
            showAlert('Välj först en dimension.', 'error');
            return;
        }
        
        const lagerLangd = { dimension, langd, pris };
        const validation = validateLagerLangd(lagerLangd);
        
        if (!validation.isValid) {
            showAlert(validation.errors.join(', '), 'error');
            return;
        }
        
        // Check if length already exists
        const existingIndex = this.lagerLangder[dimension].findIndex(l => l.langd === langd);
        if (existingIndex !== -1) {
            // Update price if length already exists
            this.lagerLangder[dimension][existingIndex].pris = pris;
        } else {
            // Add new length
            this.lagerLangder[dimension].push({
                langd: langd,
                pris: pris
            });
            
            // Sort by length
            this.lagerLangder[dimension].sort((a, b) => a.langd - b.langd);
        }
        
        // Clear form
        document.getElementById('lager-langd').value = '';
        document.getElementById('lager-pris').value = '';
        
        this.updateLagerList();
        this.saveToStorage();
        
        showAlert('Lagerlängd tillagd.', 'success');
    }

    /**
     * Update dimension filter dropdown
     */
    updateDimensionFilter() {
        const select = document.getElementById('dimension-filter');
        const currentValue = select.value;
        select.innerHTML = '';
        
        const dimensions = Object.keys(this.lagerLangder);
        
        if (dimensions.length === 0) {
            select.innerHTML = '<option value="">Inga dimensioner tillgängliga</option>';
            return;
        }
        
        dimensions.forEach(dimension => {
            const option = document.createElement('option');
            option.value = dimension;
            option.textContent = dimension;
            select.appendChild(option);
        });
        
        // Restore selected dimension if possible
        if (currentValue && dimensions.includes(currentValue)) {
            select.value = currentValue;
        } else {
            this.currentDimension = dimensions[0];
            select.value = this.currentDimension;
        }
        
        document.getElementById('current-dimension').textContent = this.currentDimension;
    }

    /**
     * Update stock length list display
     */
    updateLagerList() {
        const dimension = document.getElementById('dimension-filter').value;
        const container = document.getElementById('lager-list');
        container.innerHTML = '';
        
        document.getElementById('current-dimension').textContent = dimension || 'denna dimension';
        
        if (!dimension || !this.lagerLangder[dimension] || this.lagerLangder[dimension].length === 0) {
            container.innerHTML = '<p>Inga lagerlängder tillagda för denna dimension.</p>';
            return;
        }
        
        this.lagerLangder[dimension].forEach((lager, index) => {
            container.innerHTML += UIComponents.renderStockLengthRow(lager, index, dimension);
        });
        
        this.setupStockLengthEventListeners(dimension);
    }

    /**
     * Set up event listeners for stock length editing
     * @param {string} dimension - Current dimension
     */
    setupStockLengthEventListeners(dimension) {
        // Length editing
        document.querySelectorAll('.lager-langd-edit').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const langd = parseInt(e.target.value);
                
                if (!isNaN(langd) && langd > 0) {
                    this.lagerLangder[dimension][index].langd = langd;
                    this.saveToStorage();
                    
                    // Sort and update list
                    this.lagerLangder[dimension].sort((a, b) => a.langd - b.langd);
                    this.updateLagerList();
                }
            });
        });
        
        // Price editing
        document.querySelectorAll('.lager-pris-edit').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const pris = parseFloat(e.target.value);
                
                if (!isNaN(pris) && pris >= 0) {
                    this.lagerLangder[dimension][index].pris = pris;
                    this.saveToStorage();
                }
            });
        });
    }

    /**
     * Delete a stock length
     * @param {string} dimension - Dimension
     * @param {number} index - Index to delete
     */
    async deleteLagerLangd(dimension, index) {
        const confirmed = await confirmDialog(MESSAGES.CONFIRMATIONS.DELETE_STOCK_LENGTH);
        if (!confirmed) return;
        
        this.lagerLangder[dimension].splice(index, 1);
        this.updateLagerList();
        this.saveToStorage();
        
        showAlert('Lagerlängd borttagen.', 'success');
        
        // Update calculations if results are already shown
        if (document.querySelector('#result-container .kapning-container')) {
            this.calculateOptimalCuts();
        }
    }

    /**
     * Calculate optimal cuts
     */
    calculateOptimalCuts() {
        if (this.artiklar.length === 0) {
            showAlert(MESSAGES.ERRORS.NO_ARTICLES, 'error');
            return;
        }
        
        const results = document.getElementById('result-container');
        results.innerHTML = UIComponents.renderSpinner();
        
        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const optimeringsMetod = document.getElementById('optimization-strategy').value;
            const stats = calculateOverallStatistics(this.artiklar, this.lagerLangder, optimeringsMetod);
            
            let html = UIComponents.renderOverallSummary(stats);
            
            Object.keys(stats.dimensionResults).forEach(dimension => {
                const resultat = stats.dimensionResults[dimension];
                
                if (resultat.error) {
                    html += UIComponents.renderError(resultat.error);
                } else {
                    html += UIComponents.renderDimensionResults(dimension, resultat, this.artiklar);
                }
            });
            
            results.innerHTML = html || UIComponents.renderNoResults();
            
            // Store results for printing and show print buttons
            this.lastCalculationResults = stats;
            document.getElementById('print-actions').style.display = 'flex';
            
            // Switch to results tab
            this.switchTab('resultat');
        }, 100);
    }

    /**
     * Save project
     */
    saveProjekt() {
        const projektNamn = document.getElementById('projekt-namn').value.trim();
        
        if (!projektNamn) {
            showAlert(MESSAGES.ERRORS.PROJECT_NAME_REQUIRED, 'error');
            return;
        }
        
        try {
            const projekt = {
                namn: projektNamn,
                skapad: new Date().toISOString(),
                artiklar: this.artiklar,
                lagerLangder: this.lagerLangder
            };
            
            StorageService.saveProject(projekt);
            this.updateProjektList();
            
            showAlert(MESSAGES.SUCCESS.PROJECT_SAVED, 'success');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }

    /**
     * Load project
     * @param {string} projektNamn - Project name
     */
    async loadProjekt(projektNamn) {
        const confirmed = await confirmDialog(MESSAGES.CONFIRMATIONS.LOAD_PROJECT);
        if (!confirmed) return;
        
        try {
            const projekt = StorageService.loadProject(projektNamn);
            
            if (projekt) {
                this.artiklar = projekt.artiklar;
                this.lagerLangder = projekt.lagerLangder;
                this.lastId = projekt.lastId;
                
                this.updateArtikelList();
                this.updateDimensionFilter();
                this.updateLagerList();
                
                document.getElementById('projekt-namn').value = projektNamn;
                
                showAlert(MESSAGES.SUCCESS.PROJECT_LOADED, 'success');
            }
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }

    /**
     * Delete project
     * @param {string} projektNamn - Project name
     */
    async deleteProjekt(projektNamn) {
        const confirmed = await confirmDialog(MESSAGES.CONFIRMATIONS.DELETE_PROJECT);
        if (!confirmed) return;
        
        try {
            StorageService.deleteProject(projektNamn);
            this.updateProjektList();
            
            showAlert(MESSAGES.SUCCESS.PROJECT_DELETED, 'success');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }

    /**
     * Update project list display
     */
    updateProjektList() {
        const container = document.getElementById('saved-projects');
        const sparadeProjekt = StorageService.getProjects();
        
        if (sparadeProjekt.length === 0) {
            container.innerHTML = '<p>Inga sparade projekt hittades.</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Projektnamn</th><th>Skapad</th><th>Åtgärder</th></tr></thead><tbody>';
        
        sparadeProjekt.forEach(projekt => {
            html += UIComponents.renderProjectRow(projekt);
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Export project
     */
    exportProjekt() {
        const projektNamn = document.getElementById('projekt-namn').value.trim() || 'Virke-Projekt';
        
        try {
            const projekt = {
                namn: projektNamn,
                artiklar: this.artiklar,
                lagerLangder: this.lagerLangder
            };
            
            StorageService.exportProject(projekt, projektNamn);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }

    /**
     * Import project
     */
    async importProjekt() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            showAlert(MESSAGES.ERRORS.FILE_REQUIRED, 'error');
            return;
        }
        
        try {
            const confirmed = await confirmDialog(MESSAGES.CONFIRMATIONS.IMPORT_PROJECT);
            if (!confirmed) return;
            
            const importedData = await StorageService.importProject(file);
            
            this.artiklar = importedData.artiklar;
            this.lagerLangder = importedData.lagerLangder;
            this.lastId = importedData.lastId;
            
            this.updateArtikelList();
            this.updateDimensionFilter();
            this.updateLagerList();
            
            showAlert(MESSAGES.SUCCESS.PROJECT_IMPORTED, 'success');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }

    /**
     * Open modal
     * @param {string} modalId - Modal ID
     */
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    /**
     * Close modal
     */
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateArtikelList();
        this.updateDimensionFilter();
        this.updateLagerList();
        this.updateProjektList();
    }

    /**
     * Load data from storage
     */
    loadFromStorage() {
        try {
            const data = StorageService.loadAppData();
            this.artiklar = data.artiklar;
            this.lagerLangder = data.lagerLangder;
            this.lastId = data.lastId;
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    /**
     * Save data to storage
     */
    saveToStorage() {
        try {
            StorageService.saveAppData({
                artiklar: this.artiklar,
                lagerLangder: this.lagerLangder,
                lastId: this.lastId
            });
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    /**
     * Print shopping list
     */
    printShoppingList() {
        if (!this.lastCalculationResults) {
            showAlert('Beräkna optimal kapning först', 'error');
            return;
        }

        console.log('🛒 Print shopping list called with results:', this.lastCalculationResults);
        
        try {
            const shoppingList = this.generateShoppingList();
            console.log('✅ Generated shopping list HTML:', shoppingList.substring(0, 200));
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showAlert('Popup blockad av webbläsaren. Tillåt popups för denna sida.', 'error');
                return;
            }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Inköpslista - Virke</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${shoppingList}
                <div class="footer">
                    <p>Genererad av Smart Virke- och Kapningsberäknare - ${new Date().toLocaleDateString('sv-SE')}</p>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
            printWindow.document.close();
        } catch (error) {
            console.error('❌ Error generating shopping list:', error);
            showAlert('Fel vid generering av inköpslista: ' + error.message, 'error');
        }
    }

    /**
     * Print cutting guide
     */
    printCuttingGuide() {
        if (!this.lastCalculationResults) {
            showAlert('Beräkna optimal kapning först', 'error');
            return;
        }

        console.log('✂️ Print cutting guide called with results:', this.lastCalculationResults);
        
        try {
            const cuttingGuide = this.generateCuttingGuide();
            console.log('✅ Generated cutting guide HTML:', cuttingGuide.substring(0, 200));
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showAlert('Popup blockad av webbläsaren. Tillåt popups för denna sida.', 'error');
                return;
            }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Kapguide - Virke</title>
                <style>
                    :root {
                        --primary: #18181b;
                        --primary-light: #27272a;
                        --secondary: #71717a;
                        --light-grey: #fafafa;
                        --accent: #f97316;
                        --error: #ef4444;
                    }
                    
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h2 { color: var(--accent); margin-top: 30px; }
                    
                    /* Compact material sections */
                    .material-section { margin: 20px 0; page-break-inside: avoid; }
                    .material-section h2 { color: var(--accent); margin: 0 0 15px 0; padding: 8px 0; border-bottom: 2px solid var(--accent); font-size: 18px; }
                    
                    /* Compact pattern cards */
                    .compact-pattern { margin: 15px 0; padding: 12px; border: 1px solid #ddd; border-radius: 6px; background: #fff; page-break-inside: avoid; }
                    .pattern-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                    .pattern-header h3 { margin: 0; font-size: 14px; color: var(--primary); }
                    .piece-count { background: var(--accent); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
                    
                    /* Compact piece list */
                    .piece-list { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
                    .piece { background: var(--primary); color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 500; }
                    .waste { background: var(--error); color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 500; }
                    
                    /* Plank visualization styles */
                    .planka { border-radius: 4px; margin-bottom: 15px; position: relative; background-color: #f5f5f5; border: 1px solid #ddd; overflow: hidden; }
                    .planka-info { background: var(--secondary); color: white; padding: 4px 8px; font-size: 12px; position: absolute; top: 0; right: 0; border-bottom-left-radius: 4px; }
                    .planka-segments { display: flex; height: 50px; align-items: stretch; }
                    .segment { height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 0 3px; min-width: 30px; position: relative; border-right: 1px solid rgba(255, 255, 255, 0.2); }
                    .segment:last-child { border-right: none; }
                    .segment.virke { background-color: var(--primary); }
                    .segment.spill { background-color: var(--error); }
                    .segment.waste { background-color: #f44336; }
                    
                    /* Cut line styles */
                    .cut-line { width: 2px; height: 100%; background-color: #dc2626; position: relative; flex-shrink: 0; box-shadow: 0 0 3px rgba(220, 38, 38, 0.5); }
                    .cut-line::before { content: '✂'; position: absolute; top: -8px; left: -6px; font-size: 12px; color: #dc2626; }
                    
                    
                    .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${cuttingGuide}
                <div class="footer">
                    <p>Genererad av Smart Virke- och Kapningsberäknare - ${new Date().toLocaleDateString('sv-SE')}</p>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
            printWindow.document.close();
        } catch (error) {
            console.error('❌ Error generating cutting guide:', error);
            showAlert('Fel vid generering av kapguide: ' + error.message, 'error');
        }
    }

    /**
     * Generate shopping list HTML
     */
    generateShoppingList() {
        const results = this.lastCalculationResults;
        let html = '<h1>📋 Inköpslista</h1>';
        
        // Calculate efficiency
        const totalUsedLength = results.totalLangd - results.totalSpill;
        const efficiency = (totalUsedLength / results.totalLangd) * 100;
        
        // Summary
        html += '<div class="summary">';
        html += '<h3>Sammanfattning</h3>';
        html += `<p><strong>Total kostnad:</strong> ${results.totalKostnad.toFixed(2).replace('.', ',')} kr</p>`;
        html += `<p><strong>Totalt spill:</strong> ${(results.totalSpill / 1000).toFixed(2).replace('.', ',')} m</p>`;
        html += `<p><strong>Utnyttjande:</strong> ${efficiency.toFixed(1)}%</p>`;
        html += `<p><strong>Antal plankor:</strong> ${results.totalPlankor} st</p>`;
        html += '</div>';

        // Shopping list by dimension
        html += '<h3>Att köpa:</h3>';
        html += '<table>';
        html += '<thead><tr><th>Dimension</th><th>Längd</th><th>Antal plankor</th><th>Pris/m</th><th>Total kostnad</th></tr></thead>';
        html += '<tbody>';
        
        Object.entries(results.dimensionResults).forEach(([dimension, result]) => {
            if (!result.error && result.plankor) {
                // Group by length
                const byLength = {};
                result.plankor.forEach(planka => {
                    const langd = result.lagerLangd;
                    if (!byLength[langd]) {
                        byLength[langd] = { count: 0, price: result.lagerPris || 25 };
                    }
                    byLength[langd].count++;
                });
                
                Object.entries(byLength).forEach(([langd, info]) => {
                    const totalCost = (info.count * (langd / 1000) * info.price);
                    html += `<tr>`;
                    html += `<td>${dimension}</td>`;
                    html += `<td>${langd} mm</td>`;
                    html += `<td>${info.count} st</td>`;
                    html += `<td>${info.price.toFixed(2).replace('.', ',')} kr/m</td>`;
                    html += `<td>${totalCost.toFixed(2).replace('.', ',')} kr</td>`;
                    html += `</tr>`;
                });
            }
        });
        
        html += '</tbody></table>';
        return html;
    }

    /**
     * Generate compact cutting guide HTML for printing
     */
    generateCuttingGuide() {
        const results = this.lastCalculationResults;
        let html = '<h1>✂️ Kapguide</h1>';
        
        Object.entries(results.dimensionResults).forEach(([dimension, result]) => {
            if (!result.error && result.plankor) {
                // Compact header with essential info
                html += `<div class="material-section">`;
                html += `<h2>${dimension} - ${result.lagerLangd} mm</h2>`;
                
                // Group identical cutting patterns
                const uniquePatterns = new Map();
                
                result.plankor.forEach((planka, index) => {
                    // Create a signature for this cutting pattern
                    const signature = planka.map(bit => {
                        const artikel = this.artiklar.find(a => a.id === bit.artikelId);
                        return `${bit.langd}-${artikel ? artikel.namn : 'unknown'}`;
                    }).join('|');
                    
                    if (uniquePatterns.has(signature)) {
                        uniquePatterns.get(signature).count++;
                    } else {
                        uniquePatterns.set(signature, {
                            planka: planka,
                            count: 1,
                            waste: result.lagerLangd - planka.reduce((sum, bit) => sum + bit.langd, 0)
                        });
                    }
                });
                
                // Compact pattern cards
                let patternIndex = 1;
                uniquePatterns.forEach((pattern, signature) => {
                    html += `<div class="compact-pattern">`;
                    
                    // Pattern header with count
                    html += `<div class="pattern-header">`;
                    html += `<h3>Mönster ${patternIndex}</h3>`;
                    html += `<div class="piece-count">${pattern.count} st</div>`;
                    html += `</div>`;
                    
                    // Compact visualization
                    html += UIComponents.renderPlankaVisualization(pattern.planka, result.lagerLangd, patternIndex - 1, this.artiklar);
                    
                    // Simple piece list
                    html += `<div class="piece-list">`;
                    pattern.planka.forEach((bit, bitIndex) => {
                        const artikel = this.artiklar.find(a => a.id === bit.artikelId);
                        const originalLength = artikel ? artikel.originalLangd || bit.langd : bit.langd;
                        html += `<span class="piece">${originalLength}mm</span>`;
                    });
                    if (pattern.waste > 0) {
                        html += `<span class="waste">Spill: ${pattern.waste}mm</span>`;
                    }
                    html += `</div>`;
                    
                    html += `</div>`;
                    patternIndex++;
                });
                
                html += `</div>`;
            }
        });
        
        return html;
    }
}
