
import { NextRequest } from 'next/server';
import { createApiResponse, createApiErrorResponse } from '@/lib/api-helpers';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
import User from '@/models/User';
import Group from '@/models/Group';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { logError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const type = searchParams.get('type'); // 'skills', 'users', 'groups'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        if (!query) {
            return createApiErrorResponse('Search query is required', 400);
        }

        const sanitizedQuery = sanitizeSearchQuery(query);

        if (!sanitizedQuery) {
            return createApiErrorResponse('Invalid search query', 400);
        }

        await connectDB();

        let results: any;
        let total: number;

        const searchPipeline = (index: string, searchFields: string[]) => [
            {
                $search: {
                    index,
                    text: {
                        query: sanitizedQuery,
                        path: searchFields,
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 2,
                        },
                    },
                },
            },
        ];

        switch (type) {
            case 'skills':
                [results, total] = await searchAndCount(Skill, searchPipeline('skills_search', ['name', 'description', 'tags']), skip, limit);
                break;
            case 'users':
                [results, total] = await searchAndCount(User, searchPipeline('users_search', ['name', 'bio']), skip, limit);
                break;
            case 'groups':
                [results, total] = await searchAndCount(Group, searchPipeline('groups_search', ['name', 'description', 'tags']), skip, limit);
                break;
            default:
                // If no type is specified, search across all collections
                const [skills, users, groups] = await Promise.all([
                    searchAndCount(Skill, searchPipeline('skills_search', ['name', 'description', 'tags']), 0, 5),
                    searchAndCount(User, searchPipeline('users_search', ['name', 'bio']), 0, 5),
                    searchAndCount(Group, searchPipeline('groups_search', ['name', 'description', 'tags']), 0, 5),
                ]);
                results = { skills: skills[0], users: users[0], groups: groups[0] };
                total = skills[1] + users[1] + groups[1];
                break;
        }

        return createApiResponse({
            results,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        logError(error, { action: 'search' });
        return createApiErrorResponse('Failed to perform search');
    }
}

async function searchAndCount(model: any, pipeline: any[], skip: number, limit: number): Promise<[any[], number]> {
    const results = await model.aggregate(pipeline).skip(skip).limit(limit);
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await model.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    return [results, total];
}

