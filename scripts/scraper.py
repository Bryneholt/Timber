#!/usr/bin/env python3
"""
Material Scraper for Timber Calculator
Scrapes material data from Swedish building material companies
"""

import requests
import json
import re
from bs4 import BeautifulSoup
import time
import random
from urllib.parse import urljoin, urlparse
import os
from datetime import datetime
import argparse

class MaterialScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Company configurations
        self.companies = {
            'hornbach': {
                'name': 'Hornbach',
                'base_url': 'https://www.hornbach.se',
                'categories': {
                    'virke': {
                        'name': 'Virke',
                        'url': 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/S16705/',
                        'selectors': {
                            'products': '.product-tile, .product-item, [data-testid="product-tile"]',
                            'name': '.product-name, .product-title, h3, h4',
                            'price': '.price, .product-price, [data-testid="price"]',
                            'dimension': '.dimension, .size, .product-specs'
                        }
                    },
                    'tryckimpregnerat': {
                        'name': 'Tryckimpregnerat',
                        'url': 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/tryckimpregnerat/S16706/',
                        'selectors': {
                            'products': '.product-tile, .product-item, [data-testid="product-tile"]',
                            'name': '.product-name, .product-title, h3, h4',
                            'price': '.price, .product-price, [data-testid="price"]',
                            'dimension': '.dimension, .size, .product-specs'
                        }
                    },
                    'reglar': {
                        'name': 'Reglar',
                        'url': 'https://www.hornbach.se/c/byggmaterial-tra-fonster-dorrar/virke/reglar/S16707/',
                        'selectors': {
                            'products': '.product-tile, .product-item, [data-testid="product-tile"]',
                            'name': '.product-name, .product-title, h3, h4',
                            'price': '.price, .product-price, [data-testid="price"]',
                            'dimension': '.dimension, .size, .product-specs'
                        }
                    }
                }
            },
            'bauhaus': {
                'name': 'Bauhaus',
                'base_url': 'https://www.bauhaus.se',
                'categories': {
                    'virke': {
                        'name': 'Virke',
                        'url': 'https://www.bauhaus.se/byggmaterial/virke',
                        'selectors': {
                            'products': '.product-card, .product-item, .product-tile',
                            'name': '.product-name, .product-title, h3, h4',
                            'price': '.price, .product-price, .current-price',
                            'dimension': '.dimension, .size, .product-specs'
                        }
                    },
                    'reglar': {
                        'name': 'Reglar',
                        'url': 'https://www.bauhaus.se/byggmaterial/virke/reglar',
                        'selectors': {
                            'products': '.product-card, .product-item, .product-tile',
                            'name': '.product-name, .product-title, h3, h4',
                            'price': '.price, .product-price, .current-price',
                            'dimension': '.dimension, .size, .product-specs'
                        }
                    }
                }
            },
            'byggmax': {
                'name': 'Byggmax',
                'base_url': 'https://www.byggmax.se',
                'categories': {
                    'virke': {
                        'name': 'Virke',
                        'url': 'https://www.byggmax.se/byggmaterial/virke',
                        'selectors': {
                            'products': '.product-card, .product-item, .product-tile, .product',
                            'name': '.product-name, .product-title, h3, h4, .name',
                            'price': '.price, .product-price, .current-price, .cost',
                            'dimension': '.dimension, .size, .product-specs, .specs'
                        }
                    },
                    'reglar': {
                        'name': 'Reglar',
                        'url': 'https://www.byggmax.se/byggmaterial/virke/reglar',
                        'selectors': {
                            'products': '.product-card, .product-item, .product-tile, .product',
                            'name': '.product-name, .product-title, h3, h4, .name',
                            'price': '.price, .product-price, .current-price, .cost',
                            'dimension': '.dimension, .size, .product-specs, .specs'
                        }
                    }
                }
            }
        }

    def scrape_company(self, company_id, category_id=None):
        """Scrape materials from a specific company and category"""
        if company_id not in self.companies:
            raise ValueError(f"Company {company_id} not found")
        
        company = self.companies[company_id]
        results = []
        
        categories = company['categories']
        if category_id:
            if category_id not in categories:
                raise ValueError(f"Category {category_id} not found for company {company_id}")
            categories = {category_id: categories[category_id]}
        
        for cat_id, category in categories.items():
            print(f"Scraping {company['name']} - {category['name']}...")
            
            try:
                materials = self.scrape_category(company_id, cat_id, category)
                results.extend(materials)
                
                # Be nice to the server
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                print(f"Error scraping {category['name']}: {e}")
                continue
        
        return results

    def scrape_category(self, company_id, category_id, category):
        """Scrape materials from a specific category"""
        url = category['url']
        selectors = category['selectors']
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            materials = []
            
            # Special handling for Hornbach (JSON data)
            if company_id == 'hornbach':
                materials = self.parse_hornbach_json(soup, category_id)
            else:
                # Standard HTML parsing for other companies
                product_selectors = selectors['products'].split(', ')
                products = []
                
                for selector in product_selectors:
                    products = soup.select(selector)
                    if products:
                        break
                
                print(f"Found {len(products)} products")
                
                for product in products:
                    try:
                        material = self.extract_material(product, selectors, company_id, category_id)
                        if material:
                            materials.append(material)
                    except Exception as e:
                        print(f"Error extracting material: {e}")
                        continue
            
            return materials
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return []

    def extract_material(self, product, selectors, company_id, category_id):
        """Extract material information from a product element"""
        # Extract name
        name = self.extract_text(product, selectors['name'])
        if not name:
            return None
        
        # Extract price
        price = self.extract_price(product, selectors['price'])
        if price <= 0:
            return None
        
        # Extract dimension
        dimension = self.extract_dimension(product, selectors['dimension'])
        
        return {
            'name': name.strip(),
            'price': price,
            'dimension': dimension,
            'category': category_id,
            'company': company_id,
            'scraped_at': datetime.now().isoformat()
        }

    def extract_text(self, element, selector):
        """Extract text from element using selector"""
        selectors = selector.split(', ')
        for sel in selectors:
            found = element.select_one(sel)
            if found:
                return found.get_text(strip=True)
        return None

    def extract_price(self, element, selector):
        """Extract price from element"""
        price_text = self.extract_text(element, selector)
        if not price_text:
            return 0
        
        # Remove currency symbols and extract numbers
        price_match = re.search(r'(\d+[,\d]*)', price_text.replace(' ', ''))
        if price_match:
            price_str = price_match.group(1).replace(',', '.')
            return float(price_str)
        
        return 0

    def extract_dimension(self, element, selector):
        """Extract dimension from element"""
        dimension_text = self.extract_text(element, selector)
        if not dimension_text:
            return None
        
        # Look for dimension patterns like "45x95", "45x95mm", etc.
        dimension_match = re.search(r'(\d+)x(\d+)', dimension_text, re.IGNORECASE)
        if dimension_match:
            return f"{dimension_match.group(1)}x{dimension_match.group(2)}"
        
        return None

    def parse_hornbach_json(self, soup, category_id):
        """Parse Hornbach product data from embedded JSON"""
        materials = []
        
        # Look for JSON data in script tags
        script_tags = soup.find_all('script')
        
        for script in script_tags:
            if script.string and '"__typename":"Product"' in script.string:
                script_content = script.string
                
                # Extract products using manual brace counting
                products = self.extract_products_manually(script_content)
                
                if products:
                    print(f"Found {len(products)} products")
                    
                    for product in products:
                        material = self.extract_material_from_json(product, 'hornbach', category_id)
                        if material:
                            materials.append(material)
                    
                    # Found products, no need to check other scripts
                    break
        
        if not materials:
            print("No product data found")
        
        return materials

    def extract_products_manually(self, script_content):
        """Extract product objects manually from script content"""
        products = []
        
        # Find all occurrences of Product objects
        start_marker = '"__typename":"Product"'
        start_positions = []
        
        pos = 0
        while True:
            pos = script_content.find(start_marker, pos)
            if pos == -1:
                break
            start_positions.append(pos)
            pos += 1
        
        for start_pos in start_positions:
            try:
                # Find the complete product object by counting braces
                brace_count = 0
                end_pos = start_pos
                
                # Go back to find the opening brace
                for i in range(start_pos, -1, -1):
                    if script_content[i] == '{':
                        start_pos = i
                        break
                
                # Now find the matching closing brace
                for i in range(start_pos, len(script_content)):
                    char = script_content[i]
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_pos = i + 1
                            break
                
                if end_pos > start_pos:
                    product_json = script_content[start_pos:end_pos]
                    
                    try:
                        product = json.loads(product_json)
                        
                        # Check if it's a valid product
                        if (product.get('__typename') == 'Product' and 
                            product.get('title') and 
                            product.get('defaultPrice')):
                            products.append(product)
                            
                    except json.JSONDecodeError:
                        # Try to fix common JSON issues
                        try:
                            # Remove trailing commas
                            product_json = re.sub(r',\s*}', '}', product_json)
                            product_json = re.sub(r',\s*]', ']', product_json)
                            product = json.loads(product_json)
                            
                            if (product.get('__typename') == 'Product' and 
                                product.get('title') and 
                                product.get('defaultPrice')):
                                products.append(product)
                        except:
                            pass
                            
            except Exception as e:
                print(f"Error extracting product: {e}")
                continue
        
        return products

    def extract_material_from_json(self, product, company_id, category_id):
        """Extract material information from JSON product data"""
        try:
            # Extract name
            name = product.get('title', '')
            if not name:
                return None
            
            # Extract price
            default_price = product.get('defaultPrice', {})
            price = default_price.get('price', 0)
            if price <= 0:
                return None
            
            # Extract dimension from name
            dimension = self.extract_dimension_from_name(name)
            
            return {
                'name': name.strip(),
                'price': float(price),
                'dimension': dimension,
                'category': category_id,
                'company': company_id,
                'scraped_at': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error extracting material from JSON: {e}")
            return None

    def extract_dimension_from_name(self, name):
        """Extract dimension from product name"""
        # Look for dimension patterns like "45x95", "45x95mm", etc.
        dimension_match = re.search(r'(\d+)x(\d+)', name, re.IGNORECASE)
        if dimension_match:
            return f"{dimension_match.group(1)}x{dimension_match.group(2)}"
        
        return None

    def save_results(self, results, filename=None):
        """Save scraped results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"scraped_materials_{timestamp}.json"
        
        # Group by company and category
        organized_data = {}
        for material in results:
            company = material['company']
            category = material['category']
            
            if company not in organized_data:
                organized_data[company] = {}
            
            if category not in organized_data[company]:
                organized_data[company][category] = []
            
            organized_data[company][category].append(material)
        
        # Create output data
        output_data = {
            'scraped_at': datetime.now().isoformat(),
            'total_materials': len(results),
            'companies': organized_data,
            'summary': {
                company: {
                    category: len(materials) 
                    for category, materials in categories.items()
                }
                for company, categories in organized_data.items()
            }
        }
        
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"Results saved to {filename}")
        return filename

    def generate_js_data(self, results):
        """Generate JavaScript data file for the application"""
        # Group materials by company and category
        organized_data = {}
        for material in results:
            company = material['company']
            category = material['category']
            
            if company not in organized_data:
                organized_data[company] = {}
            
            if category not in organized_data[company]:
                organized_data[company][category] = []
            
            organized_data[company][category].append(material)
        
        # Generate JavaScript code
        js_code = f"""// Auto-generated material data
// Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

export const SCRAPED_MATERIALS = {json.dumps(organized_data, indent=2, ensure_ascii=False)};

export const MATERIAL_SUMMARY = {json.dumps({
    company: {
        category: len(materials) 
        for category, materials in categories.items()
    }
    for company, categories in organized_data.items()
}, indent=2, ensure_ascii=False)};
"""
        
        return js_code

def main():
    parser = argparse.ArgumentParser(description='Scrape material data from building material companies')
    parser.add_argument('--company', '-c', choices=['hornbach', 'bauhaus', 'byggmax', 'all'], 
                       default='all', help='Company to scrape')
    parser.add_argument('--category', '-cat', help='Specific category to scrape')
    parser.add_argument('--output', '-o', help='Output filename')
    parser.add_argument('--js', action='store_true', help='Generate JavaScript data file')
    
    args = parser.parse_args()
    
    scraper = MaterialScraper()
    
    if args.company == 'all':
        companies = ['hornbach', 'bauhaus', 'byggmax']
    else:
        companies = [args.company]
    
    all_results = []
    
    for company_id in companies:
        try:
            results = scraper.scrape_company(company_id, args.category)
            all_results.extend(results)
            print(f"Scraped {len(results)} materials from {company_id}")
        except Exception as e:
            print(f"Error scraping {company_id}: {e}")
            continue
    
    if all_results:
        # Save results
        filename = scraper.save_results(all_results, args.output)
        
        # Generate JavaScript data if requested
        if args.js:
            js_code = scraper.generate_js_data(all_results)
            js_filename = 'data/scraped_materials.js'
            
            # Ensure data directory exists
            os.makedirs('data', exist_ok=True)
            
            with open(js_filename, 'w', encoding='utf-8') as f:
                f.write(js_code)
            
            print(f"JavaScript data saved to {js_filename}")
        
        print(f"\nScraping completed! Total materials: {len(all_results)}")
        print(f"Results saved to: {filename}")
    else:
        print("No materials found")

if __name__ == '__main__':
    main()
