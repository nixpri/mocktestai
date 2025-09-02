# Developer Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Anthropic API key (for AI features)

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Optional, for cleanup scripts
ANTHROPIC_API_KEY=your-anthropic-key
```

### Installation
```bash
npm install
npm run dev
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run db:init      # Show database initialization instructions
npm run dev:clean    # Clean all data (browser + database)
npm run dev:help     # Show all available dev tools
```

## Testing the Application

### 1. Fresh Start Testing
```bash
# Clear everything and start fresh
npm run dev:clean

# Or manually in browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 2. Generate Test Data
1. Sign up for a new account
2. Take a Quick Test (predefined questions)
3. Generate an AI Test (requires API key)
4. Check Analytics page for real data

### 3. Verify Analytics
- **Overview Cards**: Real test counts and scores
- **Performance Trend**: Actual test history graph
- **Topic Performance**: Aggregated topic accuracy
- **Difficulty Analysis**: Real question distribution
- **Recent Tests**: Clickable test history
- **Weak Areas**: Topics with <60% accuracy

## Data Management

### Browser Storage Structure
```javascript
// Test Results
localStorage['test_result_<id>'] = {
  testId, testTitle, totalQuestions,
  attempted, correct, incorrect, 
  score, percentage, date,
  topicBreakdown: { /* topic stats */ },
  difficultyBreakdown: { /* difficulty stats */ }
}

// Test History
localStorage['test_history'] = [/* array of results */]

// AI Test Data
localStorage['ai_test_<id>'] = { test, questions }
```

### Database Tables
- `profiles`: User profiles (auto-created on signup)
- `tests`: Test records
- `test_results`: Test scores
- `questions`: Generated questions
- `test_responses`: User answers

## Cleanup Options

### Browser Only
```javascript
// Run in browser console
localStorage.clear()
sessionStorage.clear()
```

### Database Only
Requires `SUPABASE_SERVICE_ROLE_KEY`:
```bash
node scripts/dev-tools.js --clear-db
```

### Complete Reset
```bash
npm run dev:clean
```

## Common Issues

### "ANTHROPIC_API_KEY not configured"
Add the key to `.env.local` and restart the server.

### "Foreign key constraint" on signup
The database trigger handles profile creation automatically.

### Analytics showing wrong data
Clear browser storage and take fresh tests:
```javascript
localStorage.removeItem('test_history')
location.reload()
```

### AI generation failing
- Check API key is valid
- API might be rate limited (wait 1 minute)
- Check console for specific error

## Project Structure

```
/app              # Next.js app directory
  /api            # API routes
  /auth           # Authentication pages
  /dashboard      # User dashboard
  /test           # Test taking interface
  /analytics      # Performance analytics
/components       # React components
/lib              # Utilities and configs
  /ai             # Claude AI integration
  /supabase       # Database client
/public          # Static assets
/docs            # Developer documentation
/scripts         # Development tools
/supabase        # Database migrations
```

## Key Features

### AI Question Generation
- Uses Claude API (Haiku model)
- Generates JEE Physics questions
- LaTeX math rendering
- Configurable difficulty

### Test System
- Quick Test: Predefined questions
- AI Test: Generated questions
- Timed tests with pause
- Progress saving
- Detailed results

### Analytics
- Performance tracking
- Topic-wise analysis
- Difficulty breakdown
- Study recommendations
- Weak area identification

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## Support

For issues or questions, check:
- GitHub Issues
- Supabase Dashboard logs
- Browser console for errors
- Network tab for API failures