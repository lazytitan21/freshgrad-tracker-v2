# Changelog

All notable changes to the FreshGrad Tracker project.

## [2.9.0] - 2024-12-06

### Added
- News/Updates persistence with PostgreSQL
- Category filters for news (General, Training, MOE, Announcements, Events, Hiring)
- Category selection when creating updates
- Landing page filter buttons
- `/api/news` CRUD endpoints

### Changed
- Updates now save to database instead of localStorage
- Settings page update form includes category dropdown
- Improved filter UI on landing page

### Fixed
- Hero images endpoint returning correct paths
- News visible across all browsers/devices

---

## [2.8.0] - 2024-12-06

### Added
- `/api/heros` endpoint for landing page images

### Fixed
- Hero images loading correctly

---

## [2.7.0] - 2024-12-06

### Fixed
- Hiring Tracker now only shows graduated candidates
- User profile refresh on app load
- Accepted applicant status visible without refresh

---

## [2.6.0] - 2024-12-05

### Changed
- Renamed "Teacher" role to "Student" throughout app
- Browser tab title changed to "Talent Tracker"

### Added
- Green success message on profile save

---

## [2.5.0] - 2024-12-05

### Fixed
- Applicants correctly move to Candidates on accept
- GPA handling for DECIMAL column (empty string to null)
- User profile persistence in database

---

## [2.4.0] - 2024-12-05

### Fixed
- Courses saving to database
- Hours field handling (empty string to null)
- Build command in render.yaml (`npm install && npm run build`)

### Changed
- Moved Vite and React from devDependencies to dependencies

---

## [2.3.0] - 2024-12-04

### Added
- Full PostgreSQL integration
- All CRUD operations for candidates, courses, mentors
- Database migrations on server startup
- JSONB columns for flexible data storage

---

## [2.2.0] - 2024-12-03

### Added
- User registration with approval workflow
- Profile management
- Role-based access control

---

## [2.1.0] - 2024-12-02

### Added
- Landing page with hero images
- Public news/updates section
- Sign in/Sign up forms

---

## [2.0.0] - 2024-12-01

### Added
- Initial release on Render.com
- React frontend with Vite
- Express backend with PostgreSQL
- Core features:
  - Dashboard
  - Candidates management
  - Courses management
  - Mentors management
  - User management
  - Hiring tracker
  - Results upload
  - Graduation review
  - Exports

---

## Version Format

Versions follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH**
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

---

## Upgrade Notes

### From 2.8.x to 2.9.x
- No breaking changes
- News will be empty on first deploy (localStorage data not migrated)
- Run server to create news table automatically

### From 2.x to 2.x
- Generally seamless upgrades
- Database migrations run automatically
- No manual steps required

---

**Current Version:** 2.9.0
