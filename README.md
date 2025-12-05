# FreshGrad Tracker (Talent Tracking System)

A comprehensive web application for managing student journeys from application through training to hiring and deployment. Built for MOE-ECAE talent management.

## 🚀 Live Application

**Production:** https://freshgrad-tracker-v2.onrender.com

## ✨ Features

### Core Functionality
- **User Authentication** - Registration, login, role-based access control
- **Applicant Management** - Student applications with accept/reject workflow
- **Candidate Tracking** - Track students through training programs
- **Course Management** - Create and manage training courses
- **Mentor Assignment** - Assign mentors to candidates
- **Results Upload** - Bulk upload training results via Excel
- **Graduation Review** - Review and graduate candidates
- **Hiring Tracker** - Track candidates through hiring pipeline
- **News/Updates** - Post announcements with category filters

### User Experience
- Responsive design (mobile-friendly)
- Real-time data updates
- Excel import/export
- Dashboard with statistics
- Notification system

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL |
| Hosting | Render.com |

## 📁 Project Structure

```
freshgrad-tracker-v2/
├── src/                    # React frontend source
│   ├── App.jsx             # Main app with all pages
│   ├── providers/          # Auth & state management
│   └── components/         # Reusable UI components
├── public/                 # Static assets
├── docs/                   # Documentation
├── server-db.cjs           # Express server + PostgreSQL
├── render.yaml             # Render deployment config
└── package.json            # Dependencies
```

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Render's hosted database)

### Local Development

```bash
# Clone repository
git clone https://github.com/lazytitan21/freshgrad-tracker-v2.git
cd freshgrad-tracker-v2

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Start development
npm run dev      # Frontend (port 5173)
npm run server   # Backend (port 3000)
```

## 👥 User Roles

| Role | Access |
|------|--------|
| Admin | Full access, user management |
| ECAE Manager | Candidates, courses, hiring |
| ECAE Trainer | Courses, results upload |
| Auditor | Read-only, exports |
| Student | Own profile, enrollment |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [GETTING-STARTED.md](./docs/GETTING-STARTED.md) | **New user setup guide** - complete walkthrough |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide for Render |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Common issues & solutions |
| [API.md](./docs/API.md) | Complete API reference |
| [DATABASE.md](./docs/DATABASE.md) | Database schema |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Development guide |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history |

## 🔧 Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run server   # Start Express server
npm start        # Start server (production)
```

## 🚀 Deployment

The app deploys automatically to Render on push to `main`:

1. Push code to GitHub
2. Render detects changes
3. Builds frontend (`npm run build`)
4. Starts server (`node server-db.cjs`)
5. Available at production URL

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for details.

## 🔌 API Quick Reference

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET/POST /api/users` | User management |
| `GET/POST /api/candidates` | Candidate management |
| `GET/POST /api/courses` | Course management |
| `GET/POST /api/mentors` | Mentor management |
| `GET/POST /api/news` | News/updates |

See [API.md](./docs/API.md) for full reference.

## 📝 License

MIT License

---

