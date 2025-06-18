import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<{ className?: string }>;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon: Icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton }; 