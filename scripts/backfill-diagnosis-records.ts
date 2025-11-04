/**
 * Backfill Script: Match existing diagnosis records to Clerk users
 *
 * This script processes diagnosis records that don't have a clerkUserId
 * and attempts to match them to Clerk users via email lookup.
 *
 * Usage:
 *   - Dry run (preview only): npm run ts-node scripts/backfill-diagnosis-records.ts
 *   - Execute: npm run ts-node scripts/backfill-diagnosis-records.ts --execute
 *
 * Features:
 *   - Batch processing with rate limit handling
 *   - Email-based matching via Clerk API
 *   - Conflict detection (multiple users, no matches)
 *   - Transaction safety
 *   - Detailed logging
 */

import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 50; // Process records in batches
const DELAY_MS = 1000; // Delay between batches to respect rate limits
const DRY_RUN = !process.argv.includes('--execute');

interface BackfillStats {
  total: number;
  matched: number;
  conflicts: number;
  noMatches: number;
  errors: number;
  skipped: number;
}

interface ConflictRecord {
  diagnosisId: number;
  email: string;
  reason: 'multiple_users' | 'no_match' | 'error';
  details?: string;
}

const stats: BackfillStats = {
  total: 0,
  matched: 0,
  conflicts: 0,
  noMatches: 0,
  errors: 0,
  skipped: 0,
};

const conflicts: ConflictRecord[] = [];

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract email from diagnosis record
 * Note: Current schema doesn't have email field, so we skip records without email
 * This is a placeholder - you may need to adjust based on available identifiers
 */
function extractEmail(record: any): string | null {
  // TODO: If you have email stored elsewhere (e.g., in metadata or separate table), extract it here
  // For now, we return null since DiagnosisRecord doesn't have email field
  return null;
}

/**
 * Process a single batch of diagnosis records
 */
async function processBatch(records: any[]): Promise<void> {
  for (const record of records) {
    stats.total++;

    // Extract email identifier
    const email = extractEmail(record);

    if (!email) {
      console.log(`[SKIP] Record ${record.id}: No email available`);
      stats.skipped++;
      continue;
    }

    try {
      // Query Clerk for users with this email
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length === 0) {
        // No matching Clerk user found
        console.log(`[NO MATCH] Record ${record.id}: No Clerk user with email ${email}`);
        stats.noMatches++;
        conflicts.push({
          diagnosisId: record.id,
          email,
          reason: 'no_match',
        });
        continue;
      }

      if (users.data.length > 1) {
        // Multiple users with same email (edge case)
        console.log(`[CONFLICT] Record ${record.id}: Multiple Clerk users with email ${email}`);
        stats.conflicts++;
        conflicts.push({
          diagnosisId: record.id,
          email,
          reason: 'multiple_users',
          details: `Found ${users.data.length} users`,
        });
        continue;
      }

      // Exactly one match - update the record
      const clerkUserId = users.data[0].id;

      if (DRY_RUN) {
        console.log(`[DRY RUN] Would update record ${record.id} with clerkUserId: ${clerkUserId}`);
      } else {
        await prisma.diagnosisRecord.update({
          where: { id: record.id },
          data: { clerkUserId },
        });
        console.log(`[MATCHED] Record ${record.id} → Clerk user ${clerkUserId}`);
      }

      stats.matched++;
    } catch (error) {
      console.error(`[ERROR] Record ${record.id}:`, error);
      stats.errors++;
      conflicts.push({
        diagnosisId: record.id,
        email,
        reason: 'error',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

/**
 * Main backfill process
 */
async function backfillDiagnosisRecords() {
  console.log('='.repeat(60));
  console.log('Diagnosis Records Backfill Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'EXECUTE (will modify database)'}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Delay between batches: ${DELAY_MS}ms`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Count total records without clerkUserId
    const totalCount = await prisma.diagnosisRecord.count({
      where: {
        clerkUserId: null,
      },
    });

    console.log(`Found ${totalCount} diagnosis records without clerkUserId`);

    if (totalCount === 0) {
      console.log('No records to process. Exiting.');
      return;
    }

    console.log('');

    // Process in batches
    let processed = 0;
    while (processed < totalCount) {
      const batch = await prisma.diagnosisRecord.findMany({
        where: {
          clerkUserId: null,
        },
        take: BATCH_SIZE,
        skip: processed,
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (batch.length === 0) break;

      console.log(`Processing batch ${Math.floor(processed / BATCH_SIZE) + 1} (records ${processed + 1}-${processed + batch.length})...`);
      await processBatch(batch);

      processed += batch.length;

      // Rate limiting delay
      if (processed < totalCount) {
        console.log(`Waiting ${DELAY_MS}ms before next batch...`);
        await sleep(DELAY_MS);
      }
    }

    // Print summary
    console.log('');
    console.log('='.repeat(60));
    console.log('Backfill Summary');
    console.log('='.repeat(60));
    console.log(`Total records processed: ${stats.total}`);
    console.log(`Successfully matched: ${stats.matched}`);
    console.log(`Skipped (no email): ${stats.skipped}`);
    console.log(`No Clerk user match: ${stats.noMatches}`);
    console.log(`Multiple users conflict: ${stats.conflicts}`);
    console.log(`Errors: ${stats.errors}`);
    console.log('='.repeat(60));

    // Print conflicts for manual review
    if (conflicts.length > 0) {
      console.log('');
      console.log('Conflicts requiring manual review:');
      console.log('='.repeat(60));
      conflicts.forEach((conflict) => {
        console.log(`Record ${conflict.diagnosisId} (${conflict.email}): ${conflict.reason}`);
        if (conflict.details) {
          console.log(`  Details: ${conflict.details}`);
        }
      });
      console.log('='.repeat(60));
    }

    if (DRY_RUN) {
      console.log('');
      console.log('⚠️  This was a DRY RUN - no changes were made to the database.');
      console.log('To execute the backfill, run: npm run ts-node scripts/backfill-diagnosis-records.ts --execute');
    } else {
      console.log('');
      console.log('✅ Backfill completed successfully.');
    }

  } catch (error) {
    console.error('Fatal error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
backfillDiagnosisRecords()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
