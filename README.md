# Smart Virke- och Kapningsberäknare

A comprehensive Swedish timber and cutting optimization calculator that helps you minimize waste and costs when planning wood cutting projects.

## 🌟 Features

### 📋 Article Management
- Add multiple timber articles with custom dimensions
- Pre-defined standard dimensions (45x45, 45x70, 45x95, etc.)
- Track quantity and length requirements per article
- Edit and delete articles as needed

### 📏 Stock Length Management
- Define available stock lengths for each dimension
- Set pricing per meter for different lengths
- Common standard lengths (2400, 3000, 3600, 4200, 4800, 5400 mm)
- Dynamic price updates and length management

### 🎯 Optimization Algorithms
- **Minimize Waste**: Optimize cutting to reduce material waste
- **Minimize Cost**: Find the most cost-effective cutting solution
- **Minimize Planks**: Use the fewest number of stock pieces

### 📊 Visual Results
- Interactive cutting diagrams showing each plank
- Color-coded segments (timber vs. waste)
- Detailed summary with costs, lengths, and waste percentages
- Real-time calculations and updates

### 💾 Project Management
- Save and load projects locally
- Export projects as JSON files
- Import projects from JSON files
- Persistent storage using browser localStorage

## 🚀 Getting Started

### Live Demo
🌐 **Try the application online**: [Smart Virke- och Kapningsberäknare](https://yourusername.github.io/smart-virke-kapningsberaknare)

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs entirely in the browser

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-virke-kapningsberaknare.git
   cd smart-virke-kapningsberaknare
   ```

2. **Run locally**
   ```bash
   # Using Python (recommended)
   python3 dev-server.py
   
   # Or using npm
   npm start
   
   # Or simply open index.html in your browser
   ```

3. **Open the Application**
   - Navigate to `http://localhost:8000` if using the dev server
   - Or simply open `index.html` in your web browser
   - No server setup required for basic usage

2. **Add Articles**
   - Go to the "Artiklar" tab
   - Select a standard dimension or enter custom dimensions
   - Specify quantity and length needed
   - Click "Lägg till artikel"

3. **Configure Stock Lengths**
   - Go to the "Lagerlängder" tab
   - Select the dimension you're working with
   - Add available stock lengths and their prices per meter
   - Use the quick buttons for common lengths (2400, 3000, 3600, etc.)

4. **Calculate Optimal Cuts**
   - Click "Beräkna optimal kapning" in the Artiklar tab
   - Choose your optimization strategy
   - View the results in the "Resultat" tab

5. **Save Your Project**
   - Go to the "Spara/Ladda Projekt" tab
   - Enter a project name and save
   - Export as JSON for backup or sharing

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

The interface adapts to different screen sizes with optimized layouts for mobile devices.

## 🛠️ Technical Details

### Technology Stack
- **Frontend**: Pure HTML, CSS, and JavaScript
- **No Dependencies**: Uses CDN for Font Awesome icons only
- **Storage**: Browser localStorage for data persistence
- **Algorithms**: First-Fit Decreasing algorithm for cutting optimization

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Data Structure
The application stores:
- Articles with dimensions, quantities, and lengths
- Stock lengths with pricing per dimension
- Project metadata and timestamps

## 📈 Optimization Strategies

### Minimize Waste
- Prioritizes reducing material waste
- Best for expensive materials or sustainability focus

### Minimize Cost
- Focuses on lowest total cost
- Considers price per meter of different stock lengths

### Minimize Planks
- Uses the fewest number of stock pieces
- Good for reducing handling and cutting operations

## 🎨 User Interface

### Color Scheme
- **Primary**: Green (#2e7d32) - represents timber/nature
- **Secondary**: Blue-grey (#455a64) - professional appearance
- **Success**: Green (#388e3c) - positive actions
- **Warning**: Orange (#ffa000) - cautionary information
- **Error**: Red (#d32f2f) - errors and waste

### Visual Elements
- Interactive tabs for organized workflow
- Modal dialogs for editing
- Visual cutting diagrams with color coding
- Responsive tables and forms

## 🔧 Customization

### Adding New Dimensions
The application automatically detects dimensions from article names. To add new standard dimensions:

1. Edit the `dimension-select` dropdown in the HTML
2. Add corresponding pricing in the JavaScript standardPriser object

### Modifying Default Prices
Update the `standardPriser` object in the JavaScript to change default pricing for different dimensions.

## 🚀 Deployment

### GitHub Pages
This application is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages** in your repository settings
2. **Set source** to "GitHub Actions" or "Deploy from a branch"
3. **Push to main branch** - automatic deployment will trigger

The application will be available at: `https://yourusername.github.io/smart-virke-kapningsberaknare`

### Manual Deployment
If you prefer manual deployment:
1. Build the project (if needed): `npm run build`
2. Upload all files to your web server
3. Ensure all file paths are relative

## 📊 Material Data Management

The application includes a Python-based scraping system to automatically fetch material data from Swedish building material companies.

### Quick Setup

1. Install Python dependencies:
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

2. Run the scraper to update material data:
   ```bash
   python update_materials.py
   ```

### Supported Companies

- **Hornbach**: Virke, Tryckimpregnerat, Reglar
- **Bauhaus**: Virke, Reglar  
- **Byggmax**: Virke, Reglar

### Manual Scraping

```bash
# Scrape all companies
python scraper.py --company all --js

# Scrape specific company
python scraper.py --company hornbach --js

# Scrape specific category
python scraper.py --company hornbach --category virke --js
```

The scraper generates `data/scraped_materials.js` which the application uses for material selection and pricing.

For more details, see [scripts/README.md](scripts/README.md).

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Bug reports
- Feature requests
- Documentation improvements
- Performance optimizations

## 📞 Support

For questions or support, please:
1. Check the application's built-in help text
2. Review the optimization strategies
3. Ensure all required data is entered before calculations

---

**Note**: This application is designed for Swedish users and uses Swedish terminology throughout the interface. The calculations are optimized for metric measurements (millimeters and meters). 
