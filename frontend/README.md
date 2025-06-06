# SparkTest MVP

A modern Kubernetes-native testing platform for running and managing test suites.

## Features

- 🚀 **Test Definitions**: Create reusable test configurations
- 📊 **Test Runs**: Execute and monitor test execution
- 🔄 **Real-time Updates**: Live status updates and logs
- 📈 **Analytics**: Test success rates and performance metrics
- 🔗 **Webhooks**: Integrate with Slack, Teams, Discord
- 🎯 **Test Suites**: Group related tests together
- ☁️ **Flexible Backend**: Works with localStorage or Rust API

## 🚨 **QUICK SWITCH TO RUST API**

When your Rust API is ready, update **ONE FILE**:

### File: `lib/api-service.ts`
```typescript
// Change this line from:
const USE_RUST_API = false

// To:
const USE_RUST_API = true
```

### Environment Variable:
```bash
NEXT_PUBLIC_RUST_API_URL=http://your-rust-api:8080/api
```

**That's it!** The app will automatically switch to your Rust API.

---

## Backend Configuration

### Current Status: localStorage Active

The app is currently configured to use localStorage with sample data. This works immediately without any setup and includes comprehensive sample data for testing.

### Switching to Rust API

#### 🦀 **Switch to Rust API (When Ready)**

**Step 1:** Update the configuration flag
- **File:** `lib/api-service.ts`
- **Line 2:** Change `const USE_RUST_API = false` to `const USE_RUST_API = true`

**Step 2:** Set your API URL
```bash
NEXT_PUBLIC_RUST_API_URL=http://your-rust-api:8080/api
```

**Step 3:** Deploy
```bash
npm run build
# Deploy to your platform
```

### Expected Rust API Endpoints

When you implement your Rust API, it should provide these endpoints:

```
GET    /api/health                    # Health check
GET    /api/test-definitions          # List test definitions
GET    /api/test-definitions/:id      # Get specific test definition
POST   /api/test-definitions          # Create test definition
PUT    /api/test-definitions/:id      # Update test definition
DELETE /api/test-definitions/:id      # Delete test definition

GET    /api/test-runs                 # List test runs
GET    /api/test-runs/:id             # Get specific test run
POST   /api/test-runs                 # Create test run
PUT    /api/test-runs/:id             # Update test run
DELETE /api/test-runs/:id             # Delete test run

GET    /api/kubernetes/info           # Kubernetes cluster info
GET    /api/kubernetes/logs/:testId   # Get test logs
GET    /api/webhooks                  # List webhooks
GET    /api/test-suites               # List test suites
```

### Real-time Updates

- **localStorage**: Uses periodic refresh (every 5 seconds)
- **Rust API**: Ready for WebSocket implementation (currently falls back to periodic refresh)

## Quick Start

### Local Development

1. Clone and install:
```bash
git clone <your-repo>
cd sparktest-mvp
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

The app will automatically populate with sample test data for demonstration.

### Production Deployment

1. Choose your backend (localStorage or Rust API)
2. Set appropriate environment variables if using Rust API
3. Deploy to Vercel:
```bash
npm run build
# Deploy to your preferred platform
```

## Sample Data

The application includes comprehensive sample data for immediate testing:

### Test Definitions
- **API Integration Tests**: Node.js API testing with authentication
- **Frontend Unit Tests**: React component testing with Jest
- **E2E Tests**: Full user journey testing with Playwright
- **Security Scan**: OWASP ZAP vulnerability scanning
- **Performance Tests**: Load testing with K6
- **Database Migration Tests**: Schema and data integrity testing

### Test Runs
- Recent test executions with realistic logs
- Various statuses: completed, running, failed
- Performance metrics and artifacts
- Detailed execution logs

### Test Suites
- **Full CI Pipeline**: Complete testing workflow
- **Pre-Deployment Validation**: Essential pre-prod tests
- **Security Audit Suite**: Comprehensive security testing

### Webhooks
- Slack team notifications
- Microsoft Teams alerts
- Discord development channel

## Architecture

- **Frontend**: Next.js 14 with React Server Components
- **Backend Options**: 
  - localStorage (development/demo with rich sample data)
  - Rust API (production backend)
- **Fallback**: localStorage for offline/demo usage
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel-ready with environment variable support

## Development

### Adding New Features

1. Update types in `lib/types.ts`
2. Add API methods in `lib/api-service.ts`
3. Create UI components in `components/`
4. Add pages in `app/`

### Testing Different Backends

You can easily switch between backends by updating the configuration in `lib/api-service.ts`:

```typescript
// For localStorage (development/demo)
const USE_RUST_API = false

// For Rust API (production)
const USE_RUST_API = true
// Add NEXT_PUBLIC_RUST_API_URL environment variable
```

### Rust API Development

When developing your Rust API, ensure it:

1. **Implements all required endpoints** (see list above)
2. **Returns JSON responses** matching the TypeScript types
3. **Handles CORS** for frontend requests
4. **Provides health check** at `/api/health`
5. **Supports WebSockets** for real-time updates (optional)

### Database Schema

For your Rust API backend, you'll need these main entities:

```sql
-- Test Definitions
CREATE TABLE test_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  commands TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executor_id TEXT,
  variables JSONB,
  labels TEXT[]
);

-- Test Runs
CREATE TABLE test_runs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  command TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  test_definition_id TEXT REFERENCES test_definitions(id),
  duration INTEGER,
  logs TEXT[]
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both localStorage and Rust API configurations
5. Submit a pull request

## License

MIT License - see LICENSE file for details
```

```typescriptreact file="supabase/schema.sql" isDeleted="true"
...deleted...
