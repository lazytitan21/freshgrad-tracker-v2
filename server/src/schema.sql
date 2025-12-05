-- FreshGrad Tracker Database Schema
-- PostgreSQL Schema for Render.com Free Tier

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT true,
    applicant_status VARCHAR(50) DEFAULT 'None',
    docs JSONB DEFAULT '{}'::jsonb,
    -- Profile fields
    date_of_birth DATE,
    gender VARCHAR(20),
    subject VARCHAR(100),
    emirate VARCHAR(100),
    mobile VARCHAR(50),
    emirates_id VARCHAR(50),
    job_title VARCHAR(255),
    teaching_experience INTEGER,
    profile_data JSONB DEFAULT '{}'::jsonb
);

-- Candidates Table (flexible schema to match frontend)
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(50),
    subject VARCHAR(100),
    emirate VARCHAR(100),
    gpa DECIMAL(5,2),
    status VARCHAR(100) DEFAULT 'Imported',
    sponsor VARCHAR(100),
    track_id VARCHAR(50),
    national_id VARCHAR(100),
    source_batch VARCHAR(255),
    enrollments JSONB DEFAULT '[]'::jsonb,
    hiring JSONB DEFAULT '{}'::jsonb,
    candidate_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table (flexible schema to match frontend)
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    brief TEXT,
    weight DECIMAL(4,2) DEFAULT 0.3,
    pass_threshold INTEGER DEFAULT 70,
    is_required BOOLEAN DEFAULT true,
    tracks JSONB DEFAULT '[]'::jsonb,
    modality VARCHAR(100),
    hours INTEGER,
    active BOOLEAN DEFAULT true,
    course_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentors Table (flexible schema to match frontend)
CREATE TABLE IF NOT EXISTS mentors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(100),
    emirate VARCHAR(100),
    experience_years INTEGER,
    availability VARCHAR(50),
    notes TEXT,
    mentor_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50),
    message TEXT,
    user_email VARCHAR(255),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    user_email VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corrections Table (for tracking course corrections/feedback)
CREATE TABLE IF NOT EXISTS corrections (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50) REFERENCES candidates(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    feedback TEXT,
    score DECIMAL(5,2),
    corrected_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_mentors_email ON mentors(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_corrections_candidate ON corrections(candidate_id);

-- Insert default admin user
INSERT INTO users (email, password, name, role, verified, applicant_status, docs)
VALUES ('firas.kiftaro@moe.gov.ae', '1234', 'Firas Kiftaro', 'Admin', true, 'None', '{}'::jsonb)
ON CONFLICT (email) DO NOTHING;