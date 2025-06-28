import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "md", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-300 dark:border-zinc-700 border-t-green-600 dark:border-t-green-400",
        sizeClasses[size]
      )} />
      {text && (
        <p className={cn("text-gray-600 dark:text-gray-300 text-center", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <Loading size="lg" text="Carregando..." />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 p-6">
      <Loading size="md" text="Carregando dados..." />
    </div>
  );
} 