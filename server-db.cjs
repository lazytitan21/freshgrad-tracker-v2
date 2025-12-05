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
        // Users table migrations
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS subject VARCHAR(100)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS emirate VARCHAR(100)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(50)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS emirates_id VARCHAR(50)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255)',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS teaching_experience INTEGER',
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb",
        
        // Courses table migrations - ensure ALL columns exist
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS code VARCHAR(50)',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS title VARCHAR(255)',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS brief TEXT',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS weight DECIMAL(4,2) DEFAULT 0.3',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS pass_threshold INTEGER DEFAULT 70',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true',
        "ALTER TABLE courses ADD COLUMN IF NOT EXISTS tracks JSONB DEFAULT '[]'::jsonb",
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS modality VARCHAR(100)',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS hours INTEGER',
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true',
        "ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_data JSONB DEFAULT '{}'::jsonb",
        'ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        
        // Candidates table migrations
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS candidate_data JSONB DEFAULT '{}'::jsonb",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS enrollments JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS hiring JSONB DEFAULT '{}'::jsonb",
        'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS national_id VARCHAR(100)',
        'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source_batch VARCHAR(255)',
        'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        
        // Mentors table migrations
        "ALTER TABLE mentors ADD COLUMN IF NOT EXISTS mentor_data JSONB DEFAULT '{}'::jsonb",
        'ALTER TABLE mentors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      ];
      
      for (const migration of migrations) {
        try {
          await pool.query(migration);
        } catch (e) {
          // Column might already exist or other non-fatal error, ignore
          console.log('Migration note:', e.message);
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

// App version - update this to track deployments
const APP_VERSION = '2.2.0';

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      version: APP_VERSION, 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Debug endpoint - check table columns
app.get('/api/debug/schema', async (req, res) => {
  try {
    const tables = ['users', 'courses', 'candidates', 'mentors'];
    const schema = {};
    for (const table of tables) {
      const result = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
        [table]
      );
      schema[table] = result.rows;
    }
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    // Merge candidate_data into each candidate for frontend compatibility
    const candidates = result.rows.map(candidate => {
      const candidateData = candidate.candidate_data || {};
      const { candidate_data, ...rest } = candidate;
      return { ...rest, ...candidateData };
    });
    res.json(candidates);
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
    const candidate = result.rows[0];
    const candidateData = candidate.candidate_data || {};
    const { candidate_data, ...rest } = candidate;
    res.json({ ...rest, ...candidateData });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Candidates - Create or Update (Upsert)
app.post('/api/candidates', async (req, res) => {
  try {
    const { id, name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, trackId, 
            nationalId, national_id, sourceBatch, source_batch, enrollments, hiring, ...otherFields } = req.body;
    const candidateId = id || `C-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO candidates (id, name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, national_id, source_batch, enrollments, hiring, candidate_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = COALESCE(EXCLUDED.name, candidates.name),
         email = COALESCE(EXCLUDED.email, candidates.email),
         mobile = COALESCE(EXCLUDED.mobile, candidates.mobile),
         subject = COALESCE(EXCLUDED.subject, candidates.subject),
         emirate = COALESCE(EXCLUDED.emirate, candidates.emirate),
         gpa = COALESCE(EXCLUDED.gpa, candidates.gpa),
         status = COALESCE(EXCLUDED.status, candidates.status),
         sponsor = COALESCE(EXCLUDED.sponsor, candidates.sponsor),
         track_id = COALESCE(EXCLUDED.track_id, candidates.track_id),
         national_id = COALESCE(EXCLUDED.national_id, candidates.national_id),
         source_batch = COALESCE(EXCLUDED.source_batch, candidates.source_batch),
         enrollments = COALESCE(EXCLUDED.enrollments, candidates.enrollments),
         hiring = COALESCE(EXCLUDED.hiring, candidates.hiring),
         candidate_data = COALESCE(candidates.candidate_data, '{}'::jsonb) || EXCLUDED.candidate_data,
         updated_at = NOW()
       RETURNING *`,
      [candidateId, name, email, mobile, subject, emirate, gpa, status || 'Imported', sponsor, 
       track_id || trackId, national_id || nationalId, source_batch || sourceBatch,
       JSON.stringify(enrollments || []), JSON.stringify(hiring || {}), JSON.stringify(otherFields)]
    );
    
    const candidate = result.rows[0];
    const candidateData = candidate.candidate_data || {};
    const { candidate_data, ...rest } = candidate;
    
    console.log('✅ Candidate created/updated:', candidate.id);
    res.status(201).json({ ...rest, ...candidateData });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Candidates - Bulk Create/Update
app.post('/api/candidates/bulk', async (req, res) => {
  try {
    const { candidates: candidatesList } = req.body;
    if (!Array.isArray(candidatesList)) {
      return res.status(400).json({ error: 'Expected array of candidates' });
    }
    
    const results = [];
    for (const candidate of candidatesList) {
      const { id, name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, trackId,
              nationalId, national_id, sourceBatch, source_batch, enrollments, hiring, ...otherFields } = candidate;
      const candidateId = id || `C-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
      
      const result = await pool.query(
        `INSERT INTO candidates (id, name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, national_id, source_batch, enrollments, hiring, candidate_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = COALESCE(EXCLUDED.name, candidates.name),
           email = COALESCE(EXCLUDED.email, candidates.email),
           mobile = COALESCE(EXCLUDED.mobile, candidates.mobile),
           subject = COALESCE(EXCLUDED.subject, candidates.subject),
           emirate = COALESCE(EXCLUDED.emirate, candidates.emirate),
           gpa = COALESCE(EXCLUDED.gpa, candidates.gpa),
           status = COALESCE(EXCLUDED.status, candidates.status),
           sponsor = COALESCE(EXCLUDED.sponsor, candidates.sponsor),
           track_id = COALESCE(EXCLUDED.track_id, candidates.track_id),
           national_id = COALESCE(EXCLUDED.national_id, candidates.national_id),
           source_batch = COALESCE(EXCLUDED.source_batch, candidates.source_batch),
           enrollments = COALESCE(EXCLUDED.enrollments, candidates.enrollments),
           hiring = COALESCE(EXCLUDED.hiring, candidates.hiring),
           candidate_data = COALESCE(candidates.candidate_data, '{}'::jsonb) || EXCLUDED.candidate_data,
           updated_at = NOW()
         RETURNING *`,
        [candidateId, name, email, mobile, subject, emirate, gpa, status || 'Imported', sponsor,
         track_id || trackId, national_id || nationalId, source_batch || sourceBatch,
         JSON.stringify(enrollments || []), JSON.stringify(hiring || {}), JSON.stringify(otherFields)]
      );
      results.push(result.rows[0]);
    }
    
    console.log('✅ Bulk candidates created/updated:', results.length);
    res.status(201).json(results);
  } catch (error) {
    console.error('Bulk create candidates error:', error);
    res.status(500).json({ error: 'Failed to bulk create candidates' });
  }
});

// Candidates - Update
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { name, email, mobile, subject, emirate, gpa, status, sponsor, track_id, trackId,
            nationalId, national_id, sourceBatch, source_batch, enrollments, hiring, ...otherFields } = req.body;
    
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
           national_id = COALESCE($11, national_id),
           source_batch = COALESCE($12, source_batch),
           enrollments = COALESCE($13, enrollments),
           hiring = COALESCE($14, hiring),
           candidate_data = COALESCE(candidate_data, '{}'::jsonb) || $15::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name, email, mobile, subject, emirate, gpa, status, sponsor,
       track_id || trackId, national_id || nationalId, source_batch || sourceBatch,
       enrollments ? JSON.stringify(enrollments) : null, hiring ? JSON.stringify(hiring) : null,
       JSON.stringify(otherFields)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const candidate = result.rows[0];
    const candidateData = candidate.candidate_data || {};
    const { candidate_data, ...rest } = candidate;
    
    console.log('✅ Candidate updated:', candidate.id);
    res.json({ ...rest, ...candidateData });
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
    // Merge course_data into each course for frontend compatibility
    const courses = result.rows.map(course => {
      const courseData = course.course_data || {};
      const { course_data, ...rest } = course;
      return { ...rest, ...courseData };
    });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Courses - Get by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const course = result.rows[0];
    const courseData = course.course_data || {};
    const { course_data, ...rest } = course;
    res.json({ ...rest, ...courseData });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Courses - Create
app.post('/api/courses', async (req, res) => {
  try {
    const { id, code, title, brief, weight, passThreshold, isRequired, tracks, modality, hours, active, ...otherFields } = req.body;
    const courseId = id || `CR-${Date.now()}`;
    
    // Handle hours - convert empty string to null for INTEGER column
    const hoursValue = hours === '' || hours === undefined || hours === null ? null : Number(hours) || null;
    
    console.log('📝 Creating course:', { courseId, code, title });
    
    const result = await pool.query(
      `INSERT INTO courses (id, code, title, brief, weight, pass_threshold, is_required, tracks, modality, hours, active, course_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code,
         title = EXCLUDED.title,
         brief = EXCLUDED.brief,
         weight = EXCLUDED.weight,
         pass_threshold = EXCLUDED.pass_threshold,
         is_required = EXCLUDED.is_required,
         tracks = EXCLUDED.tracks,
         modality = EXCLUDED.modality,
         hours = EXCLUDED.hours,
         active = EXCLUDED.active,
         course_data = EXCLUDED.course_data
       RETURNING *`,
      [courseId, code, title, brief, weight || 0.3, passThreshold || 70, isRequired !== false, 
       JSON.stringify(tracks || []), modality || null, hoursValue, active !== false, JSON.stringify(otherFields)]
    );
    
    const course = result.rows[0];
    const courseData = course.course_data || {};
    const { course_data, ...rest } = course;
    const response = { ...rest, ...courseData, passThreshold: course.pass_threshold, isRequired: course.is_required };
    
    console.log('✅ Course created:', course.id);
    res.status(201).json(response);
  } catch (error) {
    console.error('Create course error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create course', details: error.message });
  }
});

// Courses - Update
app.put('/api/courses/:id', async (req, res) => {
  try {
    const { code, title, brief, weight, passThreshold, isRequired, tracks, modality, hours, active, ...otherFields } = req.body;
    
    // Handle hours - convert empty string to null for INTEGER column
    const hoursValue = hours === '' || hours === undefined ? null : (hours === null ? null : Number(hours) || null);
    
    const result = await pool.query(
      `UPDATE courses 
       SET code = COALESCE($2, code),
           title = COALESCE($3, title),
           brief = COALESCE($4, brief),
           weight = COALESCE($5, weight),
           pass_threshold = COALESCE($6, pass_threshold),
           is_required = COALESCE($7, is_required),
           tracks = COALESCE($8, tracks),
           modality = COALESCE($9, modality),
           hours = COALESCE($10, hours),
           active = COALESCE($11, active),
           course_data = COALESCE(course_data, '{}'::jsonb) || $12::jsonb
       WHERE id = $1
       RETURNING *`,
      [req.params.id, code, title, brief, weight, passThreshold, isRequired,
       tracks ? JSON.stringify(tracks) : null, modality || null, hoursValue, active, JSON.stringify(otherFields)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const course = result.rows[0];
    const courseData = course.course_data || {};
    const { course_data, ...rest } = course;
    const response = { ...rest, ...courseData, passThreshold: course.pass_threshold, isRequired: course.is_required };
    
    console.log('✅ Course updated:', course.id);
    res.json(response);
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
    // Merge mentor_data into each mentor for frontend compatibility
    const mentors = result.rows.map(mentor => {
      const mentorData = mentor.mentor_data || {};
      const { mentor_data, ...rest } = mentor;
      return { ...rest, ...mentorData };
    });
    res.json(mentors);
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Mentors - Get by ID
app.get('/api/mentors/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    const mentor = result.rows[0];
    const mentorData = mentor.mentor_data || {};
    const { mentor_data, ...rest } = mentor;
    res.json({ ...rest, ...mentorData });
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
});

// Mentors - Create or Update (Upsert)
app.post('/api/mentors', async (req, res) => {
  try {
    const { id, name, email, phone, subject, emirate, experience_years, experienceYears, availability, notes, ...otherFields } = req.body;
    const mentorId = id || `M-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO mentors (id, name, email, phone, subject, emirate, experience_years, availability, notes, mentor_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = COALESCE(EXCLUDED.name, mentors.name),
         email = COALESCE(EXCLUDED.email, mentors.email),
         phone = COALESCE(EXCLUDED.phone, mentors.phone),
         subject = COALESCE(EXCLUDED.subject, mentors.subject),
         emirate = COALESCE(EXCLUDED.emirate, mentors.emirate),
         experience_years = COALESCE(EXCLUDED.experience_years, mentors.experience_years),
         availability = COALESCE(EXCLUDED.availability, mentors.availability),
         notes = COALESCE(EXCLUDED.notes, mentors.notes),
         mentor_data = COALESCE(mentors.mentor_data, '{}'::jsonb) || EXCLUDED.mentor_data,
         updated_at = NOW()
       RETURNING *`,
      [mentorId, name, email, phone, subject, emirate, experience_years || experienceYears, availability, notes, JSON.stringify(otherFields)]
    );
    
    const mentor = result.rows[0];
    const mentorData = mentor.mentor_data || {};
    const { mentor_data, ...rest } = mentor;
    
    console.log('✅ Mentor created/updated:', mentor.id);
    res.status(201).json({ ...rest, ...mentorData });
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
    const { name, email, phone, subject, emirate, experience_years, experienceYears, availability, notes, ...otherFields } = req.body;
    
    const result = await pool.query(
      `UPDATE mentors 
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           subject = COALESCE($5, subject),
           emirate = COALESCE($6, emirate),
           experience_years = COALESCE($7, experience_years),
           availability = COALESCE($8, availability),
           notes = COALESCE($9, notes),
           mentor_data = COALESCE(mentor_data, '{}'::jsonb) || $10::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name, email, phone, subject, emirate, experience_years || experienceYears, availability, notes, JSON.stringify(otherFields)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const mentor = result.rows[0];
    const mentorData = mentor.mentor_data || {};
    const { mentor_data, ...rest } = mentor;
    
    console.log('✅ Mentor updated:', mentor.id);
    res.json({ ...rest, ...mentorData });
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
    
    console.log('✅ Mentor deleted:', req.params.id);
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
  // Disable caching for HTML files to ensure latest version is served
  app.use(express.static(distDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
