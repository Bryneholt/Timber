// Cutting optimization algorithms for the Timber Calculator

import { calculateTotalCost, calculateTotalWaste } from './utils.js';

/**
 * Optimize cutting for a given set of required lengths
 * @param {Array} behovdaLangder - Array of required lengths with article info
 * @param {number} lagerLangd - Available stock length in mm
 * @param {number} lagerPris - Price per meter for stock length
 * @param {string} metod - Optimization method
 * @returns {Object} - Optimization result
 */
export function optimerKapning(behovdaLangder, lagerLangd, lagerPris, metod) {
    // Copy required lengths to avoid modifying original
    const langder = [...behovdaLangder];
    const plankor = [];
    let totalKostnad = 0;
    let totalLangd = 0;
    let totalSpill = 0;
    
    // First-Fit Decreasing algorithm
    while (langder.length > 0) {
        const nyPlanka = [];
        let aterstaendeLangd = lagerLangd;
        
        // Try to fill the plank with as many pieces as possible
        let i = 0;
        while (i < langder.length) {
            if (langder[i].langd <= aterstaendeLangd) {
                nyPlanka.push(langder[i]);
                aterstaendeLangd -= langder[i].langd;
                langder.splice(i, 1);
            } else {
                i++;
            }
        }
        
        // Add plank and update statistics
        plankor.push(nyPlanka);
        totalLangd += lagerLangd;
        totalSpill += aterstaendeLangd;
        totalKostnad += (lagerLangd / 1000) * lagerPris;
    }
    
    return {
        plankor: plankor,
        totalLangd: totalLangd,
        totalSpill: totalSpill,
        totalKostnad: totalKostnad
    };
}

/**
 * Find the best cutting solution for multiple stock lengths
 * @param {Array} behovdaLangder - Array of required lengths
 * @param {Array} lagerLangder - Array of available stock lengths with prices
 * @param {string} metod - Optimization method
 * @returns {Object} - Best cutting solution
 */
export function findBestCuttingSolution(behovdaLangder, lagerLangder, metod) {
    const resultatPerLagerLangd = [];
    
    // Try optimization for each stock length
    lagerLangder.forEach(lager => {
        const resultat = optimerKapning(behovdaLangder, lager.langd, lager.pris, metod);
        resultatPerLagerLangd.push({
            lagerLangd: lager.langd,
            lagerPris: lager.pris,
            ...resultat
        });
    });
    
    // Sort results based on optimization method
    resultatPerLagerLangd.sort((a, b) => {
        if (metod === 'minimizeWaste') {
            return a.totalSpill - b.totalSpill;
        } else if (metod === 'minimizeCost') {
            return a.totalKostnad - b.totalKostnad;
        } else { // minimizePlanks
            return a.plankor.length - b.plankor.length;
        }
    });
    
    return resultatPerLagerLangd[0] || null;
}

/**
 * Calculate cutting statistics for all dimensions
 * @param {Array} artiklar - Array of articles
 * @param {Object} lagerLangder - Stock lengths per dimension
 * @param {string} optimeringsMetod - Optimization method
 * @returns {Object} - Overall statistics
 */
export function calculateOverallStatistics(artiklar, lagerLangder, optimeringsMetod) {
    // Group articles by dimension
    const artiklarPerDimension = {};
    
    artiklar.forEach(artikel => {
        if (!artiklarPerDimension[artikel.dimension]) {
            artiklarPerDimension[artikel.dimension] = [];
        }
        artiklarPerDimension[artikel.dimension].push(artikel);
    });
    
    let totalPlankor = 0;
    let totalKostnad = 0;
    let totalLangd = 0;
    let totalSpill = 0;
    const dimensionResults = {};
    
    // Calculate for each dimension
    Object.keys(artiklarPerDimension).forEach(dimension => {
        const artiklar = artiklarPerDimension[dimension];
        
        // Check if stock lengths exist for this dimension
        if (!lagerLangder[dimension] || lagerLangder[dimension].length === 0) {
            dimensionResults[dimension] = {
                error: 'Inga lagerlängder definierade för denna dimension'
            };
            return;
        }
        
        // Collect all required lengths (with quantities)
        const behovdaLangder = [];
        artiklar.forEach(artikel => {
            for (let i = 0; i < artikel.antal; i++) {
                behovdaLangder.push({
                    artikelId: artikel.id,
                    namn: artikel.namn,
                    langd: artikel.langd
                });
            }
        });
        
        // Sort required lengths by length (descending)
        behovdaLangder.sort((a, b) => b.langd - a.langd);
        
        // Find best cutting solution
        const bestSolution = findBestCuttingSolution(behovdaLangder, lagerLangder[dimension], optimeringsMetod);
        
        if (!bestSolution) {
            dimensionResults[dimension] = {
                error: 'Ingen lagerlängd är tillräckligt lång för att rymma artiklar'
            };
            return;
        }
        
        // Update totals
        totalPlankor += bestSolution.plankor.length;
        totalKostnad += bestSolution.totalKostnad;
        totalLangd += bestSolution.totalLangd;
        totalSpill += bestSolution.totalSpill;
        
        dimensionResults[dimension] = {
            ...bestSolution,
            artiklar: artiklar,
            behovdaLangder: behovdaLangder
        };
    });
    
    return {
        totalPlankor,
        totalKostnad,
        totalLangd,
        totalSpill,
        dimensionResults
    };
}

/**
 * Validate if all required lengths can fit in available stock lengths
 * @param {Array} behovdaLangder - Required lengths
 * @param {Array} lagerLangder - Available stock lengths
 * @returns {boolean} - Whether all lengths can be accommodated
 */
export function validateCuttingPossibility(behovdaLangder, lagerLangder) {
    if (behovdaLangder.length === 0 || lagerLangder.length === 0) {
        return false;
    }
    
    // Find the longest required length
    const maxRequiredLength = Math.max(...behovdaLangder.map(l => l.langd));
    
    // Find the longest available stock length
    const maxStockLength = Math.max(...lagerLangder.map(l => l.langd));
    
    return maxRequiredLength <= maxStockLength;
}

/**
 * Calculate efficiency metrics for a cutting solution
 * @param {Object} solution - Cutting solution
 * @returns {Object} - Efficiency metrics
 */
export function calculateEfficiencyMetrics(solution) {
    const totalUsedLength = solution.totalLangd - solution.totalSpill;
    const efficiency = totalUsedLength / solution.totalLangd;
    const wastePercentage = (solution.totalSpill / solution.totalLangd) * 100;
    
    return {
        efficiency: efficiency,
        wastePercentage: wastePercentage,
        totalUsedLength: totalUsedLength,
        averageWastePerPlank: solution.totalSpill / solution.plankor.length
    };
}
