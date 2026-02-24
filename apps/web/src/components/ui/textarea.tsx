import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  showCounter?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCounter, maxLength, value, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(
      typeof value === 'string' ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div>
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {showCounter && maxLength && (
            <p className={cn('text-xs ml-auto', charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-gray-400')}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
