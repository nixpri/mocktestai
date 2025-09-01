# MockTest AI - JEE Physics Portal

AI-powered mock test platform for JEE Main Physics preparation with adaptive learning and personalized question generation.

![MockTest AI](https://img.shields.io/badge/MockTest-AI-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 🚀 Features

- **AI-Powered Questions**: Intelligent question generation based on JEE patterns
- **Google Authentication**: Secure, one-click sign-in with Google OAuth
- **Adaptive Learning**: Questions adapt to your performance level
- **Performance Analytics**: Track progress and identify weak areas
- **Real-time Dashboard**: Monitor your preparation journey
- **Physics Topics Coverage**: Complete JEE Main Physics syllabus

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Google OAuth via Supabase
- **AI Integration**: Ready for Hugging Face/OpenAI integration
- **Deployment**: Vercel-ready

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
   ```

## 🗄️ Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents from `scripts/database-schema.sql`
   - Execute the SQL

3. **The schema includes:**
   - User profiles with subscription tiers
   - Physics topics and subtopics hierarchy
   - Questions bank with AI embeddings support
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
│   ├── auth/              # Authentication pages
│   │   ├── page.tsx       # Google OAuth sign-in
│   │   └── callback/      # OAuth callback handler
│   ├── dashboard/         # User dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── test/             # Test-taking components
│   └── questions/        # Question components
├── lib/                   # Utilities
│   └── supabase/         # Supabase client config
├── scripts/              # Database scripts
│   └── database-schema.sql
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🎯 Roadmap

- [x] Basic project setup
- [x] Google OAuth authentication
- [x] Database schema
- [x] User dashboard
- [ ] Test-taking interface
- [ ] Question display with LaTeX
- [ ] AI question generation
- [ ] Performance analytics
- [ ] Payment integration
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Nikunj Priyadarshi**
- GitHub: [@nixpri](https://github.com/nixpri)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Google for OAuth services
- JEE aspirants for the inspiration

---

Built with ❤️ for JEE aspirants