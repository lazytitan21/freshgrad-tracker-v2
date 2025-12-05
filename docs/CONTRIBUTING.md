# Contributing Guide

Guidelines for contributing to the FreshGrad Tracker project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

1. **Fork the repository** (if external contributor)
2. **Clone locally**:
   ```bash
   git clone https://github.com/lazytitan21/freshgrad-tracker-v2.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation updates |

### Branch Naming

```
feature/add-user-profile
fix/login-error-handling
docs/update-api-reference
```

## Commit Messages

Use clear, descriptive commit messages:

### Format

```
<type>: <short description>

[optional body]
[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat: add news category filter

fix: handle empty GPA value in candidate creation

docs: update API documentation

refactor: extract candidate drawer to component

chore: update dependencies
```

## Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Test your changes**:
   - Run locally: `npm run dev`
   - Build succeeds: `npm run build`
   - No console errors

3. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - Go to GitHub
   - Click "Compare & pull request"
   - Fill in description
   - Request review

5. **Address feedback**:
   - Make requested changes
   - Push updates
   - Respond to comments

## Code Style

### JavaScript/React

- Use functional components with hooks
- Use descriptive variable names
- Keep functions small and focused
- Add comments for complex logic

```jsx
// Good
function CandidateCard({ candidate, onEdit }) {
  const { name, email, status } = candidate;
  
  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-slate-600">{email}</p>
      <span className="text-xs">{status}</span>
    </div>
  );
}

// Avoid
function Card(props) {
  return <div>{props.d.n}</div>;
}
```

### Tailwind CSS

- Use consistent spacing (p-4, p-6)
- Use consistent border radius (rounded-xl)
- Group related classes
- Use semantic color names

```jsx
// Good
<button className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
  Save
</button>

// Avoid
<button style={{ borderRadius: '12px', background: '#4f46e5' }}>
  Save
</button>
```

### API Endpoints

- Use RESTful conventions
- Use proper HTTP methods
- Return appropriate status codes
- Handle errors gracefully

```javascript
// Good
app.get('/api/candidates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});
```

## File Organization

### Where to Put Code

| Type | Location |
|------|----------|
| Page components | `src/App.jsx` |
| Reusable components | `src/components/` |
| State management | `src/providers/` |
| Utilities | `src/utils/` |
| API config | `src/config/` |
| Server code | `server-db.cjs` |

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CandidateCard` |
| Functions | camelCase | `fetchCandidates` |
| Constants | UPPER_SNAKE | `API_ENDPOINTS` |
| Files | kebab-case or PascalCase | `api.js`, `AuthProvider.jsx` |
| CSS classes | Tailwind utilities | `rounded-xl bg-white` |

## Testing Checklist

Before submitting:

- [ ] Code runs without errors
- [ ] Build completes successfully
- [ ] Feature works as expected
- [ ] No console errors/warnings
- [ ] Tested in different browsers (if UI change)
- [ ] API endpoints return correct data
- [ ] Database operations work
- [ ] Existing features still work

## Documentation

When adding features:

1. **Update API.md** if adding endpoints
2. **Update DATABASE.md** if changing schema
3. **Add inline comments** for complex code
4. **Update README.md** if significant changes

## Common Contributions

### Adding a Feature

1. Plan the feature
2. Create database changes (if needed)
3. Add API endpoints (if needed)
4. Create UI components
5. Connect UI to API
6. Test thoroughly
7. Update documentation

### Fixing a Bug

1. Reproduce the bug
2. Identify the cause
3. Write the fix
4. Test the fix
5. Ensure no regressions
6. Commit with `fix:` prefix

### Improving Performance

1. Identify bottleneck
2. Measure current performance
3. Implement optimization
4. Measure improvement
5. Document the change

## Review Guidelines

### For Authors

- Keep PRs focused and small
- Provide context in description
- Respond to feedback promptly
- Be open to suggestions

### For Reviewers

- Be constructive and kind
- Explain the "why" behind suggestions
- Approve when requirements met
- Test changes locally if needed

## Release Process

1. All changes merged to `main`
2. Update version in `server-db.cjs`:
   ```javascript
   const APP_VERSION = '2.10.0';
   ```
3. Push to main
4. Render auto-deploys
5. Verify deployment at `/health`

## Getting Help

- Check existing documentation
- Look at similar code in the project
- Ask questions in PR comments
- Reach out to maintainers

---

Thank you for contributing to FreshGrad Tracker! 🎉
