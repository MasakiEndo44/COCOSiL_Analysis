# Vercel Prisma SQLite Error Fix

## Problem

Runtime error in Vercel production:
```
Error code 14: Unable to open the database file
```

Despite PostgreSQL configuration in `schema.prisma` and correct environment variables.

## Root Cause

**Build cache timing issue with Prisma Client generation:**

1. Vercel environment variables ARE available during `npm install`
2. However, @prisma/client's postinstall hook may use **cached SQLite client** from previous builds
3. Even explicit `prisma generate` in buildCommand doesn't override the cached version
4. Next.js serverless bundle includes the wrong (SQLite) Prisma Client

## Solution

### Step 1: Add Vercel Environment Variable

**Vercel Dashboard → Project Settings → Environment Variables**

Add the following variable:

- **Name**: `PRISMA_SKIP_POSTINSTALL_GENERATE`
- **Value**: `1`
- **Environments**: ✓ Production, ✓ Preview, ✓ Development

This **completely disables** @prisma/client's automatic postinstall generation.

### Step 2: Verify buildCommand

Ensure `vercel.json` contains:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

This ensures Prisma Client is generated **only once** during buildCommand with correct environment variables.

### Step 3: Clear Build Cache and Redeploy

1. Go to **Vercel Dashboard → Deployments**
2. Select the latest deployment
3. Click **...** menu → **Redeploy**
4. **IMPORTANT**: Uncheck "Use existing Build Cache"
5. Click **Redeploy**

## Verification

### Check Build Logs

Confirm the following appears in build logs:

```
Running "prisma generate && prisma migrate deploy && next build"
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres" at "aws-1-ap-northeast-1.pooler.supabase.com:5432"
✔ Generated Prisma Client
```

### Test Admin Login

1. Navigate to `https://yourapp.vercel.app/admin/login`
2. Enter password: `5546`
3. Should successfully login without errors

### Runtime Logs

No "Error code 14" should appear in Runtime Logs.

## Why This Works

### Without PRISMA_SKIP_POSTINSTALL_GENERATE:

```
npm install
  → @prisma/client postinstall runs
  → May use cached SQLite client
  → Generates with cached configuration

buildCommand: prisma generate
  → Generates PostgreSQL client
  → But Next.js may have already cached SQLite references

Result: SQLite client in serverless bundle
```

### With PRISMA_SKIP_POSTINSTALL_GENERATE=1:

```
npm install
  → @prisma/client postinstall SKIPPED
  → No client generated yet

buildCommand: prisma generate
  → FIRST and ONLY generation
  → Reads DATABASE_URL from Vercel env vars
  → Generates PostgreSQL client

next build
  → Bundles PostgreSQL Prisma Client

Result: PostgreSQL client in serverless bundle ✓
```

## Additional Notes

### Local Development

For local development, you can either:

1. Not set `PRISMA_SKIP_POSTINSTALL_GENERATE` locally (postinstall will work)
2. Or add to `package.json`:
   ```json
   "postinstall": "if [ -z \"$VERCEL\" ]; then prisma generate; fi"
   ```

This ensures local `npm install` still generates Prisma Client.

### Environment Variable Priority

Vercel environment variables are available:
- ✅ During npm install (all package postinstall hooks)
- ✅ During buildCommand
- ✅ At runtime (serverless functions)

The only exception is if a variable is marked "Runtime" only (not "Build & Runtime").

## References

- Codex analysis: 2025-10-03
- Vercel environment variable injection timing
- Prisma Client generation lifecycle
- Next.js serverless bundling behavior

---

**Status**: Solution implemented and tested
**Date**: 2025-10-03
**Issue**: Resolved with PRISMA_SKIP_POSTINSTALL_GENERATE=1
