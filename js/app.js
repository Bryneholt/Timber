// Main application class for the Timber Calculator

import { CONFIG, MESSAGES } from '../data/config.js';
import { generateId, getDimensionFromArtikelnamn, validateArtikel, validateLagerLangd, showAlert, confirmDialog } from './utils.js';
import { calculateOverallStatistics } from './optimizer.js';
import { StorageService } from './storage.js';
import { UIComponents } from '../components/UIComponents.js';

/**
 * Main application class
 */
export class TimberCalculator {
    constructor() {
        this.artiklar = [];
        this.lagerLangder = {};
        this.lastId = 0;
        this.currentDimension = '';
        
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
        
        const artikel = { namn, antal, langd };
        const validation = validateArtikel(artikel);
        
        if (!validation.isValid) {
            showAlert(validation.errors.join(', '), 'error');
            return;
        }
        
        const dimension = getDimensionFromArtikelnamn(namn);
        
        const newArtikel = {
            id: generateId(this.lastId),
            namn: namn,
            dimension: dimension,
            antal: antal,
            langd: langd
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
        document.getElementById('dimension-select').selectedIndex = 0;
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
        document.getElementById('edit-langd').value = artikel.langd;
        
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
        
        const artikel = { namn, antal, langd };
        const validation = validateArtikel(artikel);
        
        if (!validation.isValid) {
            showAlert(validation.errors.join(', '), 'error');
            return;
        }
        
        const index = this.artiklar.findIndex(a => a.id === id);
        if (index !== -1) {
            const dimension = getDimensionFromArtikelnamn(namn);
            
            this.artiklar[index] = {
                id: id,
                namn: namn,
                dimension: dimension,
                antal: antal,
                langd: langd
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
}
