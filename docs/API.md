# API Reference

Complete API documentation for the FreshGrad Tracker backend.

## Base URL

**Production:** `https://freshgrad-tracker-v2.onrender.com`  
**Local:** `http://localhost:3000`

## Authentication

Currently uses simple email/password authentication stored in the database.
Session is managed client-side via localStorage.

---

## Health & Info

### Health Check

Check server and database status.

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "version": "2.9.0",
  "timestamp": "2024-12-06T10:30:00.000Z",
  "database": "connected",
  "dbTime": "2024-12-06T10:30:00.000Z"
}
```

### Hero Images

Get landing page hero images.

```http
GET /api/heros
```

**Response:**
```json
[
  "/Heros/hero.JPG",
  "/Heros/Hero2.JPG",
  "/Heros/Hero3.JPG",
  "/Heros/Hero4.JPG",
  "/Heros/Hero5.JPG"
]
```

---

## Users

### Login

Authenticate a user.

```http
POST /api/users/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "Admin",
  "status": "active",
  "created_at": "2024-12-01T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### Register

Create a new user account.

```http
POST /api/users/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "Student"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "Student",
  "status": "pending"
}
```

**Error Response (400):**
```json
{
  "error": "Email already exists"
}
```

### Get All Users

Retrieve all users.

```http
GET /api/users
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "Admin",
    "status": "active"
  }
]
```

### Get User by Email

Retrieve a specific user.

```http
GET /api/users/:email
```

**Example:**
```http
GET /api/users/admin@example.com
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "Admin",
  "status": "active",
  "profile_data": {}
}
```

### Update User

Update user information.

```http
PUT /api/users/:email
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "ECAE Manager",
  "status": "active",
  "profile_data": {
    "phone": "123-456-7890"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Updated Name",
  "role": "ECAE Manager",
  "status": "active"
}
```

### Delete User

Remove a user.

```http
DELETE /api/users/:email
```

**Response:**
```json
{
  "success": true
}
```

---

## Candidates

### Get All Candidates

Retrieve all candidates.

```http
GET /api/candidates
```

**Response:**
```json
[
  {
    "id": "CND-001",
    "name": "Student Name",
    "email": "student@example.com",
    "status": "In Training",
    "gpa": 3.5,
    "national_id": "784-1234-5678901-1",
    "source_batch": "Batch 2024",
    "enrollments": [],
    "hiring": {},
    "candidate_data": {},
    "created_at": "2024-12-01T00:00:00.000Z"
  }
]
```

### Create Candidate

Add a new candidate.

```http
POST /api/candidates
Content-Type: application/json

{
  "id": "CND-002",
  "name": "New Student",
  "email": "newstudent@example.com",
  "status": "In Training",
  "gpa": 3.8,
  "national_id": "784-1234-5678901-2",
  "source_batch": "Batch 2024"
}
```

**Response:**
```json
{
  "id": "CND-002",
  "name": "New Student",
  "email": "newstudent@example.com",
  "status": "In Training",
  "gpa": 3.8
}
```

### Update Candidate

Update candidate information.

```http
PUT /api/candidates/:id
Content-Type: application/json

{
  "status": "Graduated",
  "enrollments": [
    {
      "courseId": "CRS-001",
      "grade": 85,
      "status": "Completed"
    }
  ],
  "hiring": {
    "status": "Ready for Hiring",
    "interviews": []
  }
}
```

**Response:**
```json
{
  "id": "CND-002",
  "name": "New Student",
  "status": "Graduated"
}
```

### Delete Candidate

Remove a candidate.

```http
DELETE /api/candidates/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## Courses

### Get All Courses

Retrieve all courses.

```http
GET /api/courses
```

**Response:**
```json
[
  {
    "id": "CRS-001",
    "code": "EDU101",
    "title": "Introduction to Education",
    "brief": "Basic education principles",
    "hours": 40,
    "weight": 0.3,
    "pass_threshold": 70,
    "is_required": true,
    "tracks": ["General"],
    "modality": "Online",
    "active": true
  }
]
```

### Create Course

Add a new course.

```http
POST /api/courses
Content-Type: application/json

{
  "id": "CRS-002",
  "code": "EDU102",
  "title": "Advanced Teaching Methods",
  "brief": "Advanced pedagogical techniques",
  "hours": 60,
  "weight": 0.4,
  "pass_threshold": 75,
  "is_required": true,
  "tracks": ["Teaching"],
  "modality": "Hybrid",
  "active": true
}
```

**Response:**
```json
{
  "id": "CRS-002",
  "code": "EDU102",
  "title": "Advanced Teaching Methods"
}
```

### Update Course

Update course information.

```http
PUT /api/courses/:id
Content-Type: application/json

{
  "title": "Updated Course Title",
  "hours": 50,
  "active": false
}
```

**Response:**
```json
{
  "id": "CRS-002",
  "title": "Updated Course Title",
  "hours": 50,
  "active": false
}
```

### Delete Course

Remove a course.

```http
DELETE /api/courses/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## Mentors

### Get All Mentors

Retrieve all mentors.

```http
GET /api/mentors
```

**Response:**
```json
[
  {
    "id": "MNT-001",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "123-456-7890",
    "specialization": "Mathematics",
    "mentor_data": {}
  }
]
```

### Create Mentor

Add a new mentor.

```http
POST /api/mentors
Content-Type: application/json

{
  "id": "MNT-002",
  "name": "Prof. John Doe",
  "email": "john.doe@example.com",
  "phone": "098-765-4321",
  "specialization": "Science"
}
```

**Response:**
```json
{
  "id": "MNT-002",
  "name": "Prof. John Doe",
  "email": "john.doe@example.com"
}
```

### Update Mentor

Update mentor information.

```http
PUT /api/mentors/:id
Content-Type: application/json

{
  "phone": "111-222-3333",
  "specialization": "Physics"
}
```

**Response:**
```json
{
  "id": "MNT-002",
  "name": "Prof. John Doe",
  "phone": "111-222-3333",
  "specialization": "Physics"
}
```

### Delete Mentor

Remove a mentor.

```http
DELETE /api/mentors/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## News/Updates

### Get All News

Retrieve all news items.

```http
GET /api/news
```

**Response:**
```json
[
  {
    "id": "NEWS-1701849600000-a1b2",
    "title": "Welcome to the Program",
    "body": "We are excited to announce...",
    "category": "Announcements",
    "ts": "2024-12-06T10:00:00.000Z",
    "authorEmail": "admin@example.com"
  }
]
```

### Create News

Post a new update.

```http
POST /api/news
Content-Type: application/json

{
  "title": "Training Schedule Update",
  "body": "The new training schedule has been released...",
  "category": "Training",
  "authorEmail": "admin@example.com"
}
```

**Response:**
```json
{
  "id": "NEWS-1701849600000-c3d4",
  "title": "Training Schedule Update",
  "body": "The new training schedule has been released...",
  "category": "Training",
  "ts": "2024-12-06T10:00:00.000Z"
}
```

### Update News

Edit a news item.

```http
PUT /api/news/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "body": "Updated content...",
  "category": "MOE"
}
```

**Response:**
```json
{
  "success": true
}
```

### Delete News

Remove a news item.

```http
DELETE /api/news/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## News Categories

Available categories for news/updates:

| Category | Description |
|----------|-------------|
| General | General updates |
| Training | Training-related news |
| MOE | Ministry of Education updates |
| Announcements | Important announcements |
| Events | Event notifications |
| Hiring | Hiring and placement news |

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

---

## Testing with cURL

### Test Health

```bash
curl https://freshgrad-tracker-v2.onrender.com/health
```

### Test Login

```bash
curl -X POST https://freshgrad-tracker-v2.onrender.com/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Candidates

```bash
curl https://freshgrad-tracker-v2.onrender.com/api/candidates
```

### Create Course

```bash
curl -X POST https://freshgrad-tracker-v2.onrender.com/api/courses \
  -H "Content-Type: application/json" \
  -d '{"id":"CRS-TEST","code":"TST001","title":"Test Course","hours":10}'
```

---

## Rate Limits

Currently no rate limits are enforced. For production use, consider implementing rate limiting.

---

**API Version:** 2.9.0  
**Last Updated:** December 2024
