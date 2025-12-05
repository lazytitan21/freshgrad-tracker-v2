/**
 * FreshGrad Tracker Server with PostgreSQL
 * For Render.com deployment with persistent database
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fsSync = require('fs');
const { Pool } = require('pg');

console.log('🚀 Starting FreshGrad Tracker API Server with Database...');

const app = express();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Allow all origins for now
app.use(cors({
  origin: true,
  credentials: true,
}));

// Initialize database tables
async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'server', 'src', 'schema.sql');
    if (fsSync.existsSync(schemaPath)) {
      const schema = fsSync.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('✅ Database schema initialized');
      
      // Add new columns if they don't exist (migration for existing databases)
      const migrations = [
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS subject VARCHAR(100)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS emirate VARCHAR(100)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(50)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS emirates_id VARCHAR(50)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS teaching_experience INTEGER',
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb"
      ];
      
      for (const migration of migrations) {
        try {
          await pool.query(migration);
        } catch (e) {
          // Column might already exist, ignore error
        }
      }
      console.log('✅ Database migrations applied');
    } else {
      console.warn('⚠️ schema.sql not found, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// ========== API ROUTES ==========

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// ========== USERS ROUTES ==========

// Users - Login
app.post('/api/users/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND password = $2',
      [email, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const { password: _, ...userWithoutPassword } = user;
    
    // Merge profile_data into response for frontend compatibility
    const profileData = user.profile_data || {};
    const response = { ...userWithoutPassword, ...profileData };
    
    console.log('✅ Login successful:', user.email);
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Users - Register
app.post('/api/users/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user exists
    const existCheck = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    
    if (existCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Insert new user with all profile fields initialized
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, created_at, verified, applicant_status, docs, profile_data)
       VALUES ($1, $2, $3, $4, NOW(), true, 'None', '{}'::jsonb, '{}'::jsonb)
       RETURNING id, email, name, role, created_at, verified, applicant_status, docs, date_of_birth, gender, subject, emirate, mobile, emirates_id, job_title, teaching_experience, profile_data`,
      [email.toLowerCase(), password, name, role || 'Teacher']
    );
    
    const newUser = result.rows[0];
    console.log('✅ User registered:', newUser.email);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Users - Get all
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    
    // Map users to merge profile_data and exclude password
    const users = result.rows.map(user => {
      const { password, ...userWithoutPassword } = user;
      const profileData = user.profile_data || {};
      return { ...userWithoutPassword, ...profileData };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Users - Get by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [req.params.email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const { password: _, ...userWithoutPassword } = user;
    
    // Merge profile_data into response for frontend compatibility
    const profileData = user.profile_data || {};
    const response = { ...userWithoutPassword, ...profileData };
    
    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Users - Update profile
app.put('/api/users/:email', async (req, res) => {
  try {
    // Extract known fields and store rest in profile_data
    const { name, role, applicantStatus, applicant_status, docs, interested, ...otherFields } = req.body;
    
    // Build profile_data from all the profile fields sent by frontend
    // This includes: dob, gender, preferredSubject, emirate, contactNumber, 
    // yearsExperience, currentJob, emiratesIdNumber, otherNotes, etc.
    const profileFields = { ...otherFields };
    if (interested !== undefined) profileFields.interested = interested;
    
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($2, name),
           role = COALESCE($3, role),
           applicant_status = COALESCE($4, $5, applicant_status),
           docs = COALESCE($6, docs),
           profile_data = COALESCE(profile_data, '{}'::jsonb) || $7::jsonb
       WHERE LOWER(email) = LOWER($1)
       RETURNING *`,
      [req.params.email, name, role, applicant_status, applicantStatus, 
       docs ? JSON.stringify(docs) : null, 
       JSON.stringify(profileFields)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const { password: _, ...userWithoutPassword } = user;
    
    // Merge profile_data into response for frontend compatibility
    const profileData = user.profile_data || {};
    const response = { ...userWithoutPassword, ...profileData };
    
    console.log('✅ User profile updated:', req.params.email);
    res.json(response);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Users - Update password
app.post('/api/users/:email/password', async (req, res) => {
  try {
    const { password } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET password = $2 WHERE LOWER(email) = LOWER($1) RETURNING email',
      [req.params.email, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Password updated for:', req.params.email);
    res.json({ success: true });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Users - Delete
app.delete('/api/users/:email', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE LOWER(email) = LOWER($1) RETURNING email',
      [req.params.email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User deleted:', req.params.email);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ========== CANDIDATES ROUTES ==========

// Candidates - Get all
app.get('/api/candidates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Candidates - Get by ID
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Candidates - Create
app.post('/api/candidates', async (req, res) => {
  try {
    const { name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, assignments, corrections, notes } = req.body;
    const id = `C-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO candidates (id, name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, assignments, corrections, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      [id, name, email, mobile, subject, emirate, gpa, status || 'Imported', sponsor, track_id, 
       JSON.stringify(assignments || []), JSON.stringify(corrections || []), notes]
    );
    
    console.log('✅ Candidate created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create candidate error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  }
});

// Candidates - Update
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, assignments, corrections, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE candidates 
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           mobile = COALESCE($4, mobile),
           subject = COALESCE($5, subject),
           emirate = COALESCE($6, emirate),
           gpa = COALESCE($7, gpa),
           status = COALESCE($8, status),
           sponsor = COALESCE($9, sponsor),
           track_id = COALESCE($10, track_id),
           assignments = COALESCE($11, assignments),
           corrections = COALESCE($12, corrections),
           notes = COALESCE($13, notes),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name, email, mobile, subject, emirate, gpa, status, sponsor, track_id,
       assignments ? JSON.stringify(assignments) : null,
       corrections ? JSON.stringify(corrections) : null,
       notes]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    console.log('✅ Candidate updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Candidates - Delete
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    console.log('✅ Candidate deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// ========== COURSES ROUTES ==========

// Courses - Get all
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Courses - Create
app.post('/api/courses', async (req, res) => {
  try {
    const { code, title, track_id, duration_days, description, instructor, required } = req.body;
    const id = `CR-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO courses (id, code, title, track_id, duration_days, description, instructor, required, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [id, code, title, track_id, duration_days, description, instructor, required || false]
    );
    
    console.log('✅ Course created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create course error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Course code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
});

// Courses - Update
app.put('/api/courses/:id', async (req, res) => {
  try {
    const { code, title, track_id, duration_days, description, instructor, required } = req.body;
    
    const result = await pool.query(
      `UPDATE courses 
       SET code = COALESCE($2, code),
           title = COALESCE($3, title),
           track_id = COALESCE($4, track_id),
           duration_days = COALESCE($5, duration_days),
           description = COALESCE($6, description),
           instructor = COALESCE($7, instructor),
           required = COALESCE($8, required)
       WHERE id = $1
       RETURNING *`,
      [req.params.id, code, title, track_id, duration_days, description, instructor, required]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Courses - Delete
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ========== MENTORS ROUTES ==========

// Mentors - Get all
app.get('/api/mentors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Mentors - Create
app.post('/api/mentors', async (req, res) => {
  try {
    const { name, email, phone, subject, emirate, experience_years, availability, notes } = req.body;
    const id = `M-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO mentors (id, name, email, phone, subject, emirate, experience_years, availability, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [id, name, email, phone, subject, emirate, experience_years, availability, notes]
    );
    
    console.log('✅ Mentor created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create mentor error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create mentor' });
    }
  }
});

// Mentors - Update
app.put('/api/mentors/:id', async (req, res) => {
  try {
    const { name, email, phone, subject, emirate, experience_years, availability, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE mentors 
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           subject = COALESCE($5, subject),
           emirate = COALESCE($6, emirate),
           experience_years = COALESCE($7, experience_years),
           availability = COALESCE($8, availability),
           notes = COALESCE($9, notes)
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name, email, phone, subject, emirate, experience_years, availability, notes]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update mentor error:', error);
    res.status(500).json({ error: 'Failed to update mentor' });
  }
});

// Mentors - Delete
app.delete('/api/mentors/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mentors WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete mentor error:', error);
    res.status(500).json({ error: 'Failed to delete mentor' });
  }
});

// ========== AUDIT LOG ==========

app.post('/api/audit', async (req, res) => {
  try {
    const { event_type, user_email, details } = req.body;
    await pool.query(
      'INSERT INTO audit_log (event_type, user_email, details, created_at) VALUES ($1, $2, $3, NOW())',
      [event_type, user_email, JSON.stringify(details)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// Serve static files
const distDir = path.join(__dirname, 'dist');
if (fsSync.existsSync(distDir)) {
  app.use(express.static(distDir));
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distDir, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
} else {
  console.warn('⚠️ dist folder not found - API only mode');
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.status(404).send('Frontend not deployed. Build the frontend first: npm run build');
    }
  });
}

// Start server
const PORT = process.env.PORT || 8080;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database pool...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
