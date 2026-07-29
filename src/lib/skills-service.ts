import type { ISkill } from '@/models/Skill';
import { createValidationError } from './error-handler';

export type SkillLike = {
  create: (data: Partial<ISkill>) => Promise<any>;
};

/**
 * Create a skill given a signed-in user id and a Skill model.
 * This function is intentionally dependency-injected and has no heavy imports
 * so it can be unit-tested without pulling mongoose/mongoDB internals.
 */
export async function createSkillForUser(userId: string, body: any, SkillModel: SkillLike) {
  if (!userId) throw new Error('Missing user id');
  const { name, category, level, description, tags } = body || {};

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Name is required';
  if (!category) fieldErrors.category = 'Category is required';
  if (!level) fieldErrors.level = 'Level is required';
  if (Object.keys(fieldErrors).length) {
    throw createValidationError('Validation failed', { fieldErrors });
  }

  const skillData: Partial<ISkill> = {
    name: String(name).trim(),
    category: String(category).trim(),
    level: String(level).trim(),
    description: description ? String(description).trim() : undefined,
    tags: Array.isArray(tags) ? tags.map(String) : (typeof tags === 'string' ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    // Store createdBy as the user id string; Mongoose will coerce to ObjectId when saving.
    createdBy: userId as any,
  } as any;

  const created = await SkillModel.create(skillData);
  return created;
}

/**
 * Delete a skill if the given userId is the owner.
 * Throws errors for not found or forbidden.
 */
export async function deleteSkillForUser(userId: string, skillId: string, SkillModel: { findById: (id: string) => Promise<any>; deleteOne: (query: any) => Promise<any>; }) {
  if (!userId) throw new Error('Missing user id');
  if (!skillId) throw new Error('Missing skill id');

  const skill = await SkillModel.findById(skillId);
  if (!skill) {
    const err: any = new Error('Not found');
    err.status = 404;
    throw err;
  }

  if (skill.createdBy.toString() !== userId) {
    const err: any = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  await SkillModel.deleteOne({ _id: skillId });
  return true;
}
