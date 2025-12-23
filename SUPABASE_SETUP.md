# Supabase Setup Guide

This app uses Supabase for storing text notes. Follow these steps to set up your Supabase project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: hear-my-song (or whatever you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Wait for the project to be created (takes a few minutes)

## 2. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

This will create:
- The `notes` table (empty, ready for your data)
- Indexes for better performance
- Row Level Security policies for public read, inserts, and deletes

## 3. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **anon public** key (this is your `SUPABASE_ANON_KEY`)

## 4. Update Your .env File

Add these variables to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: The `VITE_` prefix is important for Vite to expose these to the frontend.

## 5. Test the Setup

1. Start your server: `npm run server`
2. Start your frontend: `npm run dev`
3. Try adding a note - it should save to Supabase!

## Troubleshooting

### "Supabase not configured" error
- Make sure your `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your server after adding environment variables

### Database connection issues
- Make sure your Supabase project is active (not paused)
- Check that you're using the correct project URL and keys

## Optional: Enable Realtime (for instant sync)

If you want real-time updates instead of polling:

1. In Supabase dashboard, go to **Database** → **Replication**
2. Enable replication for the `notes` table
3. Update the frontend to use Supabase Realtime subscriptions (see Supabase docs)

