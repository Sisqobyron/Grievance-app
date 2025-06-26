# 🚀 Deployment Guide for Render

## Overview
This guide walks you through deploying your Student Grievance System to Render with both backend and frontend services.

## Prerequisites
- Render account (free tier available)
- GitHub repository with your code
- Domain knowledge of your app structure

## 📋 **Step 1: Prepare Your Repository**

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Repository Structure
Ensure your repository has this structure:
```
your-repo/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   └── ... (other backend files)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.production
│   └── ... (other frontend files)
└── README.md
```

## 🔧 **Step 2: Deploy Backend Service**

### 2.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Service Details:**
- **Name:** `student-grievance-backend`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
Add these in the Render dashboard:
```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### 2.2 Advanced Settings
- **Auto-Deploy:** Yes (deploys on every git push)
- **Health Check Path:** `/health`

### 2.3 Deploy
Click "Create Web Service" and wait for deployment.

## 🎨 **Step 3: Deploy Frontend Service**

### 3.1 Create Static Site
1. In Render Dashboard, click "New" → "Static Site"
2. Connect the same GitHub repository
3. Configure the site:

**Site Details:**
- **Name:** `student-grievance-frontend`
- **Branch:** `main`
- **Root Directory:** `frontend`

**Build Settings:**
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

**Environment Variables:**
```
VITE_API_URL=https://your-backend-app.onrender.com
```

### 3.2 Deploy
Click "Create Static Site" and wait for deployment.

## 🔗 **Step 4: Update URLs**

### 4.1 Update Backend CORS
After frontend deployment, update your backend environment variables:
```
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
```

### 4.2 Update Frontend API URL
Update the frontend environment variable:
```
VITE_API_URL=https://your-actual-backend-url.onrender.com
```

## 🔍 **Step 5: Testing**

### 5.1 Backend Health Check
Visit: `https://your-backend-url.onrender.com/health`
Should return: `{"status":"OK","timestamp":"...","uptime":"..."}`

### 5.2 Frontend Check
Visit: `https://your-frontend-url.onrender.com`
Should load the login page.

### 5.3 Full System Test
1. Register a new user
2. Login
3. Submit a test grievance
4. Check if everything works end-to-end

## 📊 **Step 6: Monitoring**

### 6.1 Render Dashboard
- Monitor deployment logs
- Check service health
- View metrics

### 6.2 Application Logs
- Backend logs available in Render dashboard
- Frontend errors in browser console

## 🔧 **Troubleshooting**

### Common Issues:

**1. CORS Errors**
- Ensure `FRONTEND_URL` is correctly set in backend
- Check CORS configuration in `server.js`

**2. API Connection Issues**
- Verify `VITE_API_URL` in frontend environment
- Check if backend service is running

**3. Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs in Render dashboard

**4. Database Issues**
- SQLite works but files may not persist
- Consider upgrading to PostgreSQL for production

### Support Links:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

## 🚀 **Production Considerations**

### Security
- Use environment variables for sensitive data
- Implement proper authentication
- Add rate limiting
- Use HTTPS (automatic on Render)

### Performance
- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets
- Implement caching strategies

### Monitoring
- Set up error tracking (Sentry)
- Implement application monitoring
- Set up uptime monitoring

## 📝 **Next Steps**

1. **Custom Domain:** Configure custom domain in Render
2. **SSL Certificate:** Automatic with custom domain
3. **Database:** Upgrade to PostgreSQL for production
4. **File Storage:** Use cloud storage for file uploads
5. **Email Service:** Configure proper email service
6. **Backup Strategy:** Implement regular backups

---

**🎉 Congratulations!** Your Student Grievance System is now live on Render!

**Backend URL:** `https://your-backend-app.onrender.com`
**Frontend URL:** `https://your-frontend-app.onrender.com`
