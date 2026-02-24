export const CATEGORIES = [
  { name: 'Developer Tools', slug: 'developer-tools', description: 'Tools and platforms for developers', color: '#6366f1' },
  { name: 'E-commerce', slug: 'e-commerce', description: 'Online shopping and retail solutions', color: '#ec4899' },
  { name: 'Health & Wellness', slug: 'health-wellness', description: 'Healthcare and fitness innovations', color: '#10b981' },
  { name: 'Smart Home', slug: 'smart-home', description: 'IoT and home automation', color: '#f59e0b' },
  { name: 'Food & Beverage', slug: 'food-beverage', description: 'Culinary and dining experiences', color: '#ef4444' },
  { name: 'Finance', slug: 'finance', description: 'Financial services and fintech', color: '#3b82f6' },
  { name: 'Education', slug: 'education', description: 'Learning platforms and edtech', color: '#8b5cf6' },
  { name: 'Productivity', slug: 'productivity', description: 'Tools to boost efficiency', color: '#06b6d4' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Media, gaming, and content', color: '#f97316' },
  { name: 'Social Network', slug: 'social-network', description: 'Community and communication', color: '#84cc16' },
  { name: 'Travel & Tourism', slug: 'travel-tourism', description: 'Travel experiences and booking', color: '#14b8a6' },
  { name: 'Sustainability', slug: 'sustainability', description: 'Environmental and eco solutions', color: '#22c55e' },
] as const;

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Voted', value: 'most_voted' },
  { label: 'Most Commented', value: 'most_commented' },
] as const;

export const TRENDING_PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
] as const;

export const API_ROUTES = {
  IDEAS: '/api/ideas',
  CATEGORIES: '/api/categories',
  COMMENTS: (ideaId: string) => `/api/ideas/${ideaId}/comments`,
  VOTE: (ideaId: string) => `/api/ideas/${ideaId}/vote`,
  TRENDING: '/api/ideas/trending',
  MY_IDEAS: '/api/ideas/my',
} as const;
