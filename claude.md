# MockTest AI - Project Context for Claude

This file provides Claude with essential project context and should be read at the start of every session.

## 🎯 Project Overview

**MockTest AI** is an AI-powered competitive exam preparation platform for Indian students (JEE, NEET), starting with JEE Physics. We use machine learning models trained on historical exam papers to generate authentic mock tests that adapt to each student's learning level.

## 📚 Key Documents to Review

Please review these documents in order to understand the project:

1. **[README.md](./README.md)** - Product vision and technical setup
2. **[STRATEGIC_ANALYSIS.md](./STRATEGIC_ANALYSIS.md)** - Comprehensive strategic analysis and market research
3. **[PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)** - Detailed execution roadmap to ₹1 Crore ARR

## 🎯 Current Focus (September 2025)

### Recent Achievements (Sep 3, 2025)
✅ Complete UI/UX overhaul with Airbnb-inspired design system
✅ Implemented soft educational color palette (teal, green, blue)
✅ Fixed all padding and spacing issues across pages
✅ Enhanced LaTeX rendering for mathematical expressions
✅ Redesigned homepage with modern testimonials section

### Current Status
- **Development**: 40% complete (auth + database + UI/UX ready)
- **Design System**: Fully implemented with CSS variables
- **UI/UX**: Professional Airbnb-inspired design throughout
- **Target**: MVP by Sep 30, 2025

## 🏗️ Technical Stack

- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **AI**: Claude API (Haiku model for cost efficiency)
- **LaTeX**: KaTeX (already installed)
- **Deployment**: Vercel

## 💰 Business Model

- **Pricing**: ₹199/month (Pro), ₹999/month (Institute)
- **Target**: 45,000 users by Dec 2025
- **Goal**: ₹1 Crore ARR within 12 months

## 🚀 Development Phases

1. **Phase 1** (Jan): MVP with core test engine
2. **Phase 2** (Feb): Beta launch with 100 users
3. **Phase 3** (Mar): Paid launch
4. **Phase 4** (Apr-Jun): Add Chemistry & Math
5. **Phase 5** (Jul-Dec): Scale to 45K users

## 🎯 Success Metrics

- **Technical**: <2s page load, <1% error rate
- **Business**: ₹200 CAC, 15% conversion rate
- **Engagement**: 70% 7-day retention, NPS >50

## 🔧 Common Commands

```bash
# Development
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run linting

# Database
# Run scripts/database-schema.sql in Supabase SQL editor

# Git workflow
git checkout -b feature/[name]  # Create feature branch
git status                       # Check current status
```

## 📝 Code Conventions

- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS with CSS variables and Airbnb utilities
- **Design System**: See `/styles/AIRBNB_STYLE_GUIDE.md` for patterns
- **Color Palette**: Soft educational colors (teal primary, green success)
- **State**: Zustand for client state, Supabase for server state
- **API**: Next.js API routes in `/app/api/`
- **Types**: Define in `/types/index.ts`

## ⚠️ Important Notes

1. **Never use `any` type** - Replace with proper TypeScript types
2. **Always check user authentication** before protected routes
3. **Use KaTeX for LaTeX rendering** (not MathJax)
4. **Cache AI responses** to reduce API costs
5. **Mobile-first design** - 60% users on phones

## 🐛 Known Issues

1. No middleware for route protection (TODO)
2. Generic metadata in layout.tsx (needs update)
3. Empty component directories (needs structure)
4. No error boundaries implemented
5. Some files missing newline at end (linter warnings)

## 📞 Quick References

- **Supabase Project**: [Dashboard](https://app.supabase.io)
- **GitHub Repo**: github.com/nixpri/mocktestai
- **Vercel Deploy**: [Dashboard](https://vercel.com)
- **Claude API**: [Console](https://console.anthropic.com)

## 🎯 Today's Focus

Check [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) for today's specific tasks and sprint goals.

---

*This context file helps Claude understand the MockTest AI project quickly. Update it regularly with important changes.*