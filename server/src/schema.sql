-- FreshGrad Tracker Database Schema
-- PostgreSQL Schema for Render.com Free Tier

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT true,
    applicant_status VARCHAR(50) DEFAULT 'None',
    docs JSONB DEFAULT '{}'::jsonb
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(50),
    subject VARCHAR(100),
    emirate VARCHAR(100),
    gpa DECIMAL(4,2),
    status VARCHAR(100) DEFAULT 'Imported',
    sponsor VARCHAR(100),
    track_id VARCHAR(50),
    assignments JSONB DEFAULT '[]'::jsonb,
    corrections JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    track_id VARCHAR(50),
    duration_days INTEGER,
    description TEXT,
    instructor VARCHAR(255),
    required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentors Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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