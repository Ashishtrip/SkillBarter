import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Skill from "@/models/Skill";
import Exchange from "@/models/Exchange";
import Group from "@/models/Group";
import Content from "@/models/Content";
import type {
  User as IUser,
  Skill as ISkill,
  Exchange as IExchange,
} from "@/types";

export interface SkillRecommendation {
  skill: {
    _id: string;
    name: string;
    category: string;
    level: string;
    description?: string;
  };
  reason: string;
  confidence: number;
  suggestedBy?: string;
}

export interface UserRecommendation {
  user: {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    averageRating: number;
    totalReviews: number;
  };
  reason: string;
  confidence: number;
  matchingSkills: string[];
}

export interface ContentRecommendation {
  content: {
    _id: string;
    title: string;
    contentType: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
    author: string;
    upvotes: number;
    views: number;
  };
  reason: string;
  confidence: number;
}

export async function getSkillRecommendations(
  userId: string,
  limit = 10,
): Promise<SkillRecommendation[]> {
  try {
    await connectDB();

    const user = await User.findById(userId).populate(
      "skillsToTeach skillsToLearn",
    );
    if (!user) return [];
    const typedUser = user as unknown as IUser & {
      skillsToTeach: ISkill[];
      skillsToLearn: ISkill[];
    };

    const recommendations: SkillRecommendation[] = [];

    // 1. Skills that complement what they teach
    for (const teachingSkill of typedUser.skillsToTeach) {
      const complementarySkills = (await Skill.find({
        category: teachingSkill.category,
        _id: { $nin: typedUser.skillsToLearn.map((s: ISkill) => s._id) },
        level: { $in: ["beginner", "intermediate"] },
      }).limit(3)) as unknown as Array<ISkill & { _id: any }>;

      for (const skill of complementarySkills) {
        recommendations.push({
          skill: {
            _id: skill._id.toString(),
            name: skill.name,
            category: skill.category,
            level: skill.level,
            description: skill.description,
          },
          reason: `Since you teach ${teachingSkill.name}, you might want to learn ${skill.name} to expand your ${skill.category} knowledge`,
          confidence: 0.8,
          suggestedBy: teachingSkill.name,
        });
      }
    }

    // 2. Popular skills in their categories
    const userCategories = Array.from(
      new Set<string>([
        ...typedUser.skillsToTeach.map((s: ISkill) => s.category),
        ...typedUser.skillsToLearn.map((s: ISkill) => s.category),
      ]),
    );

    for (const category of userCategories) {
      const popularSkills = (await Skill.aggregate([
        {
          $match: {
            category,
            _id: { $nin: typedUser.skillsToLearn.map((s: ISkill) => s._id) },
          },
        },
        {
          $lookup: {
            from: "exchanges",
            localField: "_id",
            foreignField: "skills.requested",
            as: "exchanges",
          },
        },
        { $addFields: { exchangeCount: { $size: "$exchanges" } } },
        { $sort: { exchangeCount: -1 } },
        { $limit: 2 },
      ])) as Array<{
        _id: any;
        name: string;
        category: string;
        level: string;
        description?: string;
      }>;

      for (const skill of popularSkills) {
        recommendations.push({
          skill: {
            _id: skill._id.toString(),
            name: skill.name,
            category: skill.category,
            level: skill.level,
            description: skill.description,
          },
          reason: `Popular skill in ${category} category`,
          confidence: 0.6,
        });
      }
    }

    // 3. Skills from successful exchanges
    const completedExchanges = await Exchange.find({
      participants: userId,
      status: "completed",
    }).populate("skills.offered skills.requested");

    for (const exchange of completedExchanges) {
      const typedExchange = exchange as unknown as IExchange & {
        participants: any[];
      };
      const otherParticipantId = typedExchange.participants.find(
        (p: unknown) => String(p) !== userId,
      ) as string | undefined;
      if (!otherParticipantId) continue;
      const otherParticipantSkills =
        await User.findById(otherParticipantId).populate("skillsToTeach");

      const typedOther = otherParticipantSkills as unknown as
        | (IUser & { skillsToTeach: ISkill[] })
        | null;

      if (typedOther) {
        for (const skill of typedOther.skillsToTeach) {
          if (
            !typedUser.skillsToLearn.some(
              (s: ISkill) => String(s._id) === String(skill._id),
            )
          ) {
            recommendations.push({
              skill: {
                _id: String(skill._id),
                name: (skill as ISkill).name,
                category: (skill as ISkill).category,
                level: (skill as ISkill).level,
                description: (skill as ISkill).description,
              },
              reason: `Recommended by someone you've successfully exchanged with`,
              confidence: 0.9,
            });
          }
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) =>
        index === self.findIndex((r) => r.skill._id === rec.skill._id),
    );

    return uniqueRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting skill recommendations:", error);
    return [];
  }
}

export async function getUserRecommendations(
  userId: string,
  limit = 10,
): Promise<UserRecommendation[]> {
  try {
    await connectDB();

    const user = await User.findById(userId).populate(
      "skillsToTeach skillsToLearn",
    );
    if (!user) return [];
    const typedUser = user as unknown as IUser & {
      skillsToTeach: ISkill[];
      skillsToLearn: ISkill[];
    };

    const recommendations: UserRecommendation[] = [];

    // 1. Users who teach skills the current user wants to learn
    const skillsToLearnIds = typedUser.skillsToLearn.map((s: ISkill) => s._id);

    if (skillsToLearnIds.length > 0) {
      const potentialTeachers = await User.find({
        _id: { $ne: userId },
        skillsToTeach: { $in: skillsToLearnIds },
        averageRating: { $gte: 3.0 },
      })
        .populate("skillsToTeach")
        .limit(20);

      for (const teacher of potentialTeachers) {
        const typedTeacher = teacher as unknown as IUser & {
          skillsToTeach: ISkill[];
        };
        const matchingSkills = typedTeacher.skillsToTeach.filter(
          (teachingSkill: ISkill) =>
            typedUser.skillsToLearn.some(
              (learningSkill: ISkill) =>
                String(learningSkill._id) === String(teachingSkill._id),
            ),
        );

        if (matchingSkills.length > 0) {
          recommendations.push({
            user: {
              _id: teacher._id.toString(),
              name: teacher.name,
              email: teacher.email,
              bio: teacher.bio,
              location: teacher.location,
              averageRating: teacher.averageRating,
              totalReviews: teacher.totalReviews,
            },
            reason: `Can teach you ${matchingSkills.map((s: ISkill) => s.name).join(", ")}`,
            confidence: 0.9,
            matchingSkills: matchingSkills.map((s: ISkill) => s.name),
          });
        }
      }
    }

    // 2. Users who want to learn skills the current user teaches
    const skillsToTeachIds = typedUser.skillsToTeach.map((s: ISkill) => s._id);

    if (skillsToTeachIds.length > 0) {
      const potentialStudents = await User.find({
        _id: { $ne: userId },
        skillsToLearn: { $in: skillsToTeachIds },
        averageRating: { $gte: 3.0 },
      })
        .populate("skillsToLearn")
        .limit(20);

      for (const student of potentialStudents) {
        const typedStudent = student as unknown as IUser & {
          skillsToLearn: ISkill[];
        };
        const matchingSkills = typedStudent.skillsToLearn.filter(
          (learningSkill: ISkill) =>
            typedUser.skillsToTeach.some(
              (teachingSkill: ISkill) =>
                String(teachingSkill._id) === String(learningSkill._id),
            ),
        );

        if (matchingSkills.length > 0) {
          recommendations.push({
            user: {
              _id: student._id.toString(),
              name: student.name,
              email: student.email,
              bio: student.bio,
              location: student.location,
              averageRating: student.averageRating,
              totalReviews: student.totalReviews,
            },
            reason: `Wants to learn ${matchingSkills.map((s: ISkill) => s.name).join(", ")} from you`,
            confidence: 0.8,
            matchingSkills: matchingSkills.map((s: ISkill) => s.name),
          });
        }
      }
    }

    // 3. Users with similar interests (same categories)
    const userCategories = Array.from(
      new Set<string>([
        ...typedUser.skillsToTeach.map((s: ISkill) => s.category),
        ...typedUser.skillsToLearn.map((s: ISkill) => s.category),
      ]),
    );

    const similarUsers = await User.find({
      _id: { $ne: userId },
      $or: [
        { "skillsToTeach.category": { $in: userCategories } },
        { "skillsToLearn.category": { $in: userCategories } },
      ],
      averageRating: { $gte: 3.0 },
    })
      .populate("skillsToTeach skillsToLearn")
      .limit(15);

    for (const similarUser of similarUsers) {
      const typedSimilar = similarUser as unknown as IUser & {
        skillsToTeach: ISkill[];
        skillsToLearn: ISkill[];
      };
      const commonCategories = Array.from(
        new Set<string>([
          ...typedSimilar.skillsToTeach.map((s: ISkill) => s.category),
          ...typedSimilar.skillsToLearn.map((s: ISkill) => s.category),
        ]),
      ).filter((cat: string) => userCategories.includes(cat));

      if (commonCategories.length > 0) {
        recommendations.push({
          user: {
            _id: similarUser._id.toString(),
            name: similarUser.name,
            email: similarUser.email,
            bio: similarUser.bio,
            location: similarUser.location,
            averageRating: similarUser.averageRating,
            totalReviews: similarUser.totalReviews,
          },
          reason: `Similar interests in ${commonCategories.join(", ")}`,
          confidence: 0.6,
          matchingSkills: [],
        });
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) =>
        index === self.findIndex((r) => r.user._id === rec.user._id),
    );

    return uniqueRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting user recommendations:", error);
    return [];
  }
}

export async function getContentRecommendations(
  userId: string,
  limit = 10,
): Promise<ContentRecommendation[]> {
  try {
    await connectDB();

    const user = await User.findById(userId).populate(
      "skillsToTeach skillsToLearn",
    );
    if (!user) return [];
    const typedUser = user as unknown as IUser & {
      skillsToTeach: ISkill[];
      skillsToLearn: ISkill[];
    };

    const recommendations: ContentRecommendation[] = [];

    // 1. Content related to skills they want to learn
    const skillsToLearnIds = typedUser.skillsToLearn.map((s: ISkill) => s._id);

    if (skillsToLearnIds.length > 0) {
      const relatedContent = await Content.find({
        skills: { $in: skillsToLearnIds },
        status: "published",
        isPublic: true,
      })
        .populate("author", "name")
        .sort({ upvotes: -1, views: -1 })
        .limit(10);

      for (const content of relatedContent) {
        recommendations.push({
          content: {
            _id: content._id.toString(),
            title: content.title,
            contentType: content.contentType,
            category: content.category,
            difficulty: content.difficulty,
            estimatedTime: content.estimatedTime,
            author: (content.author as any).name,
            upvotes: content.upvotes.length,
            views: content.views,
          },
          reason: `Related to skills you want to learn`,
          confidence: 0.8,
        });
      }
    }

    // 2. Popular content in their categories
    const userCategories = Array.from(
      new Set<string>([
        ...typedUser.skillsToTeach.map((s: ISkill) => s.category),
        ...typedUser.skillsToLearn.map((s: ISkill) => s.category),
      ]),
    );

    const popularContent = await Content.find({
      category: { $in: userCategories },
      status: "published",
      isPublic: true,
    })
      .populate("author", "name")
      .sort({ upvotes: -1, views: -1 })
      .limit(10);

    for (const content of popularContent) {
      if (
        !recommendations.some((r) => r.content._id === content._id.toString())
      ) {
        recommendations.push({
          content: {
            _id: content._id.toString(),
            title: content.title,
            contentType: content.contentType,
            category: content.category,
            difficulty: content.difficulty,
            estimatedTime: content.estimatedTime,
            author: (content.author as any).name,
            upvotes: content.upvotes.length,
            views: content.views,
          },
          reason: `Popular in ${content.category} category`,
          confidence: 0.6,
        });
      }
    }

    // 3. Content from users they've interacted with
    const completedExchanges = await Exchange.find({
      participants: userId,
      status: "completed",
    });

    const interactedUserIds = completedExchanges.flatMap((ex) => {
      const typedExchange = ex as unknown as IExchange & {
        participants: any[];
      };
      return typedExchange.participants.filter(
        (p: any) => p.toString() !== userId,
      );
    });

    if (interactedUserIds.length > 0) {
      const contentFromInteractions = await Content.find({
        author: { $in: interactedUserIds },
        status: "published",
        isPublic: true,
      })
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(5);

      for (const content of contentFromInteractions) {
        if (
          !recommendations.some((r) => r.content._id === content._id.toString())
        ) {
          recommendations.push({
            content: {
              _id: content._id.toString(),
              title: content.title,
              contentType: content.contentType,
              category: content.category,
              difficulty: content.difficulty,
              estimatedTime: content.estimatedTime,
              author: (content.author as any).name,
              upvotes: content.upvotes.length,
              views: content.views,
            },
            reason: `From someone you've exchanged with`,
            confidence: 0.7,
          });
        }
      }
    }

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting content recommendations:", error);
    return [];
  }
}
