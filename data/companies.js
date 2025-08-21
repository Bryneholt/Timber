// Company and material category configurations

export const COMPANIES = {
    HORNBACH: {
        id: 'hornbach',
        name: 'Hornbach',
        baseUrl: 'https://www.hornbach.se',
        logo: '🏠', // You can replace with actual logo URLs later
        categories: {
            virke: {
                name: 'Virke',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/S16705/',
                description: 'Standard virke'
            },
            tryckimpregnerat: {
                name: 'Tryckimpregnerat',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/tryckimpregnerat/S16706/',
                description: 'Tryckimpregnerat virke'
            },
            reglar: {
                name: 'Reglar',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/reglar/S16707/',
                description: 'Takreglar och stolpar'
            },
            lakt: {
                name: 'Läkt',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/lakt/S16708/',
                description: 'Läkt och list'
            },
            raspont: {
                name: 'Råspont',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/råspont/S16709/',
                description: 'Råspont och panel'
            },
            planhyvlat: {
                name: 'Planhyvlat',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/planhyvlat/S16710/',
                description: 'Planhyvlat virke'
            },
            ytterpanel: {
                name: 'Ytterpanel',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/ytterpanel/S16712/',
                description: 'Ytterpanel och fasadmaterial'
            },
            glespanel: {
                name: 'Glespanel',
                url: 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/glespanel/S16723/',
                description: 'Glespanel och staket'
            }
        }
    },
    BAUHAUS: {
        id: 'bauhaus',
        name: 'Bauhaus',
        baseUrl: 'https://www.bauhaus.se',
        logo: '🔨',
        categories: {
            virke: {
                name: 'Virke',
                url: 'https://www.bauhaus.se/byggmaterial/virke',
                description: 'Standard virke'
            },
            reglar: {
                name: 'Reglar',
                url: 'https://www.bauhaus.se/byggmaterial/virke/reglar',
                description: 'Takreglar och stolpar'
            },
            lakt: {
                name: 'Läkt',
                url: 'https://www.bauhaus.se/byggmaterial/virke/lakt',
                description: 'Läkt och list'
            },
            panel: {
                name: 'Panel',
                url: 'https://www.bauhaus.se/byggmaterial/virke/panel',
                description: 'Panel och spånskiva'
            }
        }
    },
    BYGGMAX: {
        id: 'byggmax',
        name: 'Byggmax',
        baseUrl: 'https://www.byggmax.se',
        logo: '🏗️',
        categories: {
            virke: {
                name: 'Virke',
                url: 'https://www.byggmax.se/byggmaterial/virke',
                description: 'Standard virke'
            },
            reglar: {
                name: 'Reglar',
                url: 'https://www.byggmax.se/byggmaterial/virke/reglar',
                description: 'Takreglar och stolpar'
            },
            lakt: {
                name: 'Läkt',
                url: 'https://www.byggmax.se/byggmaterial/virke/lakt',
                description: 'Läkt och list'
            },
            panel: {
                name: 'Panel',
                url: 'https://www.byggmax.se/byggmaterial/virke/panel',
                description: 'Panel och spånskiva'
            }
        }
    }
};

// Default company selection
export const DEFAULT_COMPANY = 'hornbach';

// Company-specific pricing adjustments (multipliers)
export const COMPANY_PRICING = {
    hornbach: 1.0,    // Base price
    bauhaus: 1.1,     // 10% more expensive
    byggmax: 0.98     // 2% cheaper
};

// Material category descriptions
export const MATERIAL_DESCRIPTIONS = {
    virke: 'Standard virke för allmänna byggprojekt',
    tryckimpregnerat: 'Tryckimpregnerat virke för utomhusbruk',
    reglar: 'Takreglar, stolpar och bjälkar',
    lakt: 'Läkt, list och trim',
    raspont: 'Råspont och panel för inredning',
    planhyvlat: 'Planhyvlat virke för finare arbete',
    ytterpanel: 'Ytterpanel och fasadmaterial',
    glespanel: 'Glespanel för staket och utebyggen',
    panel: 'Panel och spånskiva'
};

// Common dimensions for each category
export const CATEGORY_DIMENSIONS = {
    virke: ['45x45', '45x70', '45x95', '45x120', '45x145', '45x170', '45x195', '70x70', '70x145', '95x95'],
    tryckimpregnerat: ['45x45', '45x70', '45x95', '45x120', '45x145', '45x170', '45x195'],
    reglar: ['45x70', '45x95', '45x120', '45x145', '45x170', '45x195', '70x70', '70x145'],
    lakt: ['19x19', '19x38', '19x58', '38x38', '38x58'],
    raspont: ['12x95', '12x120', '12x145', '19x95', '19x120', '19x145'],
    planhyvlat: ['19x95', '19x120', '19x145', '19x170', '19x195'],
    ytterpanel: ['19x95', '19x120', '19x145', '19x170', '19x195'],
    glespanel: ['19x95', '19x120', '19x145', '19x170', '19x195'],
    panel: ['12x600', '16x600', '18x600', '22x600']
};
