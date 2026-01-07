# Architecture Overview

System architecture and design documentation for Talent Tracker (MOE Professional Development Platform).

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
│                    Render.com / Supabase                         │
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
│  │              Supabase PostgreSQL Database                     ││
│  │  ┌───────┐ ┌────────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐  ││
│  │  │ users │ │ candidates │ │ courses │ │ mentors │ │ roles │  ││
│  │  └───────┘ └────────────┘ └─────────┘ └─────────┘ └───────┘  ││
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
├── App.jsx              # Main app + all page components
├── main.jsx             # React entry point
├── index.css            # Global styles + Tailwind + Design System
│
├── providers/
│   ├── AuthProvider.jsx   # Authentication context (login, register, users)
│   └── StoreProvider.jsx  # Data/state context (candidates, courses, mentors, roles)
│
├── components/
│   ├── CandidateDrawer.jsx   # Candidate detail drawer
│   ├── LoadingComponents.jsx # Loading spinners and skeletons
│   └── Toast.jsx             # Toast notification system
│
├── pages/
│   ├── CandidatesPage.jsx    # Candidates management
│   ├── Dashboard.jsx         # Main dashboard
│   ├── LoginPage.jsx         # Login page (professional design)
│   ├── MentorsPage.jsx       # Mentors management
│   └── UsersManagementPage.jsx # User administration
│
├── config/
│   └── api.js           # API configuration & endpoints
│
└── utils/
    └── helpers.js       # Utility functions
```

### Pages in App.jsx

The main `App.jsx` contains all major page components:

| Page | Description | Permissions |
|------|-------------|-------------|
| `Dashboard` | KPI cards, charts, welcome header, bottlenecks | dashboard |
| `CandidatesPage` | Candidate table with search, filters, CRUD | candidates |
| `ApplicantsPage` | Job application management | applicants |
| `CoursesPage` | Training course management | courses |
| `CourseEnrollmentPage` | Enroll candidates in courses | enrollment |
| `MentorsPage` | Mentor management with details | mentors |
| `ResultsUploadPage` | Upload training results | results |
| `GraduationReviewPage` | Review graduation status | graduation |
| `ImportPage` | Bulk data import | import |
| `ExportsPage` | Export reports and data | exports |
| `HiringTrackerPage` | Track hiring pipeline | hiring |
| `UsersPage` | Platform user management | users |
| `RoleManagementPage` | Configure roles and permissions | roles |
| `SettingsPage` | User profile settings | settings |

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

**AuthProvider** (`src/providers/AuthProvider.jsx`) manages:
- Current user session
- Login/logout/register
- User CRUD for admins
- Session persistence (localStorage)
- Profile updates

**StoreProvider** (`src/providers/StoreProvider.jsx`) manages:
- `candidates` - Candidate data and CRUD operations
- `courses` - Course data and CRUD operations
- `mentors` - Mentor data and CRUD operations
- `roles` - Role definitions with permissions (from database)
- `publicNews` - News/updates
- `notifications` - In-app notifications
- Loading states for each data type

### Permission System

Permissions are stored in the `roles` table in the database and fetched at app load:

```javascript
// Role structure from database
{
  id: "admin",
  name: "Admin",
  description: "Full system access",
  color: "indigo",
  permissions: ["dashboard", "candidates", "courses", ...],
  is_system: true
}

// In AppShell component
const { roles } = useStore();
const roleData = roles.find(r => r.name === userRole);
const allowed = roleData?.permissions || FALLBACK_PERMISSIONS[userRole] || [];

// Navigation items filtered by permissions
const visibleItems = section.items.filter(item => allowed.includes(item.id));
```

### Navigation Structure

Sidebar navigation is organized into collapsible sections:

```javascript
const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: 'Home' }]
  },
  {
    id: 'people',
    label: 'People Management',
    items: [
      { id: 'candidates', label: 'Candidates', icon: 'Users' },
      { id: 'applicants', label: 'Applicants', icon: 'UserPlus' },
      { id: 'mentors', label: 'Mentors', icon: 'Award' }
    ]
  },
  {
    id: 'training',
    label: 'Training & Courses',
    items: [
      { id: 'courses', label: 'Courses', icon: 'BookOpen' },
      { id: 'enrollment', label: 'Enrollment', icon: 'ClipboardList' },
      { id: 'results', label: 'Upload Results', icon: 'UploadCloud' }
    ]
  },
  {
    id: 'workflow',
    label: 'Workflow',
    items: [
      { id: 'import', label: 'Import Data', icon: 'FilePlus' },
      { id: 'graduation', label: 'Graduation Review', icon: 'GraduationCap' },
      { id: 'hiring', label: 'Hiring Tracker', icon: 'Briefcase' }
    ]
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'exports', label: 'Reports & Exports', icon: 'Download' },
      { id: 'users', label: 'Platform Users', icon: 'User' },
      { id: 'roles', label: 'Role Management', icon: 'Shield' },
      { id: 'settings', label: 'Settings', icon: 'Settings' }
    ]
  }
];
```

## Backend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express 4 | Web framework |
| Database | PostgreSQL (Supabase) | Relational database |
| DB Driver | pg (node-postgres) | PostgreSQL client |

### Server Structure (`server-db.cjs`)

```javascript
// 1. Dependencies
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // For local development

// 2. Database Connection (Supabase)
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 3. Middleware
app.use(express.json());
app.use(cors());

// 4. Database Initialization
async function initDatabase() {
  // Create tables: users, candidates, courses, mentors, roles, news
  // Run migrations for new columns
  // Seed default roles
}

// 5. API Routes organized by entity:
// - Users: /api/users, /api/users/auth/login, /api/users/auth/register
// - Candidates: /api/candidates (CRUD)
// - Courses: /api/courses (CRUD)
// - Mentors: /api/mentors (CRUD)
// - Roles: /api/roles (CRUD)
// - News: /api/news (CRUD)
// - Health: /health

// 6. Static Files (production)
app.use(express.static('dist'));

// 7. SPA Fallback
app.get('*', (req, res) => res.sendFile('dist/index.html'));

// 8. Start Server
app.listen(PORT);
```

### Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Platform user accounts | id, email, password, name, role, profile_data |
| `candidates` | Training candidates | id, name, eid, emirate, school, status, cohort |
| `courses` | Training courses | id, name, code, hours, description, category |
| `mentors` | Mentor profiles | id, name, email, subject, emirate, experience_years, availability |
| `roles` | Role definitions | id, name, description, color, permissions (JSONB), is_system |
| `news` | News/announcements | id, title, content, created_at |

### API Endpoints

#### Users
- `GET /api/users` - List all users (admin only)
- `POST /api/users/auth/register` - Register new user
- `POST /api/users/auth/login` - Login (returns user data)
- `GET /api/users/email/:email` - Get user by email
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

#### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Mentors
- `GET /api/mentors` - List all mentors
- `POST /api/mentors` - Create mentor
- `PUT /api/mentors/:id` - Update mentor
- `DELETE /api/mentors/:id` - Delete mentor

#### Roles
- `GET /api/roles` - List all roles with permissions
- `POST /api/roles` - Create custom role
- `PUT /api/roles/:id` - Update role permissions
- `DELETE /api/roles/:id` - Delete custom role (not system roles)

## Design System

### CSS Variables (defined in `src/index.css`)

```css
:root {
  /* Brand Colors */
  --brand-primary: #4f46e5;      /* Indigo */
  --brand-primary-dark: #4338ca;
  --brand-primary-light: #818cf8;
  --brand-secondary: #0891b2;    /* Cyan */
  --brand-accent: #059669;       /* Emerald */

  /* Semantic Colors */
  --success: #059669;
  --warning: #d97706;
  --error: #dc2626;
  --info: #0284c7;

  /* Neutral Colors */
  --bg: #f8fafc;
  --bg-secondary: #f1f5f9;
  --panel: #ffffff;
  --muted: #64748b;
  --text: #0f172a;
  --text-secondary: #475569;
  --border: #e2e8f0;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
}
```

### UI Component Classes

```css
/* Buttons */
.btn { /* Base button styles */ }
.btn-primary { /* Indigo gradient button */ }
.btn-secondary { /* White/outline button */ }
.btn-success { /* Green button */ }
.btn-danger { /* Red button */ }

/* Forms */
.form-input { /* Text input styling */ }
.form-label { /* Label styling */ }
.form-select { /* Select dropdown */ }

/* Cards */
.panel { /* White card with shadow */ }
.card-hover { /* Hover effect */ }

/* Status badges */
.badge { /* Base badge */ }
.badge-success, .badge-warning, .badge-error, .badge-info
```

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Create .env file with Supabase connection
echo "DATABASE_URL=postgresql://..." > .env
echo "PORT=3001" >> .env

# Run both servers
npm run dev:full   # Runs backend + frontend concurrently

# Or run separately:
npm run dev:server  # Backend on port 3001
npm run dev         # Frontend on port 5173
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://user:pass@host:6543/postgres` |
| `PORT` | Server port | `3001` (local) or `8080` (Render) |
| `NODE_ENV` | Environment | `development` or `production` |

### Deployment (Render)

1. Push to GitHub main branch
2. Render auto-deploys from GitHub
3. Environment variables configured in Render dashboard
4. Build: `npm install && npm run build`
5. Start: `node server-db.cjs`

## Key Features

### Role-Based Access Control
- Roles stored in database with customizable permissions
- System roles (Admin, ECAE Manager, ECAE Trainer, Auditor) protected from deletion
- Custom roles can be created with specific permission sets
- Sidebar navigation filtered by user's role permissions

### Real-time Data
- StoreProvider fetches all data on app mount
- Loading states for each data type
- Optimistic UI updates for better UX

### Toast Notifications
- Success, error, warning, info types
- Auto-dismiss with configurable duration
- Stacked notifications

### Responsive Design
- Mobile-friendly sidebar (hidden on small screens)
- Responsive tables and forms
- Touch-friendly UI elements
