// Company and Material Category Selector Component

import { COMPANIES, CATEGORY_DIMENSIONS, MATERIAL_DESCRIPTIONS } from '../data/companies.js';

export class CompanySelector {
    /**
     * Render company selection dropdown
     * @param {string} selectedCompany - Currently selected company
     * @param {Function} onChange - Callback when company changes
     * @returns {string} - HTML string for company selector
     */
    static renderCompanySelector(selectedCompany, onChange) {
        let html = `
            <div class="form-group">
                <label for="company-select">Välj företag:</label>
                <select id="company-select" class="company-select">
        `;
        
        Object.values(COMPANIES).forEach(company => {
            const selected = company.id === selectedCompany ? 'selected' : '';
            html += `
                <option value="${company.id}" ${selected}>
                    ${company.logo} ${company.name}
                </option>
            `;
        });
        
        html += `
                </select>
            </div>
        `;
        
        return html;
    }

    /**
     * Render material category selector
     * @param {string} selectedCompany - Selected company
     * @param {string} selectedCategory - Selected category
     * @param {Function} onChange - Callback when category changes
     * @returns {string} - HTML string for category selector
     */
    static renderCategorySelector(selectedCompany, selectedCategory, onChange) {
        const company = COMPANIES[selectedCompany.toUpperCase()];
        if (!company) return '';

        let html = `
            <div class="form-group">
                <label for="category-select">Materialkategori:</label>
                <select id="category-select" class="category-select">
                    <option value="">Välj kategori...</option>
        `;
        
        Object.entries(company.categories).forEach(([key, category]) => {
            const selected = key === selectedCategory ? 'selected' : '';
            html += `
                <option value="${key}" ${selected}>
                    ${category.name}
                </option>
            `;
        });
        
        html += `
                </select>
                <div id="category-description" class="category-description"></div>
            </div>
        `;
        
        return html;
    }

    /**
     * Render dimension selector based on category
     * @param {string} selectedCompany - Selected company
     * @param {string} selectedCategory - Selected category
     * @param {string} selectedDimension - Selected dimension
     * @param {Function} onChange - Callback when dimension changes
     * @returns {string} - HTML string for dimension selector
     */
    static renderDimensionSelector(selectedCompany, selectedCategory, selectedDimension, onChange) {
        if (!selectedCategory) return '';

        const dimensions = CATEGORY_DIMENSIONS[selectedCategory] || [];
        
        let html = `
            <div class="form-group">
                <label for="dimension-select">Standarddimension:</label>
                <select id="dimension-select" class="dimension-select">
                    <option value="">Anpassad dimension...</option>
        `;
        
        dimensions.forEach(dimension => {
            const selected = dimension === selectedDimension ? 'selected' : '';
            html += `
                <option value="${dimension}" ${selected}>
                    ${dimension} mm
                </option>
            `;
        });
        
        html += `
                </select>
            </div>
        `;
        
        return html;
    }

    /**
     * Render company info and links
     * @param {string} selectedCompany - Selected company
     * @param {string} selectedCategory - Selected category
     * @returns {string} - HTML string for company info
     */
    static renderCompanyInfo(selectedCompany, selectedCategory) {
        const company = COMPANIES[selectedCompany.toUpperCase()];
        if (!company) return '';

        const category = company.categories[selectedCategory];
        
        let html = `
            <div class="company-info">
                <div class="company-header">
                    <span class="company-logo">${company.logo}</span>
                    <span class="company-name">${company.name}</span>
                </div>
        `;
        
        if (category) {
            html += `
                <div class="category-info">
                    <p><strong>${category.name}</strong></p>
                    <p>${category.description}</p>
                    <a href="${category.url}" target="_blank" class="company-link">
                        <i class="fas fa-external-link-alt"></i> Besök ${company.name}
                    </a>
                </div>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }

    /**
     * Render price comparison between companies
     * @param {Object} prices - Prices for each company
     * @returns {string} - HTML string for price comparison
     */
    static renderPriceComparison(prices) {
        if (!prices || Object.keys(prices).length === 0) return '';

        let html = `
            <div class="price-comparison">
                <h4>Prisjämförelse</h4>
                <div class="price-grid">
        `;
        
        Object.entries(prices).forEach(([companyId, price]) => {
            const company = COMPANIES[companyId.toUpperCase()];
            if (!company) return;
            
            html += `
                <div class="price-item">
                    <div class="price-company">
                        <span class="company-logo">${company.logo}</span>
                        <span class="company-name">${company.name}</span>
                    </div>
                    <div class="price-value">${price}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Get available dimensions for a category
     * @param {string} category - Material category
     * @returns {Array} - Array of available dimensions
     */
    static getDimensionsForCategory(category) {
        return CATEGORY_DIMENSIONS[category] || [];
    }

    /**
     * Get company by ID
     * @param {string} companyId - Company ID
     * @returns {Object|null} - Company object or null
     */
    static getCompany(companyId) {
        return COMPANIES[companyId.toUpperCase()] || null;
    }

    /**
     * Get category by company and category ID
     * @param {string} companyId - Company ID
     * @param {string} categoryId - Category ID
     * @returns {Object|null} - Category object or null
     */
    static getCategory(companyId, categoryId) {
        const company = this.getCompany(companyId);
        return company ? company.categories[categoryId] || null : null;
    }

    /**
     * Get all available companies
     * @returns {Array} - Array of company objects
     */
    static getAllCompanies() {
        return Object.values(COMPANIES);
    }

    /**
     * Get categories for a company
     * @param {string} companyId - Company ID
     * @returns {Object} - Categories object
     */
    static getCategoriesForCompany(companyId) {
        const company = this.getCompany(companyId);
        return company ? company.categories : {};
    }
}
