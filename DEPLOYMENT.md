# 🚀 Project K - Deployment Guide

## Architecture Overview
- **Frontend**: React 19 → Vercel
- **Backend**: FastAPI → Railway 
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API

## 📋 Pre-Deployment Checklist

### 1. Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/project_k`
4. Whitelist all IP addresses (0.0.0.0/0) for serverless deployment

### 2. Get API Keys
- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Backend Deployment (Railway)

### Step 1: Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect the Python app

### Step 2: Set Environment Variables in Railway
```bash
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/project_k
DB_NAME=project_k
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_for_production
PORT=8000
```

### Step 3: Configure Build
- Railway should auto-detect and use the Procfile
- Build command: `pip install -r backend/requirements.txt`
- Start command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 4: Get Your Backend URL
- After deployment, Railway will give you a URL like: `https://your-app-name.railway.app`
- Copy this URL for frontend configuration

## 🎨 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure as follows:
   - **Framework Preset**: Create React App
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: build

### Step 2: Set Environment Variables in Vercel
```bash
REACT_APP_BACKEND_URL=https://your-app-name.railway.app
```

### Step 3: Deploy
- Click "Deploy"
- Vercel will build and deploy your frontend
- You'll get a URL like: `https://your-project.vercel.app`

## 🔗 Update CORS Settings

After getting your Vercel URL, update the backend CORS settings:

1. In Railway dashboard, update the environment variable:
```bash
FRONTEND_URL=https://your-project.vercel.app
```

2. Or update the `server.py` file directly:
```python
allow_origins=[
    "https://your-project.vercel.app",
    "https://*.vercel.app"
]
```

## ✅ Test Your Deployment

1. Visit your Vercel frontend URL
2. Try registering a new account
3. Test the AI tutoring system
4. Take a practice test
5. Check progress tracking

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Make sure frontend URL is added to backend CORS settings
   - Check that backend URL is correct in frontend env vars

2. **Database Connection**: 
   - Verify MongoDB Atlas connection string
   - Make sure IP whitelist includes 0.0.0.0/0

3. **API Key Issues**:
   - Verify Gemini API key is set correctly
   - Check API key permissions

4. **Build Failures**:
   - Check build logs in Vercel/Railway dashboards
   - Verify all dependencies are in package.json/requirements.txt

## 📊 Performance Optimization

1. **Frontend**:
   - Enable Vercel's Edge Network
   - Use Vercel Analytics for monitoring

2. **Backend**:
   - Monitor Railway metrics
   - Consider upgrading to Railway Pro for better performance

3. **Database**:
   - Monitor MongoDB Atlas performance
   - Consider indexing frequently queried fields

## 🔐 Security Considerations

1. **Environment Variables**:
   - Never commit API keys to git
   - Use strong JWT secrets
   - Rotate API keys regularly

2. **CORS**:
   - Use specific domains instead of wildcards in production
   - Regularly review allowed origins

3. **Database**:
   - Use MongoDB Atlas's built-in security features
   - Enable authentication and authorization
   - Regular backups

## 📈 Scaling

1. **Frontend**: Vercel handles this automatically
2. **Backend**: Railway Pro offers auto-scaling
3. **Database**: MongoDB Atlas offers automatic scaling

## 💰 Cost Estimation

1. **Vercel**: Free tier supports hobby projects
2. **Railway**: ~$5/month for basic usage
3. **MongoDB Atlas**: Free tier (512MB storage)
4. **Gemini API**: Pay-per-use, very affordable for educational use

## 🚀 Go Live!

Once deployed:
1. Share your Vercel URL with users
2. Monitor application performance
3. Set up error tracking (Sentry recommended)
4. Enable analytics and monitoring

Your Project K educational platform is now live! 🎉