import React from "react";
import { cn } from "@/lib/utils"; // if you're using shadcn utils
// If not using shadcn, replace cn with simple template string

interface LoaderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoaderButton: React.FC<LoaderButtonProps> = ({
  children,
  isLoading = false,
  loadingText,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg transition-colors",
        "hover:bg-primary/90",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}

      {isLoading ? loadingText ?? "Processing..." : children}
    </button>
  );
};