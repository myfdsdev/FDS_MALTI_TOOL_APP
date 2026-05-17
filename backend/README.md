# Multi-Tool AI Backend

Production-grade Node.js + TypeScript backend powering 28 AI tools through a unified API.

## Stack

- **Runtime**: Node.js 20+ (ESM, TypeScript)
- **Framework**: Express
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT (httpOnly cookies) + Google OAuth ID tokens
- **Validation**: Zod
- **Logging**: Pino (structured JSON in prod, pretty in dev)
- **Security**: Helmet, CORS, bcrypt, rate limiting
- **Deploy**: Docker, Render, Fly.io

## Quick start

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT secrets, GOOGLE_CLIENT_ID, and optional AI_API_KEY
npm run dev
```

Server runs on `http://localhost:5000`.

### Generate JWT secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice — once for `JWT_ACCESS_SECRET`, once for `JWT_REFRESH_SECRET`.

### MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Database Access → add a user
3. Network Access → allow your IP (or `0.0.0.0/0` for dev)
4. Connect → Drivers → copy the URI into `MONGODB_URI`

### Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/) → Create project
2. APIs & Services → OAuth consent screen → set up
3. Credentials → Create OAuth Client ID → Web application
4. Authorized JavaScript origins: `http://localhost:5173` (and your production URL)
5. Copy the Client ID into `GOOGLE_CLIENT_ID`

## Architecture

```
backend/
├── src/
│   ├── server.ts                   # Entry — connects DB, starts server, graceful shutdown
│   ├── app.ts                      # Express app config
│   ├── config/
│   │   ├── env.ts                  # Zod-validated environment variables
│   │   ├── logger.ts               # Pino logger
│   │   ├── database.ts             # MongoDB connection
│   │   └── tools.config.ts         # ⭐ Registry of all 28 tools
│   ├── models/
│   │   ├── User.model.ts           # email/password + Google + usage
│   │   └── Generation.model.ts     # Tool run history
│   ├── routes/                     # Express routers
│   ├── controllers/                # Request handlers
│   ├── services/
│   │   ├── ai.service.ts           # ⭐ Plug AI provider here
│   │   ├── auth.service.ts         # JWT + cookies
│   │   ├── google.service.ts       # Google ID token verification
│   │   └── usage.service.ts        # Quota enforcement
│   ├── middleware/
│   │   ├── auth.middleware.ts      # requireAuth, optionalAuth
│   │   ├── rateLimit.middleware.ts # authLimiter, apiLimiter
│   │   ├── validate.middleware.ts  # Zod validation
│   │   ├── error.middleware.ts     # Central error handler
│   │   └── requestId.middleware.ts # Request tracing
│   ├── validators/                 # Zod schemas
│   ├── utils/
│   │   ├── errors.ts               # AppError + subclasses
│   │   ├── asyncHandler.ts         # Async route wrapper
│   │   └── responses.ts            # Response helpers
│   └── types/
│       └── express.d.ts            # Express type augmentation
├── Dockerfile
├── docker-compose.yml              # Local dev with MongoDB
├── render.yaml                     # Render deploy config
├── fly.toml                        # Fly.io deploy config
└── tsconfig.json
```

## API reference

All responses follow this shape:

```json
{ "success": true, "message": "OK", "data": { ... } }
{ "success": false, "message": "...", "error": { "code": "...", "details": ... } }
```

### Auth

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/register` | — | `{ email, password, name }` |
| POST | `/api/auth/login` | — | `{ email, password }` |
| POST | `/api/auth/google` | — | `{ idToken }` |
| POST | `/api/auth/refresh` | cookie | — |
| POST | `/api/auth/logout` | — | — |
| GET | `/api/auth/me` | ✅ | — |

### Tools

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/tools` | — |
| GET | `/api/tools/category/:category` | — |
| GET | `/api/tools/:toolId` | — |
| POST | `/api/tools/:toolId/generate` | ✅ |

### User

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/user/usage` | ✅ |
| GET | `/api/user/history?page=1&limit=20&toolId=xxx` | ✅ |
| DELETE | `/api/user/history/:id` | ✅ |

## Example requests

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"you@example.com","password":"Secret123","name":"You"}'

# Generate (cookies carry the auth)
curl -X POST http://localhost:5000/api/tools/hook-generator/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"topic":"cold brew coffee","platform":"instagram"}'
```

## Adding a new tool

Just append to `src/config/tools.config.ts`:

```ts
{
  id: "my-new-tool",
  name: "AI My New Tool",
  category: "marketing",
  description: "What it does.",
  inputs: ["field1", "field2"],
}
```

The route, validation, history tracking, and quota all work automatically.

## AI service

Every AI feature uses the same single environment key:

```env
AI_API_KEY=your_key
```

There are no provider-specific API key environment variables and no separate env variables for provider, model, or base URL.

## Deploy

### Render

1. Push to GitHub
2. Render → New → Web Service → connect repo
3. Set env vars from `.env.example` (Render auto-generates JWT secrets via `render.yaml`)
4. Deploy

### Fly.io

```bash
fly launch          # First time only
fly secrets set MONGODB_URI="..." JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." GOOGLE_CLIENT_ID="..." CLIENT_URL="..." AI_API_KEY="..."
fly deploy
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Watch mode with tsx |
| `npm run build` | Compile TS → `dist/` |
| `npm start` | Run compiled JS |
| `npm run typecheck` | Type-check without emit |

## Security checklist

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT in httpOnly + secure + sameSite cookies (prod)
- ✅ Helmet headers
- ✅ CORS restricted to `CLIENT_URL`
- ✅ Rate limiting on auth + API
- ✅ Zod input validation on every endpoint
- ✅ Centralized error handler (no stack leaks in prod)
- ✅ Non-root Docker user
- ✅ Trust proxy enabled for Render/Fly
- ✅ Graceful shutdown
- ✅ Request ID tracing
