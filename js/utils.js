// Utility functions for the Timber Calculator

import { VALIDATION, MESSAGES } from '../data/config.js';

/**
 * Generate a unique ID for articles
 * @param {number} lastId - The last used ID
 * @returns {number} - New unique ID
 */
export function generateId(lastId = 0) {
    return lastId + 1;
}

/**
 * Extract dimension from article name
 * @param {string} namn - Article name
 * @returns {string} - Extracted dimension
 */
export function getDimensionFromArtikelnamn(namn) {
    const dimensionMatch = namn.match(/(\d+)x(\d+)/);
    if (dimensionMatch) {
        return `${dimensionMatch[1]}x${dimensionMatch[2]}`;
    }
    return namn;
}

/**
 * Format price with Swedish locale
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
export function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',') + ' kr';
}

/**
 * Format length with appropriate units
 * @param {number} length - Length in mm
 * @returns {string} - Formatted length
 */
export function formatLength(length) {
    if (length >= 1000) {
        return (length / 1000).toFixed(2).replace('.', ',') + ' m';
    }
    return length + ' mm';
}

/**
 * Format percentage with Swedish locale
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {string} - Formatted percentage
 */
export function formatPercentage(value, total) {
    if (total === 0) return '0,0%';
    const percentage = (value / total) * 100;
    return percentage.toFixed(1).replace('.', ',') + '%';
}

/**
 * Validate article data
 * @param {Object} artikel - Article data to validate
 * @returns {Object} - Validation result
 */
export function validateArtikel(artikel) {
    const errors = [];

    if (!artikel.namn || artikel.namn.trim() === '') {
        errors.push('Artikelnamn är obligatoriskt');
    }

    if (!artikel.antal || isNaN(artikel.antal) || artikel.antal < VALIDATION.MIN_QUANTITY || artikel.antal > VALIDATION.MAX_QUANTITY) {
        errors.push(MESSAGES.ERRORS.INVALID_QUANTITY);
    }

    if (!artikel.langd || isNaN(artikel.langd) || artikel.langd < VALIDATION.MIN_LENGTH || artikel.langd > VALIDATION.MAX_LENGTH) {
        errors.push(MESSAGES.ERRORS.INVALID_LENGTH);
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate stock length data
 * @param {Object} lagerLangd - Stock length data to validate
 * @returns {Object} - Validation result
 */
export function validateLagerLangd(lagerLangd) {
    const errors = [];

    if (!lagerLangd.dimension || lagerLangd.dimension.trim() === '') {
        errors.push('Dimension är obligatoriskt');
    }

    if (!lagerLangd.langd || isNaN(lagerLangd.langd) || lagerLangd.langd < VALIDATION.MIN_LENGTH || lagerLangd.langd > VALIDATION.MAX_LENGTH) {
        errors.push(MESSAGES.ERRORS.INVALID_LENGTH);
    }

    if (lagerLangd.pris === undefined || isNaN(lagerLangd.pris) || lagerLangd.pris < VALIDATION.MIN_PRICE || lagerLangd.pris > VALIDATION.MAX_PRICE) {
        errors.push(MESSAGES.ERRORS.INVALID_PRICE);
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Calculate total length for an article
 * @param {Object} artikel - Article object
 * @returns {number} - Total length in mm
 */
export function calculateTotalLength(artikel) {
    return artikel.antal * artikel.langd;
}

/**
 * Calculate total cost for stock lengths
 * @param {Array} plankor - Array of planks
 * @param {number} lagerLangd - Stock length in mm
 * @param {number} lagerPris - Price per meter
 * @returns {number} - Total cost
 */
export function calculateTotalCost(plankor, lagerLangd, lagerPris) {
    return plankor.length * (lagerLangd / 1000) * lagerPris;
}

/**
 * Calculate total waste
 * @param {Array} plankor - Array of planks
 * @param {number} lagerLangd - Stock length in mm
 * @returns {number} - Total waste in mm
 */
export function calculateTotalWaste(plankor, lagerLangd) {
    let totalWaste = 0;
    
    plankor.forEach(planka => {
        const usedLength = planka.reduce((sum, bit) => sum + bit.langd, 0);
        totalWaste += lagerLangd - usedLength;
    });
    
    return totalWaste;
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} - Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show alert with custom styling
 * @param {string} message - Message to show
 * @param {string} type - Alert type (success, error, warning, info)
 */
export function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

/**
 * Confirm dialog with custom styling
 * @param {string} message - Message to show
 * @returns {Promise<boolean>} - User's choice
 */
export function confirmDialog(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Bekräfta</h3>
                </div>
                <div style="padding: 20px;">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="secondary" id="cancel-btn">Avbryt</button>
                    <button id="confirm-btn">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const confirmBtn = modal.querySelector('#confirm-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');
        
        const cleanup = () => {
            document.body.removeChild(modal);
        };
        
        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
                resolve(false);
            }
        });
    });
}
