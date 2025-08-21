// Main entry point for the Timber Calculator

import { TimberCalculator } from './app.js';
import { CONFIG } from '../data/config.js';
import { UIComponents } from '../components/UIComponents.js';

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdowns with configuration data
    initializeDropdowns();
    
    // Create and initialize the main application
    window.app = new TimberCalculator();
    
    // Make app methods globally available for onclick handlers
    window.app.editArtikel = window.app.editArtikel.bind(window.app);
    window.app.deleteArtikel = window.app.deleteArtikel.bind(window.app);
    window.app.loadProjekt = window.app.loadProjekt.bind(window.app);
    window.app.deleteProjekt = window.app.deleteProjekt.bind(window.app);
    window.app.deleteLagerLangd = window.app.deleteLagerLangd.bind(window.app);
});

/**
 * Initialize dropdowns with configuration data
 */
function initializeDropdowns() {
    // Initialize standard dimensions dropdown
    const dimensionSelect = document.getElementById('dimension-select');
    if (dimensionSelect) {
        dimensionSelect.innerHTML = UIComponents.renderStandardDimensionsDropdown(CONFIG.STANDARD_DIMENSIONS);
    }
    
    // Initialize optimization strategies dropdown
    const optimizationSelect = document.getElementById('optimization-strategy');
    if (optimizationSelect) {
        optimizationSelect.innerHTML = UIComponents.renderOptimizationStrategiesDropdown(CONFIG.OPTIMIZATION_STRATEGIES);
    }
    
    // Initialize standard length buttons
    const standardLengthsContainer = document.getElementById('standard-lengths-container');
    if (standardLengthsContainer) {
        standardLengthsContainer.innerHTML = UIComponents.renderStandardLengthButtons(CONFIG.STANDARD_LENGTHS);
    }
}
