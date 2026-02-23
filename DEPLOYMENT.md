# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Method 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Method 2: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings
   - Click "Deploy"

### Method 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

## 📋 Configuration

### Environment Variables

No environment variables are required for basic deployment, but you can add these optional ones in Vercel Dashboard:

- `NODE_ENV`: Set to `production`
- `PORT`: Vercel will set this automatically

To add environment variables in Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable

### Project Settings

The project is pre-configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to ignore during deployment
- ✅ `.gitignore` - Git ignore rules
- ✅ `package.json` - Build scripts configured

## 🔧 Files Configured for Vercel

### vercel.json
Routes all traffic through the Express server as a serverless function.

### server.js
- Exports the Express app for Vercel's serverless environment
- Automatically detects Vercel environment
- Works locally and in production

## 📁 Project Structure

```
quiz/
├── server.js              # Express server (Serverless on Vercel)
├── package.json           # Dependencies & scripts
├── vercel.json            # Vercel configuration
├── .vercelignore          # Files to ignore
├── .gitignore             # Git ignore
├── quiz_data.json         # 300 quiz questions
├── public/                # Static files
│   ├── index.html         # Frontend
│   ├── styles.css         # Styling
│   └── quiz.js            # Client logic
└── README.md              # Documentation
```

## 🌐 Custom Domain (Optional)

To add a custom domain:
1. Go to your project in Vercel Dashboard
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions

## 🔍 Monitoring

Once deployed, you can:
- View logs in Vercel Dashboard
- Monitor performance
- See real-time analytics
- Check deployment status

## 🐛 Troubleshooting

### Build Fails
- Ensure all dependencies are in `package.json`
- Check Node.js version (>=18.0.0)
- Review build logs in Vercel Dashboard

### 404 Errors
- Check `vercel.json` routing configuration
- Ensure all routes are properly defined

### API Not Working
- Verify `quiz_data.json` is included in deployment
- Check API endpoints in browser DevTools

## 📊 Performance

After deployment:
- Static files are served via Vercel's CDN
- API endpoints run as serverless functions
- Automatic HTTPS
- Global edge network

## 🎯 Testing Your Deployment

Once deployed, test these endpoints:

- Homepage: `https://your-app.vercel.app/`
- API: `https://your-app.vercel.app/api/questions`
- Stats: `https://your-app.vercel.app/api/stats`

## 💡 Tips

1. **Free Tier**: Vercel's free tier is sufficient for this application
2. **Automatic Deployments**: Connect GitHub for automatic deployments on push
3. **Preview Deployments**: Every git push creates a preview deployment
4. **Environment**: Production and preview environments are separate

## 🔄 Continuous Deployment

With GitHub connected:
1. Push to `main` branch → Production deployment
2. Push to any other branch → Preview deployment
3. Pull requests get unique preview URLs

## 📞 Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
