# MedFlow Backend - Render Deployment Guide

## Environment Variables for Render

Set these environment variables in your Render dashboard:

### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/MedFlow?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
NODE_ENV=production
```

### Optional Variables:
```
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

## MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Create database user with read/write permissions
3. Whitelist IP addresses (0.0.0.0/0 for Render)
4. Get connection string and replace in MONGODB_URI

## Render Deployment Steps

1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables above
5. Deploy

## Troubleshooting

### 500 Internal Server Error
- Check MongoDB connection string
- Verify JWT_SECRET is set
- Check server logs in Render dashboard

### 401 Unauthorized
- Verify JWT_SECRET matches between deployments
- Check if token is being sent in Authorization header
- Ensure CORS is enabled

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions