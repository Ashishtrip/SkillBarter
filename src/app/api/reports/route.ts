import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import { sanitizeString } from '@/lib/sanitize';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const { 
      reportType, 
      reason, 
      description, 
      reportedUserId, 
      reportedContentId, 
      reportedExchangeId, 
      reportedGroupId 
    } = await request.json();

    // Sanitize inputs
    const sanitizedDescription = sanitizeString(description);

    if (!reportType || !reason || !sanitizedDescription) {
      return createApiErrorResponse(
        'Report type, reason, and description are required',
        400
      );
    }

    // Validate that at least one reported entity is provided
    const hasReportedEntity = reportedUserId || reportedContentId || reportedExchangeId || reportedGroupId;
    if (!hasReportedEntity) {
      return createApiErrorResponse(
        'At least one reported entity must be specified',
        400
      );
    }

    await connectDB();

    // Check if user has already reported this entity
    const existingReport = await Report.findOne({
      reporter: session.user.id,
      reportType,
      $or: [
        { reportedUser: reportedUserId },
        { reportedContent: reportedContentId },
        { reportedExchange: reportedExchangeId },
        { reportedGroup: reportedGroupId },
      ],
    });

    if (existingReport) {
      return createApiErrorResponse('You have already reported this item', 400);
    }

    const report = new Report({
      reporter: session.user.id,
      reportType,
      reason,
      description: sanitizedDescription,
      reportedUser: reportedUserId,
      reportedContent: reportedContentId,
      reportedExchange: reportedExchangeId,
      reportedGroup: reportedGroupId,
      status: 'pending',
      priority: reason === 'harassment' || reason === 'scam' ? 'high' : 'medium',
    });

    await report.save();

    return createApiResponse(report, 201);
  } catch (error) {
    logError(error, { action: 'create_report', userId: session?.user?.id });
    return createApiErrorResponse('Failed to create report');
  }
}

export async function GET(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    // Check if user is admin (you would implement proper admin check)
    const isAdmin = false; // Implement admin check logic

    if (!isAdmin) {
      return createApiErrorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    await connectDB();

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    return createApiResponse({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { action: 'fetch_reports', userId: session?.user?.id });
    return createApiErrorResponse('Failed to fetch reports');
  }
}
