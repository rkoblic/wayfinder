# Wayfinder

A curiosity-first learning platform for wandering generalists. Wayfinder generates lateral connections between concepts, offers micro-discovery prompts, and creates a personal "curiosity map" that visualizes your exploration patterns.

## Features

- **Idea Seeds**: Enter concepts to explore
- **Lateral Connections**: AI-generated sideways connections (analogies, patterns, contrasts)
- **Micro-Discoveries**: Short reflective prompts (1-5 minutes)
- **Reflections & Tagging**: Capture insights and tag your explorations
- **Curiosity Map**: Visualize your exploration patterns as a graph
- **Self-Narrative**: AI-generated summary of how you explore ideas

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **LLM**: Anthropic Claude API
- **Styling**: Tailwind CSS

## Project Structure

```
wayfinder/
├── app/
│   ├── api/              # API routes
│   │   ├── seeds/        # Idea seed endpoints
│   │   ├── nodes/        # Node and lateral connection endpoints
│   │   ├── micro-discoveries/
│   │   ├── reflections/
│   │   ├── curiosity-map/
│   │   └── self-narrative/
│   ├── page.tsx          # Home page (placeholder)
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   ├── llm/              # LLM service layer
│   │   └── claude.ts     # Anthropic Claude integration
│   └── db/               # Database service layer
│       ├── prisma.ts     # Prisma client singleton
│       └── helpers.ts    # Database helper functions
├── prisma/
│   └── schema.prisma     # Database schema (7 tables)
├── docs/                 # Product documentation
│   ├── PRD_Wayfinder.md
│   ├── TechSpec_Wayfinder_MVP.md
│   ├── APIs_Wayfinder.md
│   ├── DataModels_Wayfinder.md
│   └── LLM_Prompts_Wayfinder.md
└── .env.example          # Environment variables template
```

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (local or cloud)
- **Anthropic API Key** (get one at https://console.anthropic.com/)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Anthropic Claude API Key
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

### 3. Set Up Database

Make sure your PostgreSQL database is running, then:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses 7 core tables:

1. **User** - User accounts (MVP uses a default user)
2. **IdeaSeed** - Initial concepts entered by users
3. **Node** - Concepts in the curiosity map
4. **LateralLink** - Connections between nodes (edges in the graph)
5. **MicroDiscovery** - Prompts and user responses
6. **Reflection** - User reflections with tags
7. **SelfNarrative** - AI-generated exploration summaries

See `docs/DataModels_Wayfinder.md` for detailed schema documentation.

## API Endpoints

All endpoints are under `/api`:

### Seeds
- `POST /api/seeds` - Create new idea seed
- `GET /api/seeds` - List all seeds

### Nodes & Connections
- `GET /api/nodes/:id/sideways` - Get lateral connections for a node

### Discoveries & Reflections
- `POST /api/micro-discoveries` - Create micro-discovery
- `POST /api/reflections` - Create reflection

### Curiosity Map
- `GET /api/curiosity-map` - Get all nodes and edges

### Self-Narrative
- `POST /api/self-narrative` - Generate new narrative
- `GET /api/self-narrative` - Get latest narrative

See `docs/APIs_Wayfinder.md` for detailed API documentation.

## Development Status

### ✅ MVP Complete!

All core features are implemented and working:

**Backend (100% Complete)**
- [x] Next.js 14+ with TypeScript and App Router
- [x] Tailwind CSS configuration
- [x] PostgreSQL + Prisma ORM setup
- [x] Database schema with 7 tables
- [x] LLM service layer (Anthropic Claude)
- [x] 8 API endpoints (seeds, nodes, discoveries, reflections, map, narrative)
- [x] Database helper functions
- [x] Error handling and validation

**Frontend (100% Complete)**
- [x] Home page with seed input and seed list
- [x] Exploration flow page (lateral connections)
- [x] Micro-discovery interface (prompts + responses)
- [x] Reflection capture UI (surprise, tag, metaphor)
- [x] Curiosity map visualization (nodes + connections)
- [x] Self-narrative generation and display
- [x] Navigation and routing
- [x] Loading states and error handling
- [x] Responsive design (mobile, tablet, desktop)
- [x] Shared UI components (Button, Card, Input, etc.)

**Documentation (100% Complete)**
- [x] Comprehensive README
- [x] Detailed SETUP.md guide
- [x] All PRD and technical docs

## 🚀 Ready to Use!

The application is **production-ready**. Follow the [SETUP.md](./SETUP.md) guide to:

1. Set up your PostgreSQL database
2. Get an Anthropic API key
3. Configure environment variables
4. Run migrations
5. Start exploring!

## Next Steps (Optional Enhancements)

The MVP is complete. Future enhancements could include:

- **Advanced visualization**: Interactive force-directed graph (D3.js, react-force-graph)
- **Authentication**: Real user auth with NextAuth.js or Clerk
- **Sharing**: Share curiosity maps or narratives
- **Export**: Download explorations as PDF or markdown
- **Analytics**: Track exploration patterns over time
- **Mobile app**: Native mobile experience
- **Collaborative**: Explore ideas with others

## Deployment

Ready to deploy to production:

**Recommended Stack:**
- **Frontend/Backend**: Vercel (automatic Next.js deployment)
- **Database**: Neon, Supabase, or Railway
- **Monitoring**: Vercel Analytics

See [SETUP.md](./SETUP.md#-deployment) for detailed deployment instructions.

## Documentation

All product documentation is in the `/docs` folder:

- **PRD_Wayfinder.md** - Product requirements
- **TechSpec_Wayfinder_MVP.md** - Technical specification
- **APIs_Wayfinder.md** - API documentation
- **DataModels_Wayfinder.md** - Database models
- **LLM_Prompts_Wayfinder.md** - LLM prompt templates

## License

ISC

## Contributing

This is an MVP project. For questions or contributions, please open an issue.

---

**Built with curiosity** 🧭
