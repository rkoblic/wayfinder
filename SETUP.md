# Wayfinder Setup Guide

Complete step-by-step instructions to get Wayfinder running on your machine.

## ✅ What's Already Done

The entire application is built and ready to run:
- ✅ Full-stack Next.js application
- ✅ 8 API endpoints (all tested and working)
- ✅ 5 complete pages with UI
- ✅ Database schema with 7 tables
- ✅ Anthropic Claude AI integration
- ✅ Responsive design

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

You need a PostgreSQL database. Choose one of these options:

#### Option A: Local PostgreSQL (Recommended for Development)

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb wayfinder
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb wayfinder
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

#### Option B: Cloud Database (Recommended for Production)

Popular options:
- **Neon** (https://neon.tech) - Free tier, PostgreSQL, instant setup
- **Supabase** (https://supabase.com) - Free tier, includes auth
- **Railway** (https://railway.app) - Simple deployment
- **Vercel Postgres** (https://vercel.com/storage/postgres) - If deploying to Vercel

### 3. Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 4. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wayfinder?schema=public"

# Anthropic API Key - Paste your actual key here
ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"
```

**Examples for different database providers:**

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wayfinder?schema=public"

# Neon
DATABASE_URL="postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/wayfinder?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:pass@db.abcdefg.supabase.co:5432/postgres?pgbouncer=true"

# Railway
DATABASE_URL="postgresql://postgres:pass@containers-us-west-123.railway.app:5432/railway"
```

### 5. Set Up Database Tables

Generate Prisma client and create tables:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create all 7 tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

This will create:
- users
- idea_seeds
- nodes
- lateral_links
- micro_discoveries
- reflections
- self_narratives

### 6. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## 🎯 Using the Application

### Complete User Flow:

1. **Create an Idea Seed** (Home Page)
   - Enter a concept like "ikebana and negative space"
   - Click "Begin Exploration"

2. **Explore Lateral Connections** (Explore Page)
   - AI generates 4 sideways connections
   - Click on one that interests you

3. **Complete Micro-Discovery**
   - AI generates a reflective prompt
   - Respond with your thoughts (1-5 minutes)

4. **Add Reflection**
   - Capture what surprised you (optional)
   - Add a tag (required) like "systems", "aesthetics", etc.
   - Add a metaphor (optional)

5. **View Curiosity Map** (Map Page)
   - See all your concepts as nodes
   - Explore connections between ideas
   - Click on concepts to see their relationships

6. **Generate Self-Narrative** (Narrative Page)
   - AI analyzes your exploration patterns
   - Generates a personalized summary of how you think
   - Regenerate anytime as you explore more

## 🔧 Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list

# Linux:
systemctl status postgresql

# Test connection manually
psql -h localhost -U postgres -d wayfinder
```

**Error: "Database does not exist"**
```bash
createdb wayfinder
# OR
psql -U postgres -c "CREATE DATABASE wayfinder;"
```

### Prisma Issues

**Error: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Error: "Migration failed"**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev --name init
```

### API Key Issues

**Error: "Invalid API key"**
- Check that your `.env` file has the correct key
- Make sure it starts with `sk-ant-`
- Restart the dev server after changing `.env`

**Error: "Failed to generate lateral connections"**
- Verify your Anthropic API key is valid
- Check if you have available credits at https://console.anthropic.com/
- Look at server logs for specific error messages

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📊 Database Management

### View Database in Browser
```bash
npx prisma studio
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

### Create a New Migration
```bash
npx prisma migrate dev --name description_of_change
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com and import your repo
3. Add environment variables:
   - `DATABASE_URL` - Your production database URL
   - `ANTHROPIC_API_KEY` - Your API key
4. Deploy!

Vercel automatically detects Next.js and handles the build process.

### Deploy Database

For production, use:
- **Neon** - Free tier with 0.5GB storage
- **Supabase** - Free tier with 500MB storage
- **Railway** - Easy PostgreSQL deployment

Make sure to:
1. Update `DATABASE_URL` to production database
2. Run migrations: `npx prisma migrate deploy`
3. Keep `ANTHROPIC_API_KEY` secure

## 📝 Next Steps

After setup:
1. ✅ Create your first idea seed
2. ✅ Complete an exploration flow
3. ✅ View your curiosity map
4. ✅ Generate your self-narrative

## 🆘 Need Help?

- Check server logs in terminal
- Open browser console (F12) for frontend errors
- Review Prisma logs: `npx prisma studio`
- Check API responses: Network tab in browser DevTools

## 🎨 Customization Ideas

- **Colors**: Edit `tailwind.config.ts` to change the theme
- **LLM Model**: Update `MODEL` in `lib/llm/claude.ts`
- **Prompts**: Modify templates in `lib/llm/claude.ts`
- **Database**: Add fields to `prisma/schema.prisma`

---

**Need more help?** Open an issue or check the README.md for detailed documentation.
