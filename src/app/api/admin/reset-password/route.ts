import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

/**
 * Admin Password Reset API
 *
 * This endpoint allows resetting the admin password using a secure reset token.
 *
 * Security considerations:
 * - Requires RESET_TOKEN environment variable to be set
 * - Should only be used in controlled deployment environments
 * - Remove or disable in production after initial setup
 *
 * Usage:
 * POST /api/admin/reset-password
 * Body: { "resetToken": "your-secure-token" }
 *
 * Environment variables required:
 * - RESET_TOKEN: Secure random token for authorization
 * - ADMIN_PASSWORD: The new password to set (defaults to '5546')
 */
export async function POST(request: NextRequest) {
  try {
    const { resetToken } = await request.json();

    // Validate reset token
    const expectedToken = process.env.RESET_TOKEN;

    if (!expectedToken) {
      console.error('[Reset Password] RESET_TOKEN environment variable not set');
      return NextResponse.json(
        {
          success: false,
          error: 'Reset token not configured. Set RESET_TOKEN environment variable.'
        },
        { status: 500 }
      );
    }

    if (resetToken !== expectedToken) {
      console.warn('[Reset Password] Invalid reset token attempt');
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 401 }
      );
    }

    // Get new password from environment variable
    const newPassword = process.env.ADMIN_PASSWORD || '5546';

    console.log('[Reset Password] Generating password hash...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update admin user password
    const result = await adminDb.adminUser.update({
      where: { username: 'admin' },
      data: { password: hashedPassword },
    });

    console.log('[Reset Password] Password reset successfully for user:', result.username);

    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully',
      username: result.username,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Reset Password] Error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin user not found. Run seed script first.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Password reset failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if reset is available (for debugging)
 * Returns status without performing any actions
 */
export async function GET() {
  const hasResetToken = !!process.env.RESET_TOKEN;
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD;

  return NextResponse.json({
    available: hasResetToken,
    configured: {
      resetToken: hasResetToken,
      adminPassword: hasAdminPassword,
    },
    message: hasResetToken
      ? 'Password reset is available'
      : 'Set RESET_TOKEN environment variable to enable password reset',
  });
}
