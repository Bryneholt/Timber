// Configuration and default data for the Timber Calculator

export const CONFIG = {
    // Standard dimensions available in the dropdown (legacy - now handled by companies)
    STANDARD_DIMENSIONS: [
        { value: '45x45', label: '45x45 mm' },
        { value: '45x70', label: '45x70 mm' },
        { value: '45x95', label: '45x95 mm' },
        { value: '45x120', label: '45x120 mm' },
        { value: '45x145', label: '45x145 mm' },
        { value: '45x170', label: '45x170 mm' },
        { value: '45x195', label: '45x195 mm' },
        { value: '70x70', label: '70x70 mm' },
        { value: '70x145', label: '70x145 mm' },
        { value: '95x95', label: '95x95 mm' }
    ],

    // Common stock lengths
    STANDARD_LENGTHS: [2400, 3000, 3600, 4200, 4800, 5400],

    // Default pricing per meter for different dimensions
    DEFAULT_PRICING: {
        '45x45': 18.5,
        '45x70': 21.0,
        '45x95': 23.5,
        '45x120': 27.0,
        '45x145': 32.5,
        '45x170': 38.0,
        '45x195': 46.0,
        '70x70': 36.0,
        '70x145': 58.0,
        '95x95': 69.0
    },

    // Optimization strategies
    OPTIMIZATION_STRATEGIES: [
        { value: 'minimizeWaste', label: 'Minimera spill' },
        { value: 'minimizeCost', label: 'Minimera kostnad' },
        { value: 'minimizePlanks', label: 'Minimera antal plankor' }
    ],

    // Local storage keys
    STORAGE_KEYS: {
        APP_DATA: 'virke-app-data',
        PROJECTS: 'virke-projekt'
    },

    // Tab configuration
    TABS: [
        { id: 'artiklar', label: 'Artiklar' },
        { id: 'lager', label: 'Lagerlängder' },
        { id: 'resultat', label: 'Resultat' },
        { id: 'projekt', label: 'Spara/Ladda Projekt' }
    ]
};

// Default project template
export const DEFAULT_PROJECT = {
    artiklar: [],
    lagerLangder: {},
    lastId: 0
};

// Validation rules
export const VALIDATION = {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10000,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 1000,
    MIN_PRICE: 0,
    MAX_PRICE: 1000
};

// Error messages
export const MESSAGES = {
    ERRORS: {
        REQUIRED_FIELDS: 'Vänligen fyll i alla fält korrekt.',
        INVALID_LENGTH: 'Längden måste vara mellan 1 och 10000 mm.',
        INVALID_QUANTITY: 'Antalet måste vara mellan 1 och 1000.',
        INVALID_PRICE: 'Priset måste vara mellan 0 och 1000 kr/m.',
        NO_ARTICLES: 'Lägg till minst en artikel först.',
        NO_STOCK_LENGTHS: 'Inga lagerlängder definierade för denna dimension.',
        PROJECT_NAME_REQUIRED: 'Vänligen ange ett projektnamn.',
        INVALID_PROJECT_FILE: 'Ogiltig projektfil.',
        FILE_REQUIRED: 'Vänligen välj en fil först.'
    },
    SUCCESS: {
        ARTICLE_ADDED: 'Artikel tillagd.',
        ARTICLE_UPDATED: 'Artikel uppdaterad.',
        ARTICLE_DELETED: 'Artikel borttagen.',
        PROJECT_SAVED: 'Projekt sparat.',
        PROJECT_LOADED: 'Projekt laddat.',
        PROJECT_DELETED: 'Projekt borttaget.',
        PROJECT_IMPORTED: 'Projekt importerat.'
    },
    CONFIRMATIONS: {
        DELETE_ARTICLE: 'Är du säker på att du vill ta bort denna artikel?',
        DELETE_STOCK_LENGTH: 'Är du säker på att du vill ta bort denna lagerlängd?',
        DELETE_PROJECT: 'Är du säker på att du vill ta bort detta projekt?',
        LOAD_PROJECT: 'Vill du ladda detta projekt? Nuvarande projekt kommer att ersättas.',
        REPLACE_PROJECT: 'Projekt med samma namn finns redan. Vill du ersätta det?',
        IMPORT_PROJECT: 'Vill du importera detta projekt? Nuvarande projekt kommer att ersättas.'
    }
};
