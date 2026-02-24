import { db } from './index';
import { categories, ideas, comments, user, account } from './schema';
import { CATEGORIES } from '@lp/shared';
import { randomUUID } from 'crypto';

async function seed() {
  console.log('Seeding database...');

  // Insert categories
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const id = randomUUID();
    categoryIds[cat.slug] = id;
    await db.insert(categories).values({
      id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
    }).onConflictDoNothing();
  }

  // Insert demo users
  const user1Id = randomUUID();
  const user2Id = randomUUID();
  const user3Id = randomUUID();

  await db.insert(user).values([
    { id: user1Id, name: 'Alice Johnson', email: 'alice@example.com', emailVerified: true },
    { id: user2Id, name: 'Bob Smith', email: 'bob@example.com', emailVerified: true },
    { id: user3Id, name: 'Carol Davis', email: 'carol@example.com', emailVerified: true },
  ]).onConflictDoNothing();

  // Insert accounts with hashed password (demo)
  for (const [userId, email] of [[user1Id, 'alice@example.com'], [user2Id, 'bob@example.com'], [user3Id, 'carol@example.com']]) {
    await db.insert(account).values({
      id: randomUUID(),
      accountId: email as string,
      providerId: 'credential',
      userId: userId as string,
      password: 'hashed_password_placeholder',
    }).onConflictDoNothing();
  }

  // Insert sample ideas
  const devToolsCatId = categoryIds['developer-tools'];
  const productivityCatId = categoryIds['productivity'];
  const educationCatId = categoryIds['education'];

  const idea1Id = randomUUID();
  const idea2Id = randomUUID();
  const idea3Id = randomUUID();
  const idea4Id = randomUUID();
  const idea5Id = randomUUID();
  const idea6Id = randomUUID();

  await db.insert(ideas).values([
    {
      id: idea1Id,
      title: 'AI-Powered Code Review Assistant',
      shortDescription: 'An intelligent tool that reviews your code in real-time and suggests improvements.',
      fullDescription: 'This platform integrates with your IDE to provide instant code reviews powered by large language models. It checks for bugs, security vulnerabilities, style issues, and performance problems. The assistant learns from your codebase style over time.\n\n- Real-time feedback as you type\n- Integration with GitHub, GitLab, Bitbucket\n- Custom rule configuration\n- Team-wide style enforcement',
      status: 'published',
      categoryId: devToolsCatId,
      authorId: user1Id,
      voteCount: 42,
      commentCount: 3,
    },
    {
      id: idea2Id,
      title: 'Collaborative Productivity Dashboard',
      shortDescription: 'A unified dashboard that integrates all your productivity tools in one place.',
      fullDescription: 'Stop switching between apps. This dashboard aggregates tasks from Jira, Notion, Asana, and more into a single view. AI prioritizes your tasks based on deadlines and dependencies.\n\n- Integrates with 50+ tools\n- AI-powered task prioritization\n- Team collaboration features\n- Time tracking built-in',
      status: 'published',
      categoryId: productivityCatId,
      authorId: user2Id,
      voteCount: 28,
      commentCount: 1,
    },
    {
      id: idea3Id,
      title: 'Micro-Learning Platform for Developers',
      shortDescription: 'Learn new programming concepts in 5-minute daily lessons tailored to your skill level.',
      fullDescription: 'Busy developers need continuous learning. This platform delivers bite-sized lessons that fit into your daily routine. Adaptive algorithms personalize content based on your current knowledge and goals.\n\n- 5-minute daily lessons\n- Skill-based adaptive learning\n- Hands-on coding exercises\n- Progress tracking',
      status: 'published',
      categoryId: educationCatId,
      authorId: user3Id,
      voteCount: 35,
      commentCount: 0,
    },
    {
      id: idea4Id,
      title: 'Open Source Dependency Tracker',
      shortDescription: 'Track and manage open source dependencies across all your projects automatically.',
      fullDescription: 'Managing dependencies across multiple projects is painful. This tool automatically scans your repositories, tracks versions, and alerts you to security vulnerabilities and outdated packages.\n\n- Automatic repository scanning\n- Security vulnerability alerts\n- License compliance checking\n- Update automation via PRs',
      status: 'published',
      categoryId: devToolsCatId,
      authorId: user1Id,
      voteCount: 19,
      commentCount: 0,
    },
    {
      id: idea5Id,
      title: 'Smart Meeting Summarizer',
      shortDescription: 'Automatically transcribe and summarize your meetings with action items extracted.',
      fullDescription: 'Never miss a meeting action item again. This tool records, transcribes, and summarizes meetings automatically. It identifies action items, assigns them to participants, and integrates with your project management tools.\n\n- Real-time transcription\n- AI-powered summary generation\n- Action item extraction\n- Calendar and task integration',
      status: 'published',
      categoryId: productivityCatId,
      authorId: user2Id,
      voteCount: 55,
      commentCount: 2,
    },
    {
      id: idea6Id,
      title: 'Peer-to-Peer Skill Exchange',
      shortDescription: 'Exchange skills with other professionals — teach what you know, learn what you need.',
      fullDescription: 'A marketplace where professionals trade skills without money. You offer hours of your expertise in exchange for learning from others. A time-banking system ensures fair exchange.\n\n- Skill matching algorithm\n- Time banking system\n- Video session platform\n- Reputation system',
      status: 'published',
      categoryId: educationCatId,
      authorId: user3Id,
      voteCount: 31,
      commentCount: 0,
    },
  ]);

  // Insert comments
  await db.insert(comments).values([
    {
      id: randomUUID(),
      content: 'This is exactly what I\'ve been looking for! Would love to see VS Code integration.',
      ideaId: idea1Id,
      authorId: user2Id,
    },
    {
      id: randomUUID(),
      content: 'Great idea! How would you handle proprietary codebases with sensitive information?',
      ideaId: idea1Id,
      authorId: user3Id,
    },
    {
      id: randomUUID(),
      content: 'Love this concept. The Notion integration would be a game changer for me.',
      ideaId: idea2Id,
      authorId: user1Id,
    },
    {
      id: randomUUID(),
      content: 'I\'d pay for this immediately. The calendar integration is key.',
      ideaId: idea5Id,
      authorId: user1Id,
    },
    {
      id: randomUUID(),
      content: 'Finally someone is building this! Zoom integration would be essential.',
      ideaId: idea5Id,
      authorId: user3Id,
    },
    {
      id: randomUUID(),
      content: 'The idea1 has an extra comment',
      ideaId: idea1Id,
      authorId: user1Id,
    },
  ]);

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
