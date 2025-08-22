// Storage service for the Timber Calculator

import { CONFIG, DEFAULT_PROJECT } from '../data/config.js';
import { deepClone } from './utils.js';

/**
 * Storage service class for handling localStorage operations
 */
export class StorageService {
    /**
     * Save application data to localStorage
     * @param {Object} data - Application data to save
     */
    static saveAppData(data) {
        try {
            const dataToSave = {
                artiklar: data.artiklar || [],
                lagerLangder: data.lagerLangder || {},
                lastId: data.lastId || 0
            };
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.APP_DATA, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving app data:', error);
            throw new Error('Kunde inte spara data till webbläsarens lagring');
        }
    }

    /**
     * Load application data from localStorage
     * @returns {Object} - Loaded application data
     */
    static loadAppData() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEYS.APP_DATA);
            if (savedData) {
                const data = JSON.parse(savedData);
                return {
                    artiklar: data.artiklar || [],
                    lagerLangder: data.lagerLangder || {},
                    lastId: data.lastId || 0
                };
            }
            return deepClone(DEFAULT_PROJECT);
        } catch (error) {
            console.error('Error loading app data:', error);
            return deepClone(DEFAULT_PROJECT);
        }
    }

    /**
     * Save a project to localStorage
     * @param {Object} projekt - Project data to save
     */
    static saveProject(projekt) {
        try {
            if (!projekt.namn || projekt.namn.trim() === '') {
                throw new Error('Projektnamn är obligatoriskt');
            }

            const projectData = {
                namn: projekt.namn.trim(),
                skapad: projekt.skapad || new Date().toISOString(),
                artiklar: projekt.artiklar || [],
                lagerLangder: projekt.lagerLangder || {}
            };

            // Get existing projects
            let sparadeProjekt = this.getProjects();
            
            // Check if project with same name already exists
            const existingIndex = sparadeProjekt.findIndex(p => p.namn === projectData.namn);
            if (existingIndex !== -1) {
                sparadeProjekt[existingIndex] = projectData;
            } else {
                sparadeProjekt.push(projectData);
            }

            localStorage.setItem(CONFIG.STORAGE_KEYS.PROJECTS, JSON.stringify(sparadeProjekt));
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    }

    /**
     * Load a project from localStorage
     * @param {string} projektNamn - Name of the project to load
     * @returns {Object|null} - Loaded project or null if not found
     */
    static loadProject(projektNamn) {
        try {
            const sparadeProjekt = this.getProjects();
            const projekt = sparadeProjekt.find(p => p.namn === projektNamn);
            
            if (projekt) {
                return {
                    artiklar: projekt.artiklar || [],
                    lagerLangder: projekt.lagerLangder || {},
                    lastId: this.calculateLastId(projekt.artiklar || [])
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error loading project:', error);
            throw new Error('Kunde inte ladda projekt');
        }
    }

    /**
     * Get all saved projects
     * @returns {Array} - Array of saved projects
     */
    static getProjects() {
        try {
            const sparadeProjekt = localStorage.getItem(CONFIG.STORAGE_KEYS.PROJECTS);
            return sparadeProjekt ? JSON.parse(sparadeProjekt) : [];
        } catch (error) {
            console.error('Error getting projects:', error);
            return [];
        }
    }

    /**
     * Delete a project from localStorage
     * @param {string} projektNamn - Name of the project to delete
     */
    static deleteProject(projektNamn) {
        try {
            let sparadeProjekt = this.getProjects();
            sparadeProjekt = sparadeProjekt.filter(p => p.namn !== projektNamn);
            localStorage.setItem(CONFIG.STORAGE_KEYS.PROJECTS, JSON.stringify(sparadeProjekt));
        } catch (error) {
            console.error('Error deleting project:', error);
            throw new Error('Kunde inte ta bort projekt');
        }
    }

    /**
     * Export project as JSON file
     * @param {Object} projekt - Project data to export
     * @param {string} projektNamn - Name for the exported file
     */
    static exportProject(projekt, projektNamn) {
        try {
            const projectData = {
                namn: projektNamn || projekt.namn || 'Virke-Projekt',
                skapad: new Date().toISOString(),
                artiklar: projekt.artiklar || [],
                lagerLangder: projekt.lagerLangder || {}
            };

            const json = JSON.stringify(projectData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectData.namn}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting project:', error);
            throw new Error('Kunde inte exportera projekt');
        }
    }

    /**
     * Import project from JSON file
     * @param {File} file - JSON file to import
     * @returns {Object} - Imported project data
     */
    static async importProject(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const projekt = JSON.parse(e.target.result);
                        
                        if (!projekt.artiklar || !projekt.lagerLangder) {
                            throw new Error('Ogiltig projektfil');
                        }
                        
                        const importedData = {
                            artiklar: projekt.artiklar || [],
                            lagerLangder: projekt.lagerLangder || {},
                            lastId: this.calculateLastId(projekt.artiklar || [])
                        };
                        
                        resolve(importedData);
                    } catch (error) {
                        reject(new Error('Kunde inte läsa projektfil: ' + error.message));
                    }
                };
                
                reader.onerror = function() {
                    reject(new Error('Kunde inte läsa filen'));
                };
                
                reader.readAsText(file);
            } catch (error) {
                reject(new Error('Kunde inte importera projekt: ' + error.message));
            }
        });
    }

    /**
     * Calculate the last ID from articles array
     * @param {Array} artiklar - Array of articles
     * @returns {number} - Highest ID found
     */
    static calculateLastId(artiklar) {
        if (!artiklar || artiklar.length === 0) {
            return 0;
        }
        return Math.max(...artiklar.map(artikel => artikel.id || 0));
    }

    /**
     * Clear all stored data
     */
    static clearAllData() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.APP_DATA);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.PROJECTS);
        } catch (error) {
            console.error('Error clearing data:', error);
            throw new Error('Kunde inte rensa data');
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} - Whether localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} - Storage usage data
     */
    static getStorageInfo() {
        try {
            const appData = localStorage.getItem(CONFIG.STORAGE_KEYS.APP_DATA);
            const projects = localStorage.getItem(CONFIG.STORAGE_KEYS.PROJECTS);
            
            return {
                appDataSize: appData ? new Blob([appData]).size : 0,
                projectsSize: projects ? new Blob([projects]).size : 0,
                totalSize: (appData ? new Blob([appData]).size : 0) + (projects ? new Blob([projects]).size : 0),
                available: this.isAvailable()
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return {
                appDataSize: 0,
                projectsSize: 0,
                totalSize: 0,
                available: false
            };
        }
    }
}
