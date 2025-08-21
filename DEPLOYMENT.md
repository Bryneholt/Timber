# Deployment Guide - GitHub Pages

This guide will help you deploy the Smart Virke- och Kapningsberäknare to GitHub Pages.

## 🚀 Quick Deployment

### 1. Repository Setup

1. **Create a new repository** on GitHub
2. **Clone and push** your code:
   ```bash
   git clone https://github.com/yourusername/smart-virke-kapningsberaknare.git
   cd smart-virke-kapningsberaknare
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy your site

### 3. Access Your Site

Your application will be available at:
```
https://yourusername.github.io/smart-virke-kapningsberaknare
```

## 🔧 Configuration

### Custom Domain (Optional)

If you have a custom domain:

1. Add your domain to the `CNAME` file:
   ```
   yourdomain.com
   ```

2. Configure DNS settings with your domain provider:
   - Add a CNAME record pointing to `yourusername.github.io`

3. In GitHub repository settings:
   - Go to Pages section
   - Enter your custom domain
   - Check "Enforce HTTPS"

### Repository Settings

Update these files with your actual information:

1. **package.json** - Update repository URLs
2. **README.md** - Update live demo link
3. **_site.yml** - Update site URL and metadata

## 📁 File Structure

The following files are important for GitHub Pages:

```
├── index.html              # Main application
├── css/styles.css          # Styles
├── js/                     # JavaScript modules
├── components/             # UI components
├── data/                   # Configuration
├── .github/workflows/      # GitHub Actions
├── 404.html               # Custom 404 page
├── CNAME                  # Custom domain (optional)
└── _site.yml             # Jekyll config (optional)
```

## 🔄 Automatic Deployment

The application uses GitHub Actions for automatic deployment:

- **Trigger**: Push to `main` or `master` branch
- **Action**: Deploy to `gh-pages` branch
- **Result**: Site automatically updated

### Manual Deployment

If you need to deploy manually:

1. **Using GitHub CLI**:
   ```bash
   gh pages deploy .
   ```

2. **Using GitHub Actions**:
   - Go to Actions tab
   - Select "Deploy to GitHub Pages"
   - Click "Run workflow"

## 🐛 Troubleshooting

### Common Issues

1. **Site not updating**:
   - Check GitHub Actions for errors
   - Ensure files are in the correct location
   - Verify branch settings

2. **404 errors**:
   - Check if `index.html` is in the root directory
   - Verify file paths are relative
   - Check browser console for errors

3. **JavaScript modules not loading**:
   - Ensure all import paths are correct
   - Check browser console for CORS errors
   - Verify file permissions

### Debug Steps

1. **Check GitHub Actions**:
   - Go to Actions tab
   - Look for failed workflows
   - Check build logs

2. **Test locally**:
   ```bash
   python3 dev-server.py
   # Open http://localhost:8000
   ```

3. **Check browser console**:
   - Open developer tools
   - Look for JavaScript errors
   - Check network requests

## 📞 Support

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the [GitHub Actions logs](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
3. Open an issue in the repository

## 🔒 Security

- The application runs entirely in the browser
- No server-side code or sensitive data
- All data is stored locally in the user's browser
- No external API calls or dependencies
