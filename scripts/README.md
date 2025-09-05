# Previous Year Questions Import

Complete solution to import all previous year questions with diagrams into Supabase.

## Prerequisites

Add these to your `.env.local` file:

```env
# Required - Get from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

## One Command Import

```bash
node scripts/import-previous-year.js
```

This single command does everything:
1. ✅ Creates storage bucket if needed
2. ✅ Uploads all diagrams to Supabase Storage
3. ✅ Generates SQL with correct Supabase URLs
4. ✅ Creates `load_previous_year_data.sql` file

## Final Step

1. Open [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Copy contents of `supabase/migrations/load_previous_year_data.sql`
3. Click "Run"

Done! 🎉

## What Gets Imported

- **4 Exams**: JEE Main 2007-2008 papers
- **50+ Questions**: Physics questions with solutions
- **19 Diagrams**: Uploaded to Supabase Storage with public URLs
- **Standardized Topics**: Automatic topic mapping

## Verification

After import, check in SQL Editor:

```sql
SELECT 
    (SELECT COUNT(*) FROM previous_year_exams) as exams,
    (SELECT COUNT(*) FROM previous_year_questions) as questions,
    (SELECT COUNT(*) FROM previous_year_questions WHERE diagram_url IS NOT NULL) as diagrams_with_urls;
```

## Troubleshooting

If you get an error about missing environment variables:
1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase URL and Service Role Key
3. Get these from: Supabase Dashboard → Settings → API

The Service Role Key is needed to:
- Create storage buckets
- Upload images to storage
- Bypass RLS policies