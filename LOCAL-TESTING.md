# Local Database Testing Configuration

## Testing Locally (Optional)

If you want to test the database locally before deploying:

### 1. Install PostgreSQL Locally

**Windows**:
- Download: https://www.postgresql.org/download/windows/
- Install PostgreSQL 16 (default settings)
- Remember your postgres password

### 2. Create Local Database

Open Command Prompt or Git Bash:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE freshgrad_tracker;

# Create user (optional)
CREATE USER freshgrad_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE freshgrad_tracker TO freshgrad_user;

# Exit
\q
```

### 3. Set Environment Variable

**Git Bash**:
```bash
export DATABASE_URL="postgresql://postgres:your_password@localhost:5432/freshgrad_tracker"
```

**Windows CMD**:
```cmd
set DATABASE_URL=postgresql://postgres:your_password@localhost:5432/freshgrad_tracker
```

**Windows PowerShell**:
```powershell
$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/freshgrad_tracker"
```

### 4. Run Server Locally

```bash
cd /c/Users/Firas/Desktop/Tracker-Render
npm install
node server-db.cjs
```

### 5. Test the App

Open browser: http://localhost:8080

---

## Skip Local Testing

You can skip local testing and deploy directly to Render. Render provides a free PostgreSQL database that works out of the box!

Just follow the steps in `DEPLOYMENT-WITH-DATABASE.md`
