# Architecture Overview

System architecture and design documentation for FreshGrad Tracker.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Application                         ││
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────────────────────┐ ││
│  │  │ Pages   │  │ Providers   │  │ Components               │ ││
│  │  │ (Views) │  │ (State)     │  │ (Reusable UI)            │ ││
│  │  └────┬────┘  └──────┬──────┘  └──────────────────────────┘ ││
│  │       │              │                                       ││
│  │       └──────────────┼───────────────────────────────────────┤│
│  │                      │                                       ││
│  │              ┌───────▼───────┐                               ││
│  │              │  API Client   │                               ││
│  │              │  (fetch)      │                               ││
│  │              └───────┬───────┘                               ││
│  └──────────────────────┼───────────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Render.com Platform                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 Express.js Server                            ││
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐   ││
│  │  │ Static Files    │  │ API Routes                      │   ││
│  │  │ (React Bundle)  │  │ /api/users, /api/candidates...  │   ││
│  │  └─────────────────┘  └──────────────┬──────────────────┘   ││
│  │                                      │                       ││
│  │                              ┌───────▼───────┐               ││
│  │                              │  pg (Pool)    │               ││
│  │                              └───────┬───────┘               ││
│  └──────────────────────────────────────┼───────────────────────┘│
│                                         │                        │
│  ┌──────────────────────────────────────▼───────────────────────┐│
│  │                    PostgreSQL Database                        ││
│  │  ┌─────────┐ ┌────────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ ││
│  │  │ users   │ │ candidates │ │ courses │ │ mentors │ │ news │ ││
│  │  └─────────┘ └────────────┘ └─────────┘ └─────────┘ └──────┘ ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | React 18 | Component-based UI |
| Build Tool | Vite 5 | Fast development & bundling |
| Styling | Tailwind CSS | Utility-first CSS |
| Animations | Framer Motion | Smooth transitions |
| Icons | Lucide React | Icon library |
| State | React Context | Global state management |
| HTTP | Fetch API | API communication |

### Component Structure

```
src/
├── App.jsx              # Main app + all pages
├── main.jsx             # React entry point
├── index.css            # Global styles + Tailwind
│
├── providers/
│   ├── AuthProvider.jsx   # Authentication context
│   └── StoreProvider.jsx  # Data/state context
│
├── components/
│   └── CandidateDrawer.jsx  # Reusable components
│
├── config/
│   └── api.js           # API configuration
│
└── utils/
    └── helpers.js       # Utility functions
```

### State Management

The app uses React Context for global state:

```
┌─────────────────────────────────────────┐
│              App Component              │
│  ┌───────────────────────────────────┐  │
│  │          AuthProvider             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │       StoreProvider         │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │    Page Components    │  │  │  │
│  │  │  │    (Dashboard, etc.)  │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**AuthProvider** manages:
- Current user
- Login/logout
- Session persistence (localStorage)

**StoreProvider** manages:
- Candidates list
- Courses list
- Mentors list
- News/updates
- API operations (CRUD)

### Data Flow

```
User Action (click, form submit)
         │
         ▼
┌─────────────────┐
│ Component calls │
│ context method  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ StoreProvider   │
│ API call        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ fetch() to      │
│ /api/endpoint   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update state    │
│ setState()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React re-render │
│ UI updates      │
└─────────────────┘
```

## Backend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express 4 | Web framework |
| Database | PostgreSQL | Relational database |
| DB Driver | pg (node-postgres) | PostgreSQL client |

### Server Structure

```javascript
// server-db.cjs

// 1. Dependencies
const express = require('express');
const { Pool } = require('pg');

// 2. Database Connection
const pool = new Pool({ connectionString: DATABASE_URL });

// 3. Middleware
app.use(express.json());
app.use(cors());

// 4. Database Initialization
async function initDatabase() {
  // Create tables
  // Run migrations
}

// 5. API Routes
app.get('/api/users', ...);
app.post('/api/users', ...);
// etc.

// 6. Static Files
app.use(express.static('dist'));

// 7. SPA Fallback
app.get('*', (req, res) => res.sendFile('dist/index.html'));

// 8. Start Server
app.listen(PORT);
```

### Request Flow

```
HTTP Request
     │
     ▼
┌─────────────────┐
│ Express Router  │
└────────┬────────┘
     │
     ├──► /api/* ──► API Handler ──► Database Query ──► JSON Response
     │
     └──► /* ──► Static File / SPA index.html
```

### Database Connection Pool

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // Required for Render
  max: 20,                              // Max connections
  idleTimeoutMillis: 30000,            // Close idle connections
  connectionTimeoutMillis: 2000,        // Timeout for new connections
});
```

## API Design

### RESTful Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | /api/resource | List all |
| GET | /api/resource/:id | Get one |
| POST | /api/resource | Create |
| PUT | /api/resource/:id | Update |
| DELETE | /api/resource/:id | Delete |

### Response Format

**Success:**
```json
{
  "id": "...",
  "field": "value",
  ...
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

### JSONB for Flexibility

Using JSONB columns for flexible data:

```javascript
// Candidate with flexible data
{
  id: "CND-001",
  name: "Student Name",
  enrollments: [...],      // JSONB array
  hiring: {...},           // JSONB object
  candidate_data: {...}    // JSONB catch-all
}
```

## Security Considerations

### Current Implementation

| Aspect | Status | Notes |
|--------|--------|-------|
| HTTPS | ✅ | Render provides SSL |
| CORS | ⚠️ | Currently allows all origins |
| Auth | ⚠️ | Simple email/password |
| Passwords | ⚠️ | Stored as plain text (should hash) |
| SQL Injection | ✅ | Using parameterized queries |
| XSS | ✅ | React escapes by default |

### Recommendations for Production

1. **Hash passwords** with bcrypt
2. **Implement JWT** for session management
3. **Restrict CORS** to specific origins
4. **Add rate limiting** to prevent abuse
5. **Implement input validation** on server

## Scalability

### Current Limits (Render Free Tier)

- Web Service: 750 hours/month
- Database: 1 GB storage, 256 MB RAM
- Spin-down: After 15 minutes inactive

### Scaling Options

1. **Upgrade Render Plan** for:
   - Always-on service
   - More database resources
   - Auto-scaling

2. **Database Optimization**:
   - Add indexes for frequently queried columns
   - Implement connection pooling (already done)
   - Consider read replicas for heavy read loads

3. **Caching**:
   - Add Redis for session storage
   - Cache frequently accessed data

## Deployment Pipeline

```
Developer Machine          GitHub              Render
      │                      │                   │
      │  git push            │                   │
      ├─────────────────────►│                   │
      │                      │  webhook          │
      │                      ├──────────────────►│
      │                      │                   │
      │                      │         ┌─────────┴─────────┐
      │                      │         │ 1. npm install    │
      │                      │         │ 2. npm run build  │
      │                      │         │ 3. Start server   │
      │                      │         │ 4. Health check   │
      │                      │         └─────────┬─────────┘
      │                      │                   │
      │                      │   deploy complete │
      │◄─────────────────────┴───────────────────┤
```

## File Serving

### Static Assets

```
public/
├── Heros/          # Hero images
│   ├── hero.JPG
│   ├── Hero2.JPG
│   └── ...
└── users.json      # (Legacy)
```

Served by Express static middleware:
```javascript
app.use(express.static(path.join(__dirname, 'dist')));
```

### SPA Routing

All non-API routes serve index.html:
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

This enables client-side routing to work after page refresh.

---

## Technology Decisions

### Why React?
- Component-based architecture
- Large ecosystem
- Easy state management with Context
- Great developer experience

### Why Vite?
- Fast development server (HMR)
- Quick builds with Rollup
- Modern ES modules support
- Easy configuration

### Why Express?
- Lightweight and flexible
- Large middleware ecosystem
- Easy to understand
- Great for APIs

### Why PostgreSQL?
- Reliable and mature
- JSONB support for flexibility
- Free tier on Render
- Good performance

### Why Render?
- Easy deployment from GitHub
- Managed PostgreSQL included
- Free tier available
- Auto-deploy on push

---

**Last Updated:** December 2024
