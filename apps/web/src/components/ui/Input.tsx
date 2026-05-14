import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-body-sm font-semibold text-j-text-muted">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-sm border border-j-border bg-white px-4 py-2 text-body-md ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-j-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-jumia-orange focus-visible:border-jumia-orange disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error && "border-j-error focus-visible:ring-j-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-j-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
