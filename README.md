# Victory Learning Hub — AI-Powered Educational Platform

An after-hours AI learning platform for Victory International Schools, featuring an AI tutor chatbot, textbook integration, quizzes, and gamification.

---

## What's Included (Ready to Deploy)

| Feature | Status | Description |
|---------|--------|-------------|
| AI Chatbot | ✅ Built | Ask questions about textbook content, powered by DeepSeek |
| Textbook Library | ✅ Built | Upload PDFs, browse chapters, search content |
| Quiz System | ✅ Built | AI-generated quizzes from your textbook material |
| Gamification | ✅ Built | XP, levels, badges, streak tracking |
| Multilingual | ✅ Built | English, Arabic, Urdu, Hindi, French |
| Student Dashboard | ✅ Built | Progress tracking, quick actions |
| PDF Processor | ✅ Built | Script to extract text from textbook PDFs |
| Database Schema | ✅ Built | Supabase tables for auth, progress, chat history |

---

## Setup Guide (30 minutes)

### Prerequisites

You need these installed on your computer:
- **Node.js** (version 18 or newer) — Download from https://nodejs.org
- A text editor — We recommend VS Code from https://code.visualstudio.com

### Step 1: Get API Keys (10 minutes)

#### A) DeepSeek API Key (Required — for AI chatbot)
1. Go to https://platform.deepseek.com
2. Create a free account
3. Go to API Keys → Create New Key
4. Copy the key (starts with `sk-...`)
5. Add $5-10 credit (this will last weeks of student usage)

#### B) Supabase Project (Optional — for saving student data)
1. Go to https://supabase.com
2. Create a free account → New Project
3. Name it "victory-learning" → Choose a strong password → Region: closest to you
4. Wait for project to set up (~2 minutes)
5. Go to Settings → API → Copy:
   - Project URL (looks like `https://abc123.supabase.co`)
   - `anon` public key
   - `service_role` key
6. Go to SQL Editor → New Query → Paste contents of `supabase/schema.sql` → Click Run

> **Note:** The platform works WITHOUT Supabase — student data just won't persist between sessions.

### Step 2: Install & Configure (5 minutes)

Open a terminal/command prompt in this folder and run:

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Now edit `.env.local` with your text editor and fill in:

```
DEEPSEEK_API_KEY=sk-your-actual-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Add Your Textbooks (5 minutes)

**Option A: Use Demo Content**
Just click "Load Demo Books" in the Library. Sample Science and Math content is built in.

**Option B: Upload Your PDF Textbooks**
1. Create the `textbook-data/` folder in the project root
2. Copy your PDF textbooks into it
3. Run:
```bash
npm run process-pdfs
```
4. This creates `public/textbooks.json` with extracted text
5. Upload this JSON file in the Library page

**Option C: Manual JSON**
Create a JSON file with this format:
```json
[
  {
    "title": "Forces and Motion",
    "chapter": "Science Grade 8",
    "page": 1,
    "content": "Force is a push or pull upon an object..."
  }
]
```

### Step 4: Run Locally (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the dashboard!

### Step 5: Deploy to the Internet (10 minutes)

The simplest option is **Vercel** (free tier handles ~100 students easily):

1. Create a GitHub account if you don't have one: https://github.com
2. Install Git: https://git-scm.com
3. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Victory Learning Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/victory-learning.git
git push -u origin main
```
4. Go to https://vercel.com → Sign up with GitHub
5. Click "New Project" → Import your repository
6. Add Environment Variables:
   - Click "Environment Variables"
   - Add each variable from your `.env.local` file
7. Click "Deploy"
8. Your platform will be live at `https://victory-learning.vercel.app` (or similar)

---

## How It Works

### AI Chatbot Flow
```
Student asks question
    → Platform searches textbook content (keyword matching)
    → Top 3 relevant sections sent as context
    → DeepSeek generates answer using textbook content
    → Answer displayed with source references
    → Student earns 5 XP per question
```

### Quiz Generation Flow
```
Student selects topic + difficulty
    → Textbook content for that topic gathered
    → DeepSeek generates 5 multiple-choice questions
    → Student answers questions interactively
    → Score calculated, XP awarded (10 per correct, 20 bonus)
    → Results saved to quiz history
```

---

## Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| DeepSeek API | ~$5-20/month | $0.27/million tokens. 100 students asking 10 questions/day ≈ $5/month |
| Vercel Hosting | $0 | Free tier. Upgrade to $20/month if you exceed 100GB bandwidth |
| Supabase | $0 | Free tier gives 500MB database, 50K monthly active users |
| Domain Name | $10-15/year | Optional. Buy from Namecheap or GoDaddy |
| **Total** | **~$5-20/month** | vs. $13,000-$50,000 estimated in original plan |

---

## What Requires External Work

These features were mentioned in the original plan but need additional services beyond what Claude Pro can build:

### 1. AI Teacher Avatars (Video/Voice)
**What's needed:** Animated teacher avatars that speak responses
**Options:**
- **HeyGen** (https://heygen.com) — $24/month, create talking avatar videos
- **D-ID** (https://d-id.com) — $5.90/month, generate avatar videos from text
- **Integration:** Add an API call after the chatbot response to generate a video version
- **Estimated work:** 2-3 hours for a developer to integrate the API

### 2. User Authentication (Student Login)
**What's needed:** Secure student login system
**Options:**
- **Supabase Auth** (free) — Already configured in the schema. Add login pages.
- **Ask Claude** to generate the login/signup components in a follow-up conversation
- **Estimated work:** 1-2 hours with Claude's help

### 3. Google Classroom Integration
**What's needed:** Sync with existing school LMS
**Options:**
- Google Classroom API (free, requires Google Workspace admin approval)
- **Estimated work:** 4-8 hours for a developer

### 4. Advanced PDF Processing (Diagrams/Images)
**What's needed:** Extract images, charts, and diagrams from PDFs
**Current:** Text-only extraction
**Options:**
- Use **Adobe PDF Services API** ($0.05/page) for advanced extraction
- Use **GPT-4 Vision** to describe images in textbooks
- **Estimated work:** 2-4 hours

### 5. Mobile App
**What's needed:** iOS/Android app
**Options:**
- The current platform is **mobile-responsive** and works in phone browsers
- For a native app: Use **Capacitor** (free) to wrap the web app
- **Estimated work:** 4-6 hours with Claude's help

---

## Project Structure

```
victory-platform/
├── src/
│   ├── app/
│   │   ├── layout.jsx          ← Root HTML layout
│   │   ├── page.jsx            ← Main page (orchestrates components)
│   │   ├── globals.css         ← Design system & styles
│   │   └── api/
│   │       ├── chat/route.js   ← AI chatbot endpoint
│   │       ├── quiz/route.js   ← Quiz generation endpoint
│   │       └── upload/route.js ← File upload endpoint
│   ├── components/
│   │   ├── Sidebar.jsx         ← Navigation sidebar
│   │   ├── Dashboard.jsx       ← Student home view
│   │   ├── ChatBot.jsx         ← AI tutor chat interface
│   │   ├── TextbookLibrary.jsx ← Textbook upload & browsing
│   │   ├── QuizSystem.jsx      ← Interactive quiz system
│   │   ├── Achievements.jsx    ← Badges & XP tracking
│   │   └── Notification.jsx    ← Toast notifications
│   ├── lib/
│   │   ├── deepseek.js         ← DeepSeek API client
│   │   ├── supabase.js         ← Supabase database client
│   │   └── textbookSearch.js   ← Textbook content search
│   └── contexts/
│       └── AppContext.jsx      ← Global state management
├── supabase/
│   └── schema.sql              ← Database tables & security
├── scripts/
│   └── process-pdfs.mjs        ← PDF text extraction script
├── textbook-data/              ← Place your PDFs here
├── public/                     ← Static files & processed textbooks
├── .env.example                ← Environment variables template
├── package.json                ← Dependencies & scripts
└── README.md                   ← This file
```

---

## Next Steps (Come Back to Claude For These)

You can ask Claude to build these additions in follow-up conversations:

1. **"Add student login/signup pages"** — Claude can generate the auth components
2. **"Add a teacher admin panel"** — For teachers to upload content and view student progress
3. **"Add text-to-speech to the chatbot"** — Browser-native TTS, no API needed
4. **"Make the chatbot remember conversation history"** — Persist across sessions
5. **"Add a parent progress report page"** — Weekly email summaries
6. **"Create a mobile-friendly version"** — Optimize the responsive layout

---

## Troubleshooting

**"AI chatbot says it's not configured"**
→ Check that DEEPSEEK_API_KEY is set in `.env.local` and restart the server

**"npm install fails"**
→ Make sure Node.js 18+ is installed: `node --version`

**"Quiz generation returns fallback question"**
→ DeepSeek API key issue. Check your API balance at platform.deepseek.com

**"PDF processing produces empty results"**
→ Some PDFs use images for text (scanned pages). Use Adobe Acrobat to OCR them first.

---

Built with ❤️ for Victory International Schools — Dammam, Saudi Arabia
