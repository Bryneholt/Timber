#!/usr/bin/env python3
"""
Update Materials Script
Runs the scraper and updates the application with new material data
"""

import os
import sys
import json
from datetime import datetime
from scraper import MaterialScraper

def update_application_data(scraped_data_file):
    """Update the application with scraped data"""
    
    # Read scraped data
    with open(scraped_data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Generate JavaScript data file
    js_code = generate_js_data_file(data)
    
    # Write to data directory
    js_filename = '../data/scraped_materials.js'
    os.makedirs(os.path.dirname(js_filename), exist_ok=True)
    
    with open(js_filename, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"Application data updated: {js_filename}")
    
    # Generate summary
    generate_summary(data)

def generate_js_data_file(data):
    """Generate JavaScript data file for the application"""
    
    companies_data = data.get('companies', {})
    
    # Generate JavaScript code
    js_code = f"""// Auto-generated material data
// Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// Total materials: {data.get('total_materials', 0)}

export const SCRAPED_MATERIALS = {json.dumps(companies_data, indent=2, ensure_ascii=False)};

export const MATERIAL_SUMMARY = {json.dumps(data.get('summary', {}), indent=2, ensure_ascii=False)};

export const LAST_UPDATE = '{data.get('scraped_at', datetime.now().isoformat())}';

// Helper function to get materials by company and category
export function getMaterials(companyId, categoryId) {{
    return SCRAPED_MATERIALS[companyId]?.[categoryId] || [];
}}

// Helper function to get all materials for a company
export function getCompanyMaterials(companyId) {{
    const materials = [];
    const companyData = SCRAPED_MATERIALS[companyId];
    if (companyData) {{
        Object.values(companyData).forEach(categoryMaterials => {{
            materials.push(...categoryMaterials);
        }});
    }}
    return materials;
}}

// Helper function to search materials by name
export function searchMaterials(query, companyId = null) {{
    const results = [];
    const companies = companyId ? [companyId] : Object.keys(SCRAPED_MATERIALS);
    
    companies.forEach(company => {{
        const companyMaterials = getCompanyMaterials(company);
        companyMaterials.forEach(material => {{
            if (material.name.toLowerCase().includes(query.toLowerCase())) {{
                results.push(material);
            }}
        }});
    }});
    
    return results;
}}
"""
    
    return js_code

def generate_summary(data):
    """Generate a summary of the scraped data"""
    
    print("\n" + "="*50)
    print("SCRAPING SUMMARY")
    print("="*50)
    
    print(f"Total materials scraped: {data.get('total_materials', 0)}")
    print(f"Scraped at: {data.get('scraped_at', 'Unknown')}")
    
    summary = data.get('summary', {})
    if summary:
        print("\nMaterials by company:")
        for company, categories in summary.items():
            total = sum(categories.values())
            print(f"  {company.upper()}: {total} materials")
            for category, count in categories.items():
                print(f"    - {category}: {count}")

def main():
    """Main function"""
    
    # Check if we're in the right directory
    if not os.path.exists('scraper.py'):
        print("Error: scraper.py not found. Please run this script from the scripts directory.")
        sys.exit(1)
    
    print("Material Data Update Script")
    print("="*40)
    
    # Check for existing scraped data
    scraped_files = [f for f in os.listdir('.') if f.startswith('scraped_materials_') and f.endswith('.json')]
    
    if scraped_files:
        print("Found existing scraped data:")
        for i, file in enumerate(sorted(scraped_files, reverse=True)):
            print(f"  {i+1}. {file}")
        
        choice = input("\nUse existing data (enter number) or scrape new data (press Enter): ").strip()
        
        if choice.isdigit() and 1 <= int(choice) <= len(scraped_files):
            selected_file = sorted(scraped_files, reverse=True)[int(choice)-1]
            print(f"Using existing data: {selected_file}")
        else:
            selected_file = None
    else:
        selected_file = None
    
    if not selected_file:
        # Run scraper
        print("\nRunning scraper...")
        scraper = MaterialScraper()
        
        # Ask user what to scrape
        print("\nWhat would you like to scrape?")
        print("1. All companies and categories")
        print("2. Specific company")
        print("3. Specific company and category")
        
        choice = input("Enter choice (1-3): ").strip()
        
        if choice == '1':
            results = []
            for company in ['hornbach', 'bauhaus', 'byggmax']:
                try:
                    company_results = scraper.scrape_company(company)
                    results.extend(company_results)
                    print(f"Scraped {len(company_results)} materials from {company}")
                except Exception as e:
                    print(f"Error scraping {company}: {e}")
        elif choice == '2':
            company = input("Enter company (hornbach/bauhaus/byggmax): ").strip()
            results = scraper.scrape_company(company)
        elif choice == '3':
            company = input("Enter company (hornbach/bauhaus/byggmax): ").strip()
            category = input("Enter category: ").strip()
            results = scraper.scrape_company(company, category)
        else:
            print("Invalid choice")
            return
        
        if results:
            # Save results
            selected_file = scraper.save_results(results)
        else:
            print("No materials found")
            return
    
    # Update application
    print(f"\nUpdating application with data from {selected_file}...")
    update_application_data(selected_file)
    
    print("\nUpdate completed successfully!")
    print("\nNext steps:")
    print("1. The application will now use the updated material data")
    print("2. You can import the data into the application")
    print("3. Run the scraper again when you need fresh data")

if __name__ == '__main__':
    main()
