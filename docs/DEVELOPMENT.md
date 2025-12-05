# Development Guide

Guide for local development of the FreshGrad Tracker application.

## Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (comes with Node.js)
- **Git** for version control
- **PostgreSQL** (optional for local DB, or use Render)
- **VS Code** (recommended editor)

### Verify Installation

```bash
node --version    # Should be v18.x.x or higher
npm --version     # Should be 9.x.x or higher
git --version     # Any recent version
```

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/lazytitan21/freshgrad-tracker-v2.git
cd freshgrad-tracker-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database connection (use your Render database URL for testing)
DATABASE_URL=postgresql://user:password@host:5432/database

# Environment
NODE_ENV=development
```

### 4. Start Development

**Option A: Full Stack (Frontend + Backend)**

```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend dev server
npm run dev
```

Access:
- Frontend: http://localhost:5173
- API: http://localhost:3000

**Option B: Frontend Only**

```bash
npm run dev
```

The frontend will proxy API calls to localhost:3000 or production.

## Project Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server (frontend) |
| `build` | `npm run build` | Build for production |
| `preview` | `npm run preview` | Preview production build |
| `server` | `npm run server` | Start Express server |
| `start` | `npm start` | Start server (production) |

## Development Workflow

### Making Changes

1. **Create a branch** (optional but recommended):
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** to code

3. **Test locally**:
   ```bash
   npm run dev
   ```

4. **Commit changes**:
   ```bash
   git add -A
   git commit -m "Description of changes"
   ```

5. **Push to GitHub**:
   ```bash
   git push origin main  # or your branch
   ```

6. **Render auto-deploys** from main branch

### Code Organization

```
src/
├── App.jsx           # Main file - most code lives here
├── main.jsx          # React entry point (don't modify)
├── index.css         # Global styles + Tailwind imports
│
├── providers/
│   ├── AuthProvider.jsx   # Authentication logic
│   └── StoreProvider.jsx  # Data & API logic
│
├── components/        # Reusable components
├── config/           # Configuration files
└── utils/            # Helper functions
```

### Adding a New Page

1. **Create the page component** in `App.jsx`:
   ```jsx
   function NewPage() {
     return (
       <div>
         <h1>New Page</h1>
       </div>
     );
   }
   ```

2. **Add to navigation** in `AppShell`:
   ```jsx
   { label: "New Page", page: "newpage", icon: SomeIcon, roles: [...] }
   ```

3. **Add to page renderer**:
   ```jsx
   {page === "newpage" && <NewPage />}
   ```

### Adding an API Endpoint

1. **Add route in `server-db.cjs`**:
   ```javascript
   app.get('/api/newendpoint', async (req, res) => {
     try {
       const result = await pool.query('SELECT ...');
       res.json(result.rows);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. **Add to StoreProvider** (if needed for state):
   ```javascript
   async function fetchNewData() {
     const response = await fetch('/api/newendpoint');
     const data = await response.json();
     setNewData(data);
   }
   ```

3. **Export from context**:
   ```javascript
   <StoreContext.Provider value={{
     newData,
     fetchNewData,
     // ...
   }}>
   ```

### Adding a Database Column

1. **Add migration** in `server-db.cjs`:
   ```javascript
   const migrations = [
     // ... existing migrations
     'ALTER TABLE tablename ADD COLUMN IF NOT EXISTS newcolumn TYPE DEFAULT value',
   ];
   ```

2. **Update API** to use new column

3. **Deploy** - migrations run automatically

## Frontend Development

### Tailwind CSS

Use Tailwind utility classes:

```jsx
<div className="rounded-xl bg-white p-6 shadow-sm">
  <h1 className="text-lg font-semibold text-slate-900">Title</h1>
  <p className="text-sm text-slate-600">Description</p>
</div>
```

Common patterns:
```css
/* Cards */
rounded-xl border bg-white p-6 shadow-sm

/* Buttons */
rounded-xl bg-indigo-600 text-white px-4 py-2

/* Inputs */
rounded-xl border px-3 py-2

/* Text */
text-lg font-semibold text-slate-900
text-sm text-slate-600
text-xs text-slate-400
```

### React State

**Local state** (component-specific):
```jsx
const [value, setValue] = useState('');
```

**Global state** (shared across app):
```jsx
const { candidates, addCandidate } = useStore();
const { user, login, logout } = useAuth();
```

### API Calls

Using StoreProvider methods:
```jsx
const { addCandidate, updateCandidate, deleteCandidate } = useStore();

// Create
await addCandidate({ name: 'New Student', email: 'student@example.com' });

// Update
await updateCandidate('CND-001', { status: 'Graduated' });

// Delete
await deleteCandidate('CND-001');
```

Direct API calls:
```jsx
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await response.json();
```

## Backend Development

### Database Queries

**Select:**
```javascript
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const users = result.rows;
```

**Insert:**
```javascript
await pool.query(
  'INSERT INTO users (email, name) VALUES ($1, $2)',
  [email, name]
);
```

**Update:**
```javascript
await pool.query(
  'UPDATE users SET name = $1 WHERE email = $2',
  [newName, email]
);
```

**Delete:**
```javascript
await pool.query('DELETE FROM users WHERE email = $1', [email]);
```

### Error Handling

```javascript
app.get('/api/endpoint', async (req, res) => {
  try {
    const result = await pool.query('...');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Logging

Use emoji prefixes for easy scanning:
```javascript
console.log('🚀 Server starting...');
console.log('✅ Success message');
console.log('⚠️ Warning message');
console.error('❌ Error message');
```

## Testing

### Manual Testing

1. **Test locally first**:
   ```bash
   npm run dev
   ```

2. **Test API with curl**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/users
   ```

3. **Check browser console** for errors

### Testing Checklist

Before deploying:
- [ ] App loads without errors
- [ ] Login/logout works
- [ ] Data persists after refresh
- [ ] API endpoints respond correctly
- [ ] No console errors

## VS Code Setup

### Recommended Extensions

- **ES7+ React/Redux/React-Native snippets** - React snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitLens** - Git integration

### Settings

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "javascriptreact": "javascript"
  }
}
```

## Common Tasks

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest
```

### Reset Local State

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Database Reset

```sql
-- Connect to database
-- WARNING: Deletes all data
DROP TABLE IF EXISTS users, candidates, courses, mentors, news CASCADE;
```

Then restart server to recreate tables.

## Debugging

### Frontend

1. Open browser DevTools (F12)
2. Console tab for errors
3. Network tab for API calls
4. React DevTools extension for component state

### Backend

1. Check terminal for server logs
2. Add console.log statements
3. Check Render logs for production

### Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | `npm install` |
| Port in use | Kill process or change port |
| Database connection | Check DATABASE_URL |
| CORS error | Check server CORS config |

---

## Quick Reference

```bash
# Start development
npm run dev        # Frontend
npm run server     # Backend

# Build for production
npm run build

# Deploy
git push origin main

# Check status
curl https://freshgrad-tracker-v2.onrender.com/health
```

---

**Last Updated:** December 2024
