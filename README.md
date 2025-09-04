# MockTest AI - AI-Powered Competitive Exam Preparation Platform

An advanced AI-driven mock test platform designed for Indian competitive exam aspirants (JEE, NEET, etc.), starting with JEE Physics. Our platform leverages machine learning models trained on decades of exam papers, official syllabi, and question patterns to generate intelligent, exam-relevant mock tests that adapt to each student's learning level.

![MockTest AI](https://img.shields.io/badge/MockTest-AI-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 🎯 Product Vision

MockTest AI is building the future of competitive exam preparation in India by combining:
- **AI Question Generation**: Models trained on 20+ years of JEE/NEET papers
- **Pattern Recognition**: Deep understanding of exam trends and question styles
- **Personalized Learning**: Adaptive difficulty based on individual performance
- **Comprehensive Coverage**: Starting with JEE Physics, expanding to all subjects

### Core Differentiators
1. **Exam-Authentic Questions**: AI generates questions indistinguishable from actual JEE papers
2. **Intelligent Adaptation**: Difficulty adjusts in real-time based on student performance
3. **Concept Mapping**: Questions tagged with detailed concept hierarchies for targeted practice
4. **Predictive Analytics**: ML models predict likely exam scores and weak areas

## 🚀 Current Features (Phase 0 - MVP Complete ✅)

### Core Platform
- **Authentication**: Google OAuth and email/password authentication via Supabase
- **User Dashboard**: Comprehensive stats, recent tests, quick links, performance metrics
- **Test System**: Full test-taking interface with timer, pause/resume, auto-save
- **Question Bank**: Admin panel for CRUD operations, bulk import (CSV/JSON)
- **Results & Review**: Detailed score analysis, question-by-question review with solutions
- **Analytics**: Performance charts, topic-wise breakdown, difficulty analysis

### Learning Features
- **Practice Mode**: Instant feedback, hints system, topic-wise practice
- **Formula Sheets**: LaTeX-rendered physics formulas with search functionality
- **Mobile Responsive**: Optimized for 60% mobile users with touch-friendly UI
- **Error Handling**: Graceful error boundaries, loading states, confirmation dialogs

## 🚧 In Development (Phase 1 - Data Foundation)

### Current Sprint (5% Complete)
- **OCR Pipeline**: Setting up Tesseract/Google Vision for paper digitization
- **Previous Year Papers**: Collecting 20+ years of JEE papers
- **Hierarchical Taxonomy**: Building comprehensive topic structure
- **Digitization Interface**: Admin tools for paper processing

## 🔮 Upcoming Features (Phase 2-7)

### Phase 2: AI Integration (Jan-Feb 2025)
- **Claude API Integration**: Haiku model for question generation
- **Prompt Engineering**: JEE-pattern specific prompts
- **Quality Validation**: AI output verification system
- **Response Caching**: Redis-based caching layer

### Phase 3-7: Advanced Platform (Feb-Jul 2025)
- **Pattern-Based Testing**: Generate tests from historical patterns
- **Adaptive Engine**: ML-based difficulty adjustment
- **Custom ML Models**: Fine-tuned LLaMA/Mistral for question generation
- **Rank Prediction**: AI-powered rank and score forecasting
- **Multi-Subject**: Chemistry, Mathematics, NEET subjects
- **Mobile App**: React Native application

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Google OAuth via Supabase Auth
- **AI/ML**: 
  - Anthropic Claude API (Phase 2)
  - Custom ML models with PyTorch (Phase 5)
- **Math Rendering**: KaTeX for LaTeX formulas
- **Charts**: Recharts for analytics
- **Deployment**: Vercel with Edge Network CDN
- **Caching**: Redis/Upstash (Phase 2)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nixpri/mocktestai.git
   cd mocktestai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   # Phase 2 onwards:
   # ANTHROPIC_API_KEY=your_anthropic_key
   ```

## 🗄️ Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**
   - Go to SQL Editor in Supabase Dashboard
   - Execute `/supabase/migrations/complete_schema.sql`

3. **The schema includes:**
   - User profiles with subscription tiers
   - Questions bank with LaTeX support
   - Test sessions and responses tracking
   - Performance analytics tables
   - Row Level Security policies

## 🔐 Authentication Setup

1. **Enable Google OAuth in Supabase**
   - Go to Authentication → Providers in Supabase
   - Enable Google provider

2. **Configure Google OAuth**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```
   - Copy Client ID and Secret to Supabase

3. **Update Supabase Auth Settings**
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/**`

## 🚀 Running the Application

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Open browser**
   ```
   http://localhost:3000
   ```

3. **Sign in with Google**
   - Click "Sign In"
   - Authenticate with Google
   - Access your personalized dashboard

## 📁 Project Structure

```
mocktestai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── test/              # Test-taking interface
│   ├── results/           # Results display
│   ├── practice/          # Practice mode
│   ├── admin/             # Admin panel
│   ├── analytics/         # Performance analytics
│   └── formulas/          # Formula sheets
├── components/            
│   ├── ui/               # Reusable UI components
│   ├── test/             # Test-specific components
│   └── questions/        # Question components
├── lib/                   
│   ├── supabase/         # Database client
│   └── utils/            # Utility functions
├── types/                # TypeScript definitions
├── styles/               # Global styles
└── supabase/
    └── migrations/       # Database schema

```

## 🎯 Development Roadmap

### ✅ Phase 0: MVP Foundation (COMPLETED)
- [x] Authentication system
- [x] Test-taking interface
- [x] Results and analytics
- [x] Practice mode
- [x] Admin panel
- [x] Mobile responsiveness

### 🚧 Phase 1: Data Foundation (5% Complete)
- [ ] OCR pipeline setup
- [ ] Previous year paper collection
- [ ] Hierarchical taxonomy
- [ ] Digitization interface

### ⏳ Phase 2-7: AI Platform (Upcoming)
- [ ] AI question generation
- [ ] Pattern recognition
- [ ] Adaptive learning
- [ ] ML models
- [ ] Predictive features
- [ ] Multi-subject expansion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/phase-1-amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/phase-1-amazing`)
5. Open a Pull Request

## 📝 Documentation

- **[PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)** - Detailed development roadmap and current status
- **[STRATEGIC_ANALYSIS.md](./STRATEGIC_ANALYSIS.md)** - Market analysis and business strategy
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant context and guidelines

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Nikunj Priyadarshi**
- GitHub: [@nixpri](https://github.com/nixpri)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Anthropic for Claude API
- JEE aspirants for the inspiration

---

**Current Status**: Phase 1 - Data Foundation (5% Complete)  
**Vision**: Building India's most advanced AI-driven exam preparation platform  
**Target**: ₹1 Crore ARR with 100K+ users by December 2025

Built with ❤️ for JEE aspirants