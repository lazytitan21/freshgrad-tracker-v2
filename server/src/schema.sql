-- FreshGrad Tracker Database Schema
-- PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Student',
    status VARCHAR(50) DEFAULT 'pending',
    verified BOOLEAN DEFAULT false,
    applicant_status VARCHAR(100) DEFAULT 'None',
    docs JSONB DEFAULT '{}'::jsonb,
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

-- Candidates table
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

-- Courses table
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

-- Mentors table
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

-- News table
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    body TEXT,
    category VARCHAR(100) DEFAULT 'general',
    author_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for case-insensitive email lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
