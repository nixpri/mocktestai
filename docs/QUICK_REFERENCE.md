# Quick Reference

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Check code quality

# Cleanup & Testing
npm run dev:clean        # Clear all data
npm run dev:help         # Show all dev tools
```

## Browser Console

```javascript
// Quick data clear
localStorage.clear(); location.reload();

// Check test history
JSON.parse(localStorage.getItem('test_history'))

// Clear specific test
localStorage.removeItem('test_result_<id>')
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=

# Optional (for cleanup tools)
SUPABASE_SERVICE_ROLE_KEY=
```

## File Structure

```
/app            → Pages and API routes
/components     → React components  
/lib            → Utilities
/docs           → Documentation
/scripts        → Dev tools
/supabase       → Migrations
```

## Testing Flow

1. Clear data: `npm run dev:clean`
2. Sign up fresh account
3. Take Quick Test
4. Generate AI Test
5. Check Analytics

## Common Fixes

- **API Key Error**: Add to `.env.local`
- **Analytics Wrong**: Clear localStorage
- **Auth Error**: Check Supabase trigger
- **AI Fails**: Check rate limits