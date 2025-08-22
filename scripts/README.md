# Material Scraper

This directory contains Python scripts for scraping material data from Swedish building material companies.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Quick Start

Run the update script to scrape and update material data:
```bash
cd scripts
python update_materials.py
```

### Manual Scraping

Use the scraper directly:
```bash
# Scrape all companies
python scraper.py --company all --js

# Scrape specific company
python scraper.py --company hornbach --js

# Scrape specific company and category
python scraper.py --company hornbach --category virke --js
```

### Options

- `--company` or `-c`: Company to scrape (hornbach, bauhaus, byggmax, all)
- `--category` or `-cat`: Specific category to scrape
- `--output` or `-o`: Output filename for JSON data
- `--js`: Generate JavaScript data file for the application

## Output

The scraper generates:

1. **JSON file**: Raw scraped data with timestamps
2. **JavaScript file**: Formatted data for the application (`data/scraped_materials.js`)

## Supported Companies

### Hornbach
- **URL**: https://www.hornbach.se
- **Categories**: Virke, Tryckimpregnerat, Reglar

### Bauhaus
- **URL**: https://www.bauhaus.se
- **Categories**: Virke, Reglar

### Byggmax
- **URL**: https://www.byggmax.se
- **Categories**: Virke, Reglar

## Data Structure

Scraped materials include:
- **Name**: Product name
- **Price**: Price in SEK
- **Dimension**: Material dimensions (e.g., "45x95")
- **Category**: Material category
- **Company**: Source company
- **Scraped at**: Timestamp

## Integration

The scraped data is automatically integrated into the application:

1. Run the scraper to generate `data/scraped_materials.js`
2. The application will use this data for material selection
3. Users can load materials directly into their stock lengths

## Troubleshooting

### Common Issues

1. **No materials found**: Website structure may have changed
2. **Connection errors**: Check internet connection and website availability
3. **Parsing errors**: Update selectors in `scraper.py`

### Updating Selectors

If websites change their structure, update the selectors in `scraper.py`:

```python
'selectors': {
    'products': '.product-tile, .product-item',  # Product containers
    'name': '.product-name, .product-title',     # Product names
    'price': '.price, .product-price',           # Prices
    'dimension': '.dimension, .size'             # Dimensions
}
```

## Legal Notice

- Respect website terms of service
- Use reasonable request rates
- Only scrape publicly available data
- Consider reaching out to companies for API access

## Automation

For regular updates, consider setting up a cron job:

```bash
# Update materials weekly
0 2 * * 0 cd /path/to/timber/scripts && python update_materials.py
```
