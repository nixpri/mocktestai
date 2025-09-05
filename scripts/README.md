# Development Tools and Scripts

This directory contains utility scripts for development and maintenance.

## Available Scripts

### dev-tools.js
Development utilities and helper functions for local development.

## Admin Panel Features

Previous year question import and extraction is now handled through the web interface:

1. **Extract Questions from PDFs**: `/admin/process-papers`
   - Upload PDF files
   - Automatic OCR and question extraction
   - Diagram detection and extraction
   - Direct upload to database

2. **Manage Questions**: `/admin/questions`
   - View all extracted questions
   - Edit question details
   - Manage test papers

## Environment Setup

Add these to your `.env.local` file:

```env
# Required - Get from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

## Getting Environment Variables

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Navigate to Settings → API
3. Copy the required keys

The Service Role Key is needed for admin operations that bypass Row Level Security.