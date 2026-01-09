# Quick Deployment - Just Push to GitHub

## What's Fixed ✅

1. **Email Verification** - Now uses production URL automatically
2. **Auth Callback** - Handles email verification redirects
3. **Environment Variables** - Ready for deployment platforms
4. **Auto-detection** - Works in both dev and production

## One-Time Supabase Setup

**Before deploying**, configure Supabase:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-domain.com` (or your deployment URL)
3. Add **Redirect URLs**:
   ```
   https://your-domain.com/**
   https://your-domain.com/auth/callback
   http://localhost:5173/** (keep for local dev)
   ```

## Deploy to Vercel (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Build settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

## Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Add environment variables (same as above)
4. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Deploy!

## That's It! 🎉

After deployment:
- ✅ Email verification will work automatically
- ✅ Users can sign up and verify emails
- ✅ Redirects will go to your production URL
- ✅ Everything works out of the box

## Testing

1. Sign up with a new account
2. Check email for verification link
3. Click link → Should redirect to your production site
4. Should automatically log you in

If it redirects to localhost, just update Supabase redirect URLs (step 1 above).
