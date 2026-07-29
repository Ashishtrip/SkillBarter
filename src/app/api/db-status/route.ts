import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Skill from '@/models/Skill';

export async function GET() {
  try {
    await connectDB();

    // Check user count
    const userCount = await User.countDocuments();
    const skillCount = await Skill.countDocuments();

    // Get sample users with skills
    const usersWithSkills = await User.find()
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .limit(5);

    return NextResponse.json({
      status: 'connected',
      userCount,
      skillCount,
      sampleUsers: usersWithSkills.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        skillsToTeach: user.skillsToTeach?.length || 0,
        skillsToLearn: user.skillsToLearn?.length || 0,
      })),
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});

    // Create skills
    const skills = [
      { name: 'JavaScript', category: 'tech', level: 'intermediate', description: 'Web programming' },
      { name: 'Python', category: 'tech', level: 'advanced', description: 'Data science and web dev' },
      { name: 'React', category: 'tech', level: 'intermediate', description: 'Frontend framework' },
      { name: 'Guitar', category: 'music', level: 'beginner', description: 'Acoustic guitar' },
      { name: 'Spanish', category: 'languages', level: 'beginner', description: 'Conversational Spanish' },
      { name: 'Photography', category: 'arts', level: 'intermediate', description: 'Portrait and landscape' },
      { name: 'Yoga', category: 'sports', level: 'beginner', description: 'Hatha yoga basics' },
      { name: 'Cooking', category: 'cooking', level: 'intermediate', description: 'Italian cuisine' },
    ];

    const createdSkills = await Skill.insertMany(skills);
    console.log(`Created ${createdSkills.length} skills`);

    // Create test users
    const testUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'hashedpassword123',
        bio: 'Passionate about web development and teaching',
        location: 'San Francisco, CA',
        githubProfile: 'https://github.com/alice',
        linkedinProfile: 'https://linkedin.com/in/alice',
        skillsToTeach: [createdSkills[0]._id, createdSkills[2]._id], // JavaScript, React
        skillsToLearn: [createdSkills[4]._id], // Spanish
        averageRating: 4.5,
        totalReviews: 12,
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'hashedpassword456',
        bio: 'Data scientist and Python enthusiast',
        location: 'New York, NY',
        githubProfile: 'https://github.com/bob',
        linkedinProfile: 'https://linkedin.com/in/bob',
        skillsToTeach: [createdSkills[1]._id], // Python
        skillsToLearn: [createdSkills[3]._id, createdSkills[5]._id], // Guitar, Photography
        averageRating: 4.8,
        totalReviews: 28,
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: 'hashedpassword789',
        bio: 'Music teacher and guitar instructor',
        location: 'Austin, TX',
        githubProfile: 'https://github.com/carol',
        linkedinProfile: 'https://linkedin.com/in/carol',
        skillsToTeach: [createdSkills[3]._id], // Guitar
        skillsToLearn: [createdSkills[0]._id], // JavaScript
        averageRating: 5,
        totalReviews: 45,
      },
      {
        name: 'David Lee',
        email: 'david@example.com',
        password: 'hashedpassword101',
        bio: 'Professional photographer and artist',
        location: 'Los Angeles, CA',
        githubProfile: 'https://github.com/david',
        linkedinProfile: 'https://linkedin.com/in/david',
        skillsToTeach: [createdSkills[5]._id, createdSkills[7]._id], // Photography, Cooking
        skillsToLearn: [createdSkills[1]._id, createdSkills[6]._id], // Python, Yoga
        averageRating: 4.7,
        totalReviews: 35,
      },
      {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        password: 'hashedpassword202',
        bio: 'Yoga instructor and wellness coach',
        location: 'Boulder, CO',
        githubProfile: 'https://github.com/emma',
        linkedinProfile: 'https://linkedin.com/in/emma',
        skillsToTeach: [createdSkills[6]._id], // Yoga
        skillsToLearn: [createdSkills[4]._id, createdSkills[7]._id], // Spanish, Cooking
        averageRating: 4.6,
        totalReviews: 22,
      },
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} users`);

    return NextResponse.json({
      status: 'success',
      message: 'Database seeded successfully',
      skillsCreated: createdSkills.length,
      usersCreated: createdUsers.length,
      details: {
        skills: createdSkills.map(s => ({ name: s.name, id: s._id })),
        users: createdUsers.map(u => ({
          name: u.name,
          email: u.email,
          skillsToTeach: u.skillsToTeach?.length || 0,
          skillsToLearn: u.skillsToLearn?.length || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
