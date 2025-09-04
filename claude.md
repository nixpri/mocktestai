# MockTest AI - Claude Assistant Context

## 🚨 CRITICAL: READ THIS ENTIRE FILE FIRST

This file provides essential context for Claude. **You MUST read these files in order at the start of EVERY session:**

1. **[README.md](./README.md)** - Product vision and technical setup
2. **[STRATEGIC_ANALYSIS.md](./STRATEGIC_ANALYSIS.md)** - Market analysis and AI strategy  
3. **[PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)** - Current development status and roadmap
4. **This file (CLAUDE.md)** - Implementation guidelines and current state

---

## 🎯 Project Vision

**MockTest AI is an ADVANCED AI-DRIVEN PLATFORM**, not a simple quiz app. We are building:

- **India's most advanced competitive exam platform**
- **ML models trained on 20+ years of exam papers**
- **Pattern recognition from decades of JEE/NEET data**
- **Authentic AI question generation matching exact exam patterns**
- **Predictive AI for rank and score forecasting**
- **Adaptive learning paths based on student performance**

---

## 📊 Current Development Status

### ✅ Phase 0: MVP Foundation [COMPLETED - 100%]
**All core features are operational:**
- Authentication (Google OAuth + Email)
- Test-taking system with timer
- Question management with bulk import
- Results and analytics
- Practice mode with hints
- Formula sheets
- Mobile responsiveness
- Admin panel
- Error handling and UX polish

### 🚧 Phase 1: Data Foundation [IN PROGRESS - 5%]
**Current Sprint Focus:**
- Setting up OCR pipeline for paper digitization
- Creating hierarchical topic taxonomy
- Building previous year questions database
- Designing digitization interface

### ⏳ Upcoming Phases
- **Phase 2**: AI Integration (Claude API)
- **Phase 3**: Advanced Testing Capabilities
- **Phase 4**: Analytics & Adaptive Engine
- **Phase 5**: ML Platform Development
- **Phase 6**: Predictive AI Features
- **Phase 7**: Scale & Expansion

---

## 🏗️ Technical Architecture

### Current Stack
```javascript
{
  "frontend": {
    "framework": "Next.js 15.5.2",
    "ui": "React 19.1.0",
    "styling": "Tailwind CSS + Custom Design System",
    "latex": "KaTeX",
    "state": "React hooks + Zustand (planned)"
  },
  "backend": {
    "database": "Supabase (PostgreSQL)",
    "auth": "Supabase Auth",
    "api": "Next.js API Routes",
    "realtime": "Supabase Realtime (planned)"
  },
  "ai": {
    "phase2": "Claude API (Haiku), OpenAI fallback",
    "phase5": "Fine-tuned LLaMA/Mistral",
    "caching": "Redis (Upstash)"
  },
  "deployment": {
    "hosting": "Vercel",
    "cdn": "Vercel Edge Network",
    "monitoring": "Vercel Analytics"
  }
}
```

### Database Schema
- `profiles`: User management with subscription tiers
- `questions`: Question bank with LaTeX support
- `tests`: Test instances and configurations
- `test_results`: Comprehensive result storage
- `topics`: Hierarchical categorization
- **Pending**: `previous_year_questions`, `question_patterns`, `ai_generations`

---

## 🎯 Implementation Guidelines

### 1. Sequential Development
```
ALWAYS follow this order:
Phase 0 ✅ → Phase 1 (current) → Phase 2 → Phase 3 → ... → Phase 7

❌ NEVER:
- Jump to AI features before completing data foundation
- Implement features from future phases
- Skip quality gates between phases
```

### 2. Current Phase Focus (Phase 1)
When implementing Phase 1 features:
1. **Data Collection First**: Get previous year papers legally
2. **OCR Pipeline**: Choose between Tesseract or Google Vision
3. **Taxonomy Structure**: Build hierarchical topic tree
4. **Digitization Interface**: Admin tools for paper processing
5. **Quality Validation**: Ensure 95% OCR accuracy

### 3. Code Standards
```typescript
// ALWAYS use TypeScript with proper types
interface Question {
  id: string;
  topic: PhysicsTopic; // Use enums
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  // ... complete typing
}

// NEVER use 'any' type
// ALWAYS handle errors gracefully
// ALWAYS validate user input
// ALWAYS use KaTeX for LaTeX rendering
```

### 3.1 Database Migration Rules
```sql
-- CRITICAL: Minimize SQL migration files
-- ALWAYS update complete_schema.sql instead of creating new files
-- Only ONE master schema file should exist
-- Add new tables/changes to existing complete_schema.sql
-- Use IF NOT EXISTS and ON CONFLICT clauses for idempotency
```

### 4. AI/ML Development Rules
```javascript
// For every AI operation:
{
  "cost_tracking": true,      // Log API costs
  "caching": true,            // Cache responses (24hr TTL)
  "fallback": true,          // Have backup mechanism
  "quality_check": true,     // Validate output
  "monitoring": true         // Track performance
}
```

### 5. Mobile-First Approach
- 60% of users are on mobile devices
- Minimum tap target: 44px
- Touch-friendly interfaces
- Responsive breakpoints: 640px, 768px, 1024px

---

## 📁 Project Structure

```
mocktestai/
├── app/                    # Next.js app router
│   ├── api/               # API endpoints
│   ├── dashboard/         # User dashboard
│   ├── test/             # Test-taking interface
│   ├── results/          # Results display
│   ├── practice/         # Practice mode
│   └── admin/            # Admin panel
├── components/
│   ├── ui/               # Reusable UI components
│   ├── test/             # Test-specific components
│   └── questions/        # Question components
├── lib/
│   ├── supabase/         # Database client
│   └── utils/            # Utility functions
├── types/                # TypeScript definitions
└── styles/              # Global styles
```

---

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build           # Production build
npm run lint            # Run ESLint
npm run typecheck       # TypeScript checking

# Database
# Use Supabase dashboard SQL editor for migrations
# Files in /supabase/migrations/

# Git Workflow
git checkout -b feature/phase-1-[name]  # Branch naming
git status                               # Check changes
git add -A && git commit -m "feat: ..." # Commit format
```

---

## 🐛 Known Issues & Tech Debt

### High Priority (Phase 1)
1. **No OCR pipeline** - Need to implement for paper digitization
2. **Flat topic structure** - Need hierarchical taxonomy
3. **No previous year interface** - Required for Phase 1

### Medium Priority (Future Phases)
1. **No state management library** - Consider Zustand
2. **No error tracking** - Need Sentry integration
3. **No A/B testing** - Required for ML optimization
4. **No cost tracking** - Critical for AI operations

### Low Priority
1. **No dark mode** - CSS variables ready, implementation pending
2. **No offline support** - Consider PWA approach
3. **No i18n** - May need Hindi support later

---

## ⚠️ Critical Reminders

### DO's ✅
1. **ALWAYS read all context files first**
2. **Follow sequential phase development**
3. **Update PROGRESS_TRACKER.md after completing tasks**
4. **Focus on AI/ML capabilities over CRUD**
5. **Validate with success metrics before proceeding**
6. **Use TypeScript strictly - no 'any' types**
7. **Cache all AI responses**
8. **Track costs for every API call**

### DON'Ts ❌
1. **NEVER jump to future phase features**
2. **NEVER implement without reading current phase requirements**
3. **NEVER use MathJax (use KaTeX instead)**
4. **NEVER skip error handling**
5. **NEVER ignore mobile responsiveness**
6. **NEVER commit without testing**
7. **NEVER add features beyond scope**

---

## 📊 Success Metrics to Track

### Technical KPIs
- Page load time: <2s
- API response: <500ms
- Error rate: <1%
- Mobile performance: >90 Lighthouse score

### AI/ML KPIs (Future)
- Question generation: <3s
- OCR accuracy: >95%
- Pattern matching: >85%
- Cost per question: <₹2

### Business KPIs
- User activation: >50%
- 7-day retention: >40%
- Test completion: >70%
- Practice engagement: >3 sessions/week

---

## 🎯 Current Sprint Tasks (Phase 1)

Check [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) Section: "Current Sprint" for latest tasks.

**This Week's Priority:**
1. OCR tool selection and setup
2. Database schema for previous year questions
3. Admin interface for digitization
4. JEE Main 2024 papers collection (pilot)
5. Hierarchical taxonomy design

---

## 📞 Quick References

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.io/docs)
- [Claude API](https://docs.anthropic.com)
- [KaTeX](https://katex.org/docs)

### Project Links
- GitHub: github.com/nixpri/mocktestai
- Supabase Dashboard: app.supabase.io
- Vercel Deploy: vercel.com/dashboard

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY= (Phase 2)
OPENAI_API_KEY= (Phase 2)
REDIS_URL= (Phase 2)
```

---

## 🔄 Session Checklist

When starting a new session:
- [ ] Read README.md completely
- [ ] Read STRATEGIC_ANALYSIS.md for vision
- [ ] Read PROGRESS_TRACKER.md for current status
- [ ] Check current phase and sprint tasks
- [ ] Verify no features from future phases
- [ ] Update progress after completing tasks

---

*This is the master context file for MockTest AI development.*
*Always refer to this when making implementation decisions.*

*Last Updated: January 6, 2025*
*Current Phase: 1 - Data Foundation (5%)*
*Version: 4.0*