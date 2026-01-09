# Deployment Guide

This guide will help you deploy the IOT Club application to production.

## Quick Deployment Checklist

### 1. Supabase Configuration

**IMPORTANT**: Configure these in your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL:
   ```
   https://your-domain.com
   ```
3. Add **Redirect URLs**:
   ```
   https://your-domain.com/**
   https://your-domain.com/auth/callback
   http://localhost:5173/** (for local development)
   ```

### 2. Environment Variables

For **GitHub Pages / Vercel / Netlify**:

Add these as **Environment Variables** in your deployment platform:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to add:**
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Environment variables
- **GitHub Pages**: Repository → Settings → Secrets and variables → Actions

### 3. Platform-Specific Setup

#### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables (see above)
5. Build command: `cd frontend && npm run build`
6. Output directory: `frontend/dist`
7. Deploy!

#### Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git → Select repository
4. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add environment variables
6. Deploy!

#### GitHub Pages

1. Add this to `frontend/vite.config.js`:
   ```js
   export default {
     base: '/IOT-CLUB/', // Your repo name
     // ... rest of config
   }
   ```
2. Use GitHub Actions (see below)

### 4. GitHub Actions (For GitHub Pages)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Build
        working-directory: ./frontend
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

Add secrets in: Repository → Settings → Secrets and variables → Actions

### 5. Database Setup

1. Run the SQL schema in Supabase:
   - Go to SQL Editor
   - Run `supabase/schema.sql`
   
2. Insert sample events:
   - Run `supabase/insert-sample-events.sql`

### 6. Email Verification

The app now automatically:
- ✅ Uses production URL for email verification
- ✅ Handles auth callbacks at `/auth/callback`
- ✅ Works in both development and production

**No additional configuration needed!** Just make sure Supabase redirect URLs are set correctly.

## Testing After Deployment

1. **Test Sign Up**:
   - Create a new account
   - Check email for verification link
   - Click link - should redirect to your production site
   - Should automatically log you in

2. **Test Sign In**:
   - Log in with verified account
   - Should work immediately

3. **Test Registration**:
   - Register for an event
   - Check Supabase dashboard to verify data is saved

## Troubleshooting

### Email verification redirects to localhost

**Fix**: Update Supabase redirect URLs:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to Redirect URLs
3. Save changes

### Environment variables not working

**Fix**: 
- Make sure variables start with `VITE_`
- Rebuild after adding variables
- Check deployment platform logs

### Build fails

**Fix**:
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

## Production Checklist

- [ ] Supabase redirect URLs configured
- [ ] Environment variables set in deployment platform
- [ ] Database schema created
- [ ] Sample events inserted
- [ ] Email verification tested
- [ ] User registration tested
- [ ] Event registration tested

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify environment variables are set
4. Ensure redirect URLs match your domain
