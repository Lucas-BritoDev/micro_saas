import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    className={cn("bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-700 rounded-xl shadow-sm p-6 mb-4", className)} 
    {...props} 
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'blue' | 'orange' }
>(({ className, variant = 'default', ...props }, ref) => {
  let color = '';
  if (variant === 'blue') color = 'bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-xl p-4';
  else if (variant === 'orange') color = 'bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-t-xl p-4';
  else color = 'p-4';
  return (
    <div 
      ref={ref}
      className={cn(color, className)} 
      {...props} 
    />
  );
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 
    ref={ref}
    className={cn("text-xl font-bold text-gray-900 dark:text-gray-100", className)} 
    {...props} 
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p 
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-300", className)} 
    {...props} 
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    className={cn("p-2", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
