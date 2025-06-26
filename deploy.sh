#!/bin/bash

# 🚀 Quick Deployment Script for Render
# This script helps prepare your app for Render deployment

echo "🚀 Preparing Student Grievance System for Render deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
else
    echo "✅ Git repository detected"
fi

# Backend preparation
echo "🔧 Preparing backend..."
cd backend
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your production values"
fi

# Test backend dependencies
echo "📦 Testing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Backend dependency installation failed"
    exit 1
fi

# Frontend preparation
echo "🎨 Preparing frontend..."
cd ../frontend

# Test frontend dependencies and build
echo "📦 Testing frontend dependencies and build..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "🔨 Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
    rm -rf dist  # Clean up test build
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Create Render services:"
echo "   - Backend: Web Service (Node.js)"
echo "   - Frontend: Static Site"
echo ""
echo "3. Configure environment variables in Render dashboard"
echo ""
echo "📖 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions"
