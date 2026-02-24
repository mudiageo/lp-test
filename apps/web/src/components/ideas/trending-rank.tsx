import { TrendingUp } from 'lucide-react';

interface TrendingRankProps {
  rank: number;
}

export function TrendingRank({ rank }: TrendingRankProps) {
  return (
    <div className="flex flex-col items-center justify-center w-12 gap-1">
      <span className="text-lg font-bold text-gray-700">#{rank}</span>
      <TrendingUp className="h-4 w-4 text-green-500" />
    </div>
  );
}
