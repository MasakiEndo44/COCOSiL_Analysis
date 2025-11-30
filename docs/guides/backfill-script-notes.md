# Backfill Script Implementation Notes

## Current Limitation

The backfill script at `scripts/backfill-diagnosis-records.ts` has a critical limitation:

**DiagnosisRecord schema does not contain email field**, making server-side matching to Clerk users impossible without additional metadata.

## Available Fields in DiagnosisRecord

```typescript
{
  id, sessionId, clerkUserId,
  name, birthDate, age, gender,
  zodiac, animal, mbti, mainTaiheki, subTaiheki, sixStar,
  // ... other diagnosis results
  createdAt, updatedAt
}
```

## Why Server-Side Backfill is Limited

Without email or other unique identifiers that link to Clerk users:
- Cannot query Clerk API to match existing records
- Name matching is unreliable (common names, typos)
- birthDate alone is not unique enough

## Primary Migration Strategy

**Phase 2.4.2 (Anonymous Migration)** is the main solution:

1. **Client-Side Detection**: When user signs up, detect existing localStorage diagnosis data
2. **Automatic Migration**: POST to `/api/diagnosis/migrate` with authentication
3. **Link Records**: Server updates `clerkUserId` for migrated records
4. **Cleanup**: Clear localStorage after successful migration

## When Backfill Script is Useful

The backfill script becomes useful if:
1. **Email field is added** to DiagnosisRecord schema in future
2. **Separate user metadata table** exists with diagnosis-to-email mapping
3. **sessionId can be correlated** with Clerk session metadata

## Recommended Approach

For existing anonymous diagnosis records in production:
1. Rely on client-side migration when users sign up (Phase 2.4.2)
2. Keep backfill script as template for future use if email field is added
3. Consider adding email to schema in future if user consent is obtained

## Implementation Status

- ✅ Backfill script template created
- ⏳ Awaiting schema enhancement or metadata source
- ➡️ Proceeding with Phase 2.4.2 (primary migration strategy)
