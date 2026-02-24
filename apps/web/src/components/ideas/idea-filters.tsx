'use client';

import { Select } from '@/components/ui/select';
import { type Category } from '@lp/shared';
import { SORT_OPTIONS } from '@lp/shared';

interface IdeaFiltersProps {
  categories?: Category[];
  categoryId?: string;
  sort?: string;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: string) => void;
}

export function IdeaFilters({
  categories = [],
  categoryId = '',
  sort = 'newest',
  onCategoryChange,
  onSortChange,
}: IdeaFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-44"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </Select>

      <Select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-40"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
