import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Exchange from "@/models/Exchange";
import Skill from "@/models/Skill";
import { createApiResponse, createApiErrorResponse } from "@/lib/api-helpers";
import { logError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createApiErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await connectDB();

    let query: any = {
      $or: [{ offeredBy: session.user.id }, { requestedBy: session.user.id }],
    };

    if (status) {
      query.status = status;
    }

    const exchanges = await Exchange.find(query)
      .populate("offeredBy", "name email avatar")
      .populate("requestedBy", "name email avatar")
      .populate("skills.offered", "name category level")
      .populate("skills.requested", "name category level")
      .sort({ createdAt: -1 });

    // Note: messages are embedded documents, not populated

    return createApiResponse(exchanges);
  } catch (error) {
    logError(error, { action: "fetch_exchanges", userId: session?.user?.id });
    return createApiErrorResponse("Failed to fetch exchanges");
  }
}

import { areValidObjectIds } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createApiErrorResponse("Unauthorized", 401);
    }

    const { participantId, offeredSkillId, requestedSkillId, initialMessage, scheduledFor } =
      await request.json();

    if (!participantId || !offeredSkillId || !requestedSkillId) {
      return createApiErrorResponse("Missing required fields", 400);
    }

    // Prevent self-exchanges
    if (session.user.id === participantId) {
      return createApiErrorResponse(
        "You cannot start an exchange with yourself",
        400,
      );
    }

    if (!areValidObjectIds([participantId, offeredSkillId, requestedSkillId])) {
      return createApiErrorResponse("Invalid ID format", 400);
    }

    await connectDB();

    // Fetch current user and participant to validate skills
    const User = (await import("@/models/User")).default;
    const currentUser = await User.findById(session.user.id).populate(
      "skillsToTeach",
    );
    const participant =
      await User.findById(participantId).populate("skillsToTeach");

    if (!currentUser || !participant) {
      return createApiErrorResponse("User not found", 404);
    }

    // Validate that offered skill belongs to current user's skillsToTeach
    const userTeachesOfferedSkill = currentUser.skillsToTeach?.some(
      (skill: any) => skill._id.toString() === offeredSkillId,
    );

    if (!userTeachesOfferedSkill) {
      return createApiErrorResponse(
        "You can only teach skills you have defined in your profile",
        403,
      );
    }

    // Validate that requested skill belongs to participant's skillsToTeach
    const participantTeachesRequestedSkill = participant.skillsToTeach?.some(
      (skill: any) => skill._id.toString() === requestedSkillId,
    );

    if (!participantTeachesRequestedSkill) {
      return createApiErrorResponse(
        "The other user does not teach the skill you want to learn",
        403,
      );
    }

    // Check if exchange already exists
    const existingExchange = await Exchange.findOne({
      $or: [
        { offeredBy: session.user.id, requestedBy: participantId },
        { offeredBy: participantId, requestedBy: session.user.id },
      ],
      status: { $in: ["pending", "active"] },
    });

    if (existingExchange) {
      return createApiErrorResponse(
        "Exchange already exists with this user",
        409,
      );
    }

    const exchange = new Exchange({
      offeredBy: session.user.id,
      requestedBy: participantId,
      skills: {
        offered: offeredSkillId,
        requested: requestedSkillId,
      },
      status: "pending",
      messages: initialMessage ? [{
        sender: session.user.id,
        content: initialMessage,
        type: "exchange_request",
        readBy: [{ user: session.user.id, readAt: new Date() }]
      }] : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    await exchange.save();

    const user = await User.findById(session.user.id);

    if (user) {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      if (user.lastExchange && user.lastExchange > lastWeek) {
        user.exchangeStreak = (user.exchangeStreak || 0) + 1;
      } else {
        user.exchangeStreak = 1;
      }

      user.lastExchange = today;
      await user.save();
    }

    // Populate the exchange before returning
    const populatedExchange = await Exchange.findById(exchange._id)
      .populate("offeredBy", "name email avatar")
      .populate("requestedBy", "name email avatar")
      .populate("skills.offered", "name category level")
      .populate("skills.requested", "name category level");

    return createApiResponse(populatedExchange, 201);
  } catch (error) {
    logError(error, { action: "create_exchange", userId: session?.user?.id });
    return createApiErrorResponse("Failed to create exchange");
  }
}
