import { NextRequest } from 'next/server';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import { logError } from '@/lib/error-handler';

const defaultSkills: Array<Partial<Record<string, any>>> = [
  { name: 'JavaScript', category: 'tech', level: 'intermediate', description: 'Web programming with JS', tags: ['javascript', 'web'] } as any,
  { name: 'Guitar', category: 'music', level: 'beginner', description: 'Acoustic guitar basics', tags: ['guitar', 'music'] } as any,
  { name: 'Spanish', category: 'languages', level: 'beginner', description: 'Conversational Spanish', tags: ['spanish', 'language'] } as any,
  { name: 'Project Management', category: 'management', level: 'intermediate', description: 'Agile basics', tags: ['agile', 'pm'] } as any,
];

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get a list of skills
 *     description: Returns a list of all skills in the database.
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: A list of skills.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Skill'
 */
export async function GET(request: NextRequest) {
  try {
  const { default: connectDB } = await import('@/lib/mongodb');
  const { default: Skill } = await import('@/models/Skill');

  await connectDB();

  const count = await Skill.countDocuments();
    if (count === 0) {
      // Return default list (not persisted) so UI can show examples
      return createApiResponse(defaultSkills);
    }

    const skills = await Skill.find({}).sort({ name: 1 }).limit(200);
    return createApiResponse(skills);
  } catch (error) {
    logError(error, { action: 'list_skills' });
    return createApiErrorResponse('Failed to list skills');
  }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidObjectId } from '@/lib/validation';
import { createSkillForUser } from '@/lib/skills-service';

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create a new skill
 *     description: Creates a new skill for the authenticated user.
 *     tags: [Skills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skill'
 *     responses:
 *       201:
 *         description: The created skill.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 */
export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    // Read session with authOptions
    session = await getServerSession(authOptions);

    // Allow fallback to DEMO_USER_ID for local testing without signing in
    const demoFallback = process.env.DEMO_USER_ID;

    const body = await request.json();
    const { name, category, level, description, tags, type } = body || {};

    // Basic validation
    if (!name || !category || !level) {
      return createApiErrorResponse('Missing required fields: name, category, level', 400);
    }

    // Validate session user id
    const userId = session?.user?.id || demoFallback;
    if (!userId) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    if (!isValidObjectId(userId)) {
      return createApiErrorResponse('Invalid user id in session', 401);
    }

  const { default: connectDB } = await import('@/lib/mongodb');
  const { default: Skill } = await import('@/models/Skill');
  const { default: User } = await import('@/models/User');

  await connectDB();

  // Delegate to injectable service (easier to test)
  const created = await createSkillForUser(userId, { name, category, level, description, tags }, Skill as any);
  
  // Add the skill to the user's appropriate array based on type
  // type can be 'teach' (skillsToTeach) or 'learn' (skillsToLearn), defaults to 'teach'
  const skillArrayKey = type === 'learn' ? 'skillsToLearn' : 'skillsToTeach';
  await User.findByIdAndUpdate(
    userId,
    { $push: { [skillArrayKey]: created._id } },
    { new: true }
  );
  
  return createApiResponse(created, 201);
  } catch (error) {
    logError(error, { action: 'create_skill', userId: session?.user?.id });
    return createApiErrorResponse('Failed to create skill');
  }
}

/**
 * @swagger
 * /api/skills:
 *   delete:
 *     summary: Delete a skill
 *     description: Deletes a skill by its ID.
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the skill to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The skill was deleted successfully.
 */
export async function DELETE(request: NextRequest) {
  let session: any = null;
  try {
    // allow session or DEMO_USER_ID
    session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return createApiErrorResponse('id is required', 400);
    if (!isValidObjectId(id)) return createApiErrorResponse('Invalid id', 400);

    const { default: connectDB } = await import('@/lib/mongodb');
    const { default: Skill } = await import('@/models/Skill');
    const { default: User } = await import('@/models/User');
    await connectDB();

    const skill = await Skill.findById(id);
    if (!skill) return createApiErrorResponse('Not found', 404);

    const requesterId = session?.user?.id || process.env.DEMO_USER_ID;
    if (!requesterId) return createApiErrorResponse('Unauthorized', 401);

    // Only allow owner to delete
    if (skill.createdBy.toString() !== requesterId) {
      return createApiErrorResponse('Forbidden', 403);
    }

    // Remove from user's skill arrays
    await User.findByIdAndUpdate(
      requesterId,
      { 
        $pull: { 
          skillsToTeach: id,
          skillsToLearn: id
        }
      }
    );

    await Skill.deleteOne({ _id: id });
    return createApiResponse({ success: true });
  } catch (error) {
    logError(error, { action: 'delete_skill', userId: session?.user?.id });
    return createApiErrorResponse('Failed to delete skill');
  }
}
