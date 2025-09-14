import React, { forwardRef } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';
// Removed unused import: createCompleteInteractionStates

// Card Root Component
export interface CardProps extends BaseComponentProps {
  /** Visual variant of the card */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Whether the card is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      variant = 'default',
      interactive = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-lg transition-colors duration-200';

    const variantClasses = {
      default:
        'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
      outlined:
        'bg-transparent border border-neutral-300 dark:border-neutral-600',
      elevated:
        'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700',
    };

    const interactiveClasses = interactive
      ? cn(
          'cursor-pointer transition-colors duration-200 ease-in-out',
          // Subtle hover state - light background and border changes only
          'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/25',
          'hover:border-neutral-300 dark:hover:border-neutral-600',
          // Minimal focus state for accessibility
          'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-2',
          'dark:focus:ring-offset-neutral-900',
          // Enhanced focus visibility for keyboard navigation
          'focus-visible:ring-2',
          // Subtle active state
          'active:bg-neutral-100/50 dark:active:bg-neutral-800/50'
        )
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? e => {
                if ((e.key === 'Enter' || e.key === ' ') && onClick) {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends BaseComponentProps {
  /** Whether to show a divider below the header */
  divider?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, divider = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-8 py-6',
          divider && 'border-b border-neutral-200 dark:border-neutral-700',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
export interface CardContentProps extends BaseComponentProps {
  /** Padding variant for the content */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, padding = 'md', ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'px-6 py-4',
      md: 'px-8 py-6',
      lg: 'px-10 py-8',
    };

    return (
      <div
        ref={ref}
        className={cn(paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends BaseComponentProps {
  /** Whether to show a divider above the footer */
  divider?: boolean;
  /** Alignment of footer content */
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  (
    { className, children, divider = false, align = 'right', ...props },
    ref
  ) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'px-8 py-6 flex items-center',
          alignClasses[align],
          divider && 'border-t border-neutral-200 dark:border-neutral-700',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Card Title Component (helper for common header content)
export interface CardTitleProps extends BaseComponentProps {
  /** HTML heading level */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, level = 3, ...props }, ref) => {
    const headingProps = {
      ref,
      className: cn(
        'text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed',
        className
      ),
      ...props,
      children,
    };

    switch (level) {
      case 1:
        return <h1 {...headingProps} />;
      case 2:
        return <h2 {...headingProps} />;
      case 3:
        return <h3 {...headingProps} />;
      case 4:
        return <h4 {...headingProps} />;
      case 5:
        return <h5 {...headingProps} />;
      case 6:
        return <h6 {...headingProps} />;
      default:
        return <h3 {...headingProps} />;
    }
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description Component (helper for common header content)
export interface CardDescriptionProps extends BaseComponentProps {}

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';
