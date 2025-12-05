# Database Schema

Complete database schema documentation for FreshGrad Tracker.

## Overview

The application uses **PostgreSQL** as the primary database, hosted on Render.com.

### Connection

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

---

## Tables

### users

Stores all user accounts including admins, trainers, and students.

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Student',
    status VARCHAR(50) DEFAULT 'pending',
    date_of_birth DATE,
    gender VARCHAR(20),
    subject VARCHAR(100),
    emirate VARCHAR(100),
    mobile VARCHAR(50),
    emirates_id VARCHAR(50),
    job_title VARCHAR(255),
    teaching_experience INTEGER,
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-increment primary key |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | Hashed password |
| name | VARCHAR(255) | Full name |
| role | VARCHAR(50) | User role (Admin, ECAE Manager, etc.) |
| status | VARCHAR(50) | Account status (pending, active, rejected) |
| date_of_birth | DATE | Birth date |
| gender | VARCHAR(20) | Gender |
| subject | VARCHAR(100) | Teaching subject |
| emirate | VARCHAR(100) | UAE emirate |
| mobile | VARCHAR(50) | Phone number |
| emirates_id | VARCHAR(50) | Emirates ID number |
| job_title | VARCHAR(255) | Job title |
| teaching_experience | INTEGER | Years of experience |
| profile_data | JSONB | Additional profile fields |
| created_at | TIMESTAMP | Account creation time |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));
```

---

### candidates

Stores student candidates going through the training program.

```sql
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(100) DEFAULT 'In Training',
    gpa DECIMAL(3,2),
    national_id VARCHAR(100),
    source_batch VARCHAR(255),
    enrollments JSONB DEFAULT '[]'::jsonb,
    hiring JSONB DEFAULT '{}'::jsonb,
    candidate_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) | Primary key (e.g., "CND-001") |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email address |
| status | VARCHAR(100) | Training status |
| gpa | DECIMAL(3,2) | Grade point average (0.00-4.00) |
| national_id | VARCHAR(100) | National/Emirates ID |
| source_batch | VARCHAR(255) | Batch identifier |
| enrollments | JSONB | Course enrollments array |
| hiring | JSONB | Hiring status object |
| candidate_data | JSONB | Additional data |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**enrollments JSONB structure:**
```json
[
  {
    "courseId": "CRS-001",
    "courseName": "Introduction to Education",
    "grade": 85,
    "status": "Completed",
    "enrolledAt": "2024-12-01T00:00:00.000Z"
  }
]
```

**hiring JSONB structure:**
```json
{
  "status": "Ready for Hiring",
  "school": "ABC School",
  "position": "Teacher",
  "startDate": "2025-01-15",
  "interviews": [
    {
      "date": "2024-12-10",
      "result": "Passed"
    }
  ]
}
```

**Status Values:**
- In Training
- Graduated
- Ready for Hiring
- Hired
- Deployed

---

### courses

Training courses available in the program.

```sql
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50),
    title VARCHAR(255),
    brief TEXT,
    hours INTEGER,
    weight DECIMAL(4,2) DEFAULT 0.3,
    pass_threshold INTEGER DEFAULT 70,
    is_required BOOLEAN DEFAULT true,
    tracks JSONB DEFAULT '[]'::jsonb,
    modality VARCHAR(100),
    active BOOLEAN DEFAULT true,
    course_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) | Primary key (e.g., "CRS-001") |
| code | VARCHAR(50) | Course code (e.g., "EDU101") |
| title | VARCHAR(255) | Course title |
| brief | TEXT | Course description |
| hours | INTEGER | Total hours |
| weight | DECIMAL(4,2) | Grade weight (0.00-1.00) |
| pass_threshold | INTEGER | Minimum passing grade |
| is_required | BOOLEAN | Required for graduation |
| tracks | JSONB | Applicable tracks array |
| modality | VARCHAR(100) | Delivery method |
| active | BOOLEAN | Course is active |
| course_data | JSONB | Additional data |
| created_at | TIMESTAMP | Creation time |

**tracks JSONB structure:**
```json
["General", "Science", "Math", "English"]
```

**Modality Values:**
- Online
- In-Person
- Hybrid

---

### mentors

Mentors assigned to candidates.

```sql
CREATE TABLE IF NOT EXISTS mentors (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    specialization VARCHAR(255),
    mentor_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) | Primary key (e.g., "MNT-001") |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| specialization | VARCHAR(255) | Area of expertise |
| mentor_data | JSONB | Additional data |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### news

News and updates for the landing page.

```sql
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    body TEXT,
    category VARCHAR(100) DEFAULT 'general',
    author_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) | Primary key (e.g., "NEWS-1701849600000-a1b2") |
| title | VARCHAR(500) | News title |
| body | TEXT | News content |
| category | VARCHAR(100) | Category |
| author_email | VARCHAR(255) | Author's email |
| created_at | TIMESTAMP | Publication time |
| updated_at | TIMESTAMP | Last edit time |

**Category Values:**
- General
- Training
- MOE
- Announcements
- Events
- Hiring

---

## JSONB Usage

PostgreSQL JSONB columns provide flexibility for storing:
- Dynamic profile fields
- Course enrollments
- Hiring progress
- Additional metadata

### Querying JSONB

```sql
-- Get candidates with specific enrollment status
SELECT * FROM candidates 
WHERE enrollments @> '[{"status": "Completed"}]';

-- Get users with specific profile data
SELECT * FROM users 
WHERE profile_data->>'phone' IS NOT NULL;

-- Update JSONB field
UPDATE candidates 
SET hiring = hiring || '{"status": "Hired"}'::jsonb 
WHERE id = 'CND-001';
```

---

## Migrations

The server automatically runs migrations on startup:

```javascript
const migrations = [
  // Users table
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT \'{}\'::jsonb',
  
  // Courses table
  'ALTER TABLE courses ADD COLUMN IF NOT EXISTS hours INTEGER',
  
  // Candidates table
  'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS enrollments JSONB DEFAULT \'[]\'::jsonb',
  
  // etc.
];
```

### Adding New Columns

To add a new column:

1. Add migration to `server-db.cjs`:
   ```javascript
   'ALTER TABLE tablename ADD COLUMN IF NOT EXISTS newcolumn TYPE DEFAULT value'
   ```

2. Deploy - migration runs automatically

3. Update API to handle new column

---

## Database Maintenance

### Backup (Manual)

```bash
# Connect to database
psql $DATABASE_URL

# Export data
\copy candidates TO 'candidates_backup.csv' WITH CSV HEADER;
\copy courses TO 'courses_backup.csv' WITH CSV HEADER;
```

### Check Table Sizes

```sql
SELECT 
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Check Connections

```sql
SELECT count(*) FROM pg_stat_activity;
```

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ role            │
│ status          │
│ profile_data    │
└────────┬────────┘
         │
         │ (applicants become candidates)
         ▼
┌─────────────────┐
│   candidates    │
├─────────────────┤
│ id (PK)         │
│ email           │──────┐
│ enrollments[]   │      │
│ hiring{}        │      │
└────────┬────────┘      │
         │               │
         │ (enrolls in)  │
         ▼               │
┌─────────────────┐      │
│    courses      │      │
├─────────────────┤      │
│ id (PK)         │      │
│ code            │      │
│ title           │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│    mentors      │◄─────┘
├─────────────────┤  (assigned to)
│ id (PK)         │
│ name            │
│ specialization  │
└─────────────────┘

┌─────────────────┐
│      news       │
├─────────────────┤
│ id (PK)         │
│ title           │
│ category        │
│ author_email    │
└─────────────────┘
```

---

## Render PostgreSQL Notes

### Free Tier Limits
- 1 GB storage
- 256 MB RAM
- 97 connections max
- 90-day retention (database expires after 90 days of inactivity)

### Connection String Format
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### SSL Required
Production connections must use SSL:
```javascript
ssl: { rejectUnauthorized: false }
```

---

**Last Updated:** December 2024
